// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { Web3 } = require('web3');
const QRCode = require('qrcode');


const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BLOCKCHAIN_PROVIDER = process.env.BLOCKCHAIN_PROVIDER || 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5C64bbeB2dDB1391696FAE54ae6F89cf4eB114c2';

// Create and initialize Web3 instance directly with the provider URL
const web3 = new Web3(BLOCKCHAIN_PROVIDER);

// Initialize the smart contract
const contract = new web3.eth.Contract(require('./contracts/RepuChain.json').abi, CONTRACT_ADDRESS);

// Database connection pool
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'repuchain',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length);
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.send('RepuChain Backend');
});

// POST /auth/login - Verifies wallet signature and handles user record
app.post('/auth/login', async (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(400).json({ error: 'Address and signature are required.' });
  }

  try {
    const message = `Sign in with address ${address}`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature.' });
    }

    // Check if the user exists in the database
    const [rows] = await dbPool.query(
      'SELECT * FROM Users WHERE wallet_address = ?',
      [address]
    );

    if (rows.length === 0) {
      // User does not exist, create a new user without setting role
      await dbPool.query(
        'INSERT INTO Users (wallet_address, update_time) VALUES (?, NOW())',
        [address]
      );
      console.log(`New user created with address: ${address}`);
    } else {
      // User exists, update the update_time
      await dbPool.query(
        'UPDATE Users SET update_time = NOW() WHERE wallet_address = ?',
        [address]
      );
      console.log(`Existing user updated with address: ${address}`);
    }

    // Generate JWT token
    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the client
    return res.json({ token });
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
});
function toBytes32(value) {
  const utf8Encoder = new TextEncoder(); // Built-in encoder for UTF-8
  const bytes = utf8Encoder.encode(value); // Convert string to UTF-8 byte array

  if (bytes.length > 32) {
    throw new Error("String too long for bytes32");
  }

  // Create a 32-byte array and copy the UTF-8 bytes into it
  const bytes32 = new Uint8Array(32);
  bytes32.set(bytes); // Copy the string bytes into the beginning of the array

  // Convert to hexadecimal format prefixed with '0x'
  return '0x' + Array.from(bytes32).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyCredential(credentialId, userAddress, issuer) {
  try {
    // Fetch credential from blockchain
    const credentialIdBytes32 = toBytes32(credentialId);
    const credential = await contract.methods.credentials(credentialIdBytes32).call();

    if (!credential) {
      return { valid: false, message: "Credential does not exist" };
    }

    // Validate ownership
    if (credential.owner.toLowerCase() !== userAddress.toLowerCase()) {
      return { valid: false, message: "Credential ownership mismatch" };
    }

    // Validate issuer
    if (credential.issuer.toLowerCase() !== issuer.toLowerCase()) {
      return { valid: false, message: "Credential issuer mismatch" };
    }
    // Validate the issuer

    // TODO: We can improve this feature by add isCertifiedIssuer logic into solidity
    // but this implementation can be too complex for now

    // const isCertifiedIssuer = await contract.methods.isCertifiedIssuer(credential.issuer).call();
    // if (!isCertifiedIssuer) {
    //   return { valid: false, message: "Issuer is not authorized" };
    // }

    // Validate expiry (if applicable)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (parseInt(credential.expiryDate, 10) < currentTimestamp) {
      return { valid: false, message: "Credential has expired" };
    }

    return { valid: true, message: "Credential is valid" };
  } catch (error) {
    console.error("Error verifying credential:", error);
    return { valid: false, message: "Error during credential verification" };
  }
}

app.post("/verify-credential", async (req, res) => {
  const { credentialId, userAddress, issuer } = req.body;

  if (!credentialId || !userAddress || ! issuer) {
    return res.status(400).json({ valid: false, message: "Credential ID, user address and info are required" });
  }

  const result = await verifyCredential(credentialId, userAddress, issuer);
  return res.status(result.valid ? 200 : 400).json(result);
});

// GET /user/profile - Get user profile
app.get('/user/profile', authenticateToken, async (req, res) => {
  const { address } = req.user;
  console.log(address);

  try {
    const [rows] = await dbPool.query(
      'SELECT username, email, wallet_address, role, created_time, update_time FROM Users WHERE wallet_address = ?',
      [address]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    return res.json({
      username: user.username,
      email: user.email,
      wallet_address: user.wallet_address,
      role: user.role,
      created_time: user.created_time,
      update_time: user.update_time,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /user/profile - Update user profile
app.put('/user/profile', authenticateToken, async (req, res) => {
  const { username, email, role } = req.body;
  const { address } = req.user;

  if (!username || !email || !role) {
    return res.status(400).json({ error: 'Username, email, and role are required.' });
  }

  if (!['Personal', 'Certified Party'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified. Must be "Personal" or "Certified Party".' });
  }

  try {
    await dbPool.query(
      'UPDATE Users SET username = ?, email = ?, role = ?, update_time = NOW() WHERE wallet_address = ?',
      [username, email, role, address]
    );

    return res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});


// Helper function to get credential details by credentialId
async function getCredentialById(credentialId) {
  return await contract.methods.credentials(credentialId).call();
}

// GET /credentials - Get all credentials for a user (both received and issued)
app.get('/credentials', authenticateToken, async (req, res) => {
  const { address } = req.user;

  try {
    // Fetch received and issued credentials by the user
    const receivedCredentialIds = await contract.methods.getUserReceivedCredentials(address).call();
    const issuedCredentialIds = await contract.methods.getUserIssuedCredentials(address).call();

    // Fetch details for each received credential
    const receivedCredentials = await Promise.all(receivedCredentialIds.map(async (credentialId) => {
      const credential = await getCredentialById(credentialId);
      return {
        credentialId,
        owner: credential.owner,
        issuer: credential.issuer,
        credentialType: credential.credentialType,
        description: credential.description,
        issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
      };
    }));

    // Fetch details for each issued credential
    const issuedCredentials = await Promise.all(issuedCredentialIds.map(async (credentialId) => {
      const credential = await getCredentialById(credentialId);
      return {
        credentialId,
        owner: credential.owner,
        issuer: credential.issuer,
        credentialType: credential.credentialType,
        description: credential.description,
        issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
      };
    }));

    return res.json({
      received: receivedCredentials,
      issued: issuedCredentials,
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

const TinyURL = require('tinyurl');

// GET /credentials/:credentialId/share - Generate QR Code for a specific credential
app.get('/credentials/:credentialId/share', authenticateToken, async (req, res) => {
  const { credentialId } = req.params;
  const { address } = req.user;

  try {
    // Get credential from blockchain to verify ownership or issuing rights
    const credential = await getCredentialById(credentialId);

    if (!credential || (credential.owner.toLowerCase() !== address.toLowerCase() && credential.issuer.toLowerCase() !== address.toLowerCase())) {
      return res.status(403).json({ error: 'You do not have permission to share this credential' });
    }

    // Create a shareable link
    const originalShareLink = `${FRONTEND_BASE_URL}/share/credential/${credentialId}`;

    // Shorten the link
    TinyURL.shorten(originalShareLink, function (shortenedLink) {
      if (!shortenedLink) {
        return res.status(500).json({ error: 'Failed to generate short URL' });
      }

      // Generate QR code from shortened link
      QRCode.toDataURL(shortenedLink, (err, qrCodeUrl) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Failed to generate QR code' });
        }

        return res.json({ shareLink: shortenedLink, qrCodeUrl });
      });
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// GET /credentials/shareAll - Generate QR Code for all credentials of a user
app.get('/credentials/shareAll', authenticateToken, async (req, res) => {
  const { address } = req.user;

  try {
    // Create a shareable link for all credentials of the user
    const shareLink = `${FRONTEND_BASE_URL}/share/all/${address}`;
    const qrCodeUrl = await QRCode.toDataURL(shareLink);

    return res.json({ shareLink, qrCodeUrl });
  } catch (error) {
    console.error('Error generating QR code for all credentials:', error);
    return res.status(500).json({ error: 'Failed to generate QR code for all credentials' });
  }
});

// GET /share/credential/:credentialId - Serve credential details for a shared link
app.get('/share/credential/:credentialId', async (req, res) => {
  const { credentialId } = req.params;

  try {
    // Fetch the credential details from the blockchain
    const credential = await getCredentialById(credentialId);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Format the credential details to return as response
    const formattedCredential = {
      credentialId,
      owner: credential.owner,
      issuer: credential.issuer,
      credentialType: credential.credentialType,
      description: credential.description,
      issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
    };

    return res.json(formattedCredential);
  } catch (error) {
    console.error('Error fetching shared credential:', error);
    return res.status(500).json({ error: 'Failed to fetch shared credential' });
  }
});

// GET /share/all/:address - Serve details of all credentials for a shared link
app.get('/share/all/:address', async (req, res) => {
  const { address } = req.params;

  try {
    // Fetch received and issued credentials by the user
    const receivedCredentialIds = await contract.methods.getUserReceivedCredentials(address).call();
    const issuedCredentialIds = await contract.methods.getUserIssuedCredentials(address).call();

    // Fetch details for each received credential
    const receivedCredentials = await Promise.all(receivedCredentialIds.map(async (credentialId) => {
      const credential = await getCredentialById(credentialId);
      return {
        credentialId,
        owner: credential.owner,
        issuer: credential.issuer,
        credentialType: credential.credentialType,
        description: credential.description,
        issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
      };
    }));

    // Fetch details for each issued credential
    const issuedCredentials = await Promise.all(issuedCredentialIds.map(async (credentialId) => {
      const credential = await getCredentialById(credentialId);
      return {
        credentialId,
        owner: credential.owner,
        issuer: credential.issuer,
        credentialType: credential.credentialType,
        description: credential.description,
        issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
      };
    }));

    // Return all credentials of the user as response
    return res.json({
      received: receivedCredentials,
      issued: issuedCredentials,
    });
  } catch (error) {
    console.error('Error fetching all credentials for user:', error);
    return res.status(500).json({ error: 'Failed to fetch all credentials for user' });
  }
});


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
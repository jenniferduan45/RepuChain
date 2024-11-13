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
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x20a113f8723F1479D3444012Af8ed9C616b29b38';

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

// GET /credentials - Get all credentials for a user directly from the blockchain
app.get('/credentials', authenticateToken, async (req, res) => {
  const { address } = req.user;

  try {
    // Call the blockchain smart contract to retrieve credential IDs for the user
    const credentialIds = await contract.methods.getUserCredentials(address).call();

    // Fetch each credential based on credential IDs
    const credentials = await Promise.all(
      credentialIds.map(async (credentialId) => {
        const credential = await contract.methods.credentials(credentialId).call();
        return {
          credentialId,
          owner: credential.owner,
          issuer: credential.issuer,
          credentialType: credential.credentialType,
          description: credential.description,
          issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
        };
      })
    );

    return res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials from blockchain:', error);
    return res.status(500).json({ error: 'Failed to fetch credentials from blockchain' });
  }
});

// GET /credentials/:credentialId/share - Generate QR Code for a specific credential
const TinyURL = require('tinyurl');

app.get('/credentials/:credentialId/share', authenticateToken, async (req, res) => {
  const { credentialId } = req.params;
  const { address } = req.user;

  try {
    // Get credential from blockchain to verify ownership
    const credential = await contract.methods.credentials(credentialId).call();

    if (!credential || credential.owner.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({ error: 'You do not have permission to share this credential' });
    }

    // Create a shareable link
    const originalShareLink = `${FRONTEND_BASE_URL}/share/credential/${credentialId}`;

    // Shorten the link
    TinyURL.shorten(originalShareLink, function(shortenedLink) {
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
    const credential = await contract.methods.credentials(credentialId).call();

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Format the credential details to return as response
    const formattedCredential = {
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
    // Fetch all credential IDs associated with the user address
    const credentialIds = await contract.methods.getUserCredentials(address).call();

    // Fetch each credential based on the credential IDs
    const credentials = await Promise.all(
      credentialIds.map(async (credentialId) => {
        const credential = await contract.methods.credentials(credentialId).call();
        return {
          credentialId,
          owner: credential.owner,
          issuer: credential.issuer,
          credentialType: credential.credentialType,
          description: credential.description,
          issueDate: new Date(parseInt(credential.issueDate) * 1000).toLocaleString(),
        };
      })
    );

    if (credentials.length === 0) {
      return res.status(404).json({ error: 'No credentials found for this user' });
    }

    // Return all credentials of the user as response
    return res.json(credentials);
  } catch (error) {
    console.error('Error fetching all credentials for user:', error);
    return res.status(500).json({ error: 'Failed to fetch all credentials for user' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
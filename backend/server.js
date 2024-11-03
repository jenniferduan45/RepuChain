const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your_jwt_secret'; // change later

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

module.exports = connection;

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('RepuChain Backend');
});

 




// POST /auth/login - Verifies wallet signature and returns JWT
app.post('/auth/login', async (req, res) => {
  const { address, signature } = req.body;

  try {
    const message = `Sign in with address ${address}`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// POST /institutions/register - Registers institution, restricted to contract owner
app.post('/institutions/register', verifyJWT, (req, res) => {
  const { institutionAddress } = req.body;

  // Only allow contract owner to register institutions
  if (req.user.address !== '0xContractOwnerAddress') {
    return res.status(403).json({ error: 'Only contract owner allowed' });
  }

  // Logic to register institution goes here

  return res.json({ message: 'Institution registered' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const cors = require('cors'); // Import cors

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your_jwt_secret'; // change later

// Remove or comment out MySQL code since it's not being used
// const mysql = require('mysql2/promise');
// const connection = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT
// });
// module.exports = connection;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Root route
app.get('/', (req, res) => {
  res.send('RepuChain Backend');
});

// POST /auth/login - Verifies wallet signature and returns JWT
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

    // Skip database operations
    // Directly generate JWT token
    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the client
    return res.json({ token });
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
});

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
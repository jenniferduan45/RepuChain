// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Import mysql2/promise
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
      // User does not exist, create a new user
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
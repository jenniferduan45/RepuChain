// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
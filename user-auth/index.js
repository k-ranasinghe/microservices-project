import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'User Auth service is healthy' });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const existing = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
  if (existing.rowCount > 0) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id', [username, passwordHash]);
  res.status(201).json({ id: result.rows[0].id, username });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT id, password_hash FROM users WHERE username=$1', [username]);
  if (result.rowCount === 0) return res.status(401).json({ message: 'Unauthorized' });

  const user = result.rows[0];
  const match = bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Unauthorized' });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    res.json({ valid: true, decoded });
  });
});

app.listen(3000, () => {
  console.log('User Auth service listening on :3000');
});

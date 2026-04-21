require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VULNERABILITY 4.5: Insecure Session Configuration
// - No httpOnly flag (allows JavaScript access to cookies)
// - No secure flag (allows transmission over HTTP)
// - No sameSite attribute (vulnerable to CSRF)
// - Long expiration (24 hours)
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'insecure_secret_key_v1',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: false,
    sameSite: false
  }
}));

// Frontend now served separately via nginx

app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1-vulnerable' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AuthX v1 (Vulnerable) running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

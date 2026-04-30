require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');
const ticketsRoutes = require('./routes/tickets');
const { generalLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIX 4.3: Apply general rate limiting to all routes
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/tickets', ticketsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v2-secure' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AuthX v2 (Secure) running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

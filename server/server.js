import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { router } from './auction.routes.js';

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 60 });

// Configure CORS to accept requests from your IP and localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://192.168.227.55:5173', // Your IP address
  'http://your.other.ip:5173'   // Add any other IPs you need
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin attempted:', origin);
      return callback(null, true); // Allow all origins in development
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add OPTIONS handling
app.options('*', cors());

app.use(express.json());

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Make cache available to routes
app.use((req, res, next) => {
  req.cache = cache;
  next();
});

// Routes
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
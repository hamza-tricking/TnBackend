const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://dmtart.pro', 
    'https://tn-seven.vercel.app', 
    'https://tn-4k58ezjei-benchadimohamedhamza-8679s-projects.vercel.app',
    'http://localhost:3001', // Additional localhost port
    'http://127.0.0.1:3000', // Localhost IP
    'http://127.0.0.1:3001',  // Localhost IP additional port
    'http://localhost:3002', // Additional port
    'http://127.0.0.1:3002'  // Additional port IP
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000', 
    'https://dmtart.pro', 
    'https://tn-seven.vercel.app', 
    'https://tn-4k58ezjei-benchadimohamedhamza-8679s-projects.vercel.app',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002'
  ];
  
  if (allowedOrigins.includes(origin) || origin?.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.send(204);
});
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Database connection
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping';

// Fix truncated database name if needed
if (mongoUri.includes('/tn-shopping>')) {
    mongoUri = mongoUri.replace('/tn-shopping>', '/tn-shopping');
    console.log('🔧 Fixed truncated database name in URI');
}

console.log('🔗 Connecting to MongoDB with URI:', mongoUri);
mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.get('/', (req, res) => {
  res.json({ message: 'TN Backend API is running!' });
});

// Import routes
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/home-content', require('./routes/homeContent'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

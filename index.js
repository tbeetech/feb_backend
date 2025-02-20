const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const app = express();
require('dotenv').config();

// middleware setup
app.use(express.json({limit: '25mb'}));
app.use(cors({
    origin: ['https://feb-luxury.vercel.app', 'http://localhost:5173'],
    credentials: true
}));

// API Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Database connection
mongoose.connect(process.env.DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Basic route for testing
app.get('/api', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// For Vercel, we export the app instead of calling listen
module.exports = app;
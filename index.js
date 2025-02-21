const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const app = express();
require('dotenv').config();

// middleware setup
app.use(express.json({limit: '25mb'}));
app.use(cors({
    origin: ['https://febluxury.com','https://feb-backend.vercel.app', 'https://feb-frontend.vercel.app', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
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
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// For Vercel, we export the app instead of calling listen
const PORT = process.env.PORT || 5000;

// Always start the server (remove the environment check)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
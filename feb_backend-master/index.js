const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

// middleware setup
app.use(express.json({limit: '25mb'}));

// CORS configuration first
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://knitbi.vercel.app',
            'https://knitbi.com',
            'https://www.knitbi.com',
            'https://febluxury.com',
            'https://www.febluxury.com',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5000',
            'http://localhost:5001',
            'https://feb-backend.vercel.app'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'x-requested-with'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Handle redirects before CORS
app.use((req, res, next) => {
    const host = req.get('host');
    // Only redirect in production
    if (process.env.NODE_ENV === 'production' && host.startsWith('www.')) {
        return res.redirect(301, `https://febluxury.com${req.url}`);
    }
    next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// API Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewRoutes = require('./src/reviews/reviews.router');
const emailRoutes = require('./src/routes/email.routes');
const orderRoutes = require('./src/routes/orders.route');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', emailRoutes);

// Database connection
mongoose.connect(process.env.DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Knitbi 100% Handmade Crochet Wears Backend API is running!' });
});

// Basic route for testing
app.get('/api', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
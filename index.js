const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

// middleware setup
app.use(express.json({limit: '25mb'}));

// CORS configuration
const corsOptions = {
    origin: function(origin, callback) {
        // List of allowed origins
        const allowedOrigins = [
            'https://febluxury.com',
            'https://www.febluxury.com',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5000'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    maxAge: 86400 // CORS preflight cache for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Handle redirects after CORS
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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', emailRoutes);

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
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
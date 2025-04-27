const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://feb-luxury.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/orders', require('./routes/orders.route'));
app.use('/api/products', require('./products/products.route'));
app.use('/api/users', require('./users/user.route'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/email', require('./routes/email.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
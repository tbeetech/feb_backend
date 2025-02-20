const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

// middleware setup
app.use(express.json({limit: '25mb'}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://yourproductiondomain.com'  // replace with your production domain
        : ['http://localhost:5173', 'http://localhost:5000'],
    credentials: true
};
app.use(cors(corsOptions));

// API Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Database connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB is successfully connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

// Frontend serving setup
if (process.env.NODE_ENV === 'production') {
    // Serve static files
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    // Handle all other routes by serving the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
} else {
    // Development environment
    app.get('/api', (req, res) => {
        res.send('febluxury API is running!');
    });
}

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

startServer();
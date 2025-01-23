const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bookRouter = require('./src/routes/bookRouter');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:19006', 
        'http://192.168.1.5:19006', 
        'exp://192.168.1.5:19000',
        'http://10.0.2.2:19006', // Android Emulator
        'http://localhost:19000',
        'exp://localhost:19000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./src/routes/authRouter'));
app.use('/api/users', require('./src/routes/userRouter'));
app.use('/api/booking', require('./src/routes/bookRouter'));
app.use('/api/book', bookRouter);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Connect to MongoDB
const connectDB = require('./src/config/db');
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Log all registered routes
    console.log('Registered routes:');
    app._router.stack
        .filter(r => r.route)
        .forEach(r => {
            console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
        });
});

// 404 handler
app.use((req, res, next) => {
    console.log('404 hit for:', req.method, req.url);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
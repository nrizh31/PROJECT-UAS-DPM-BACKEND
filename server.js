const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bookRouter = require('./src/routes/bookRouter');

const app = express();

// Improved CORS configuration
app.use(cors({
    origin: '*', // Temporarily allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Better request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/auth', require('./src/routes/authRouter'));
app.use('/api/users', require('./src/routes/userRouter'));
app.use('/api/booking', require('./src/routes/bookRouter'));
app.use('/api/book', bookRouter);

// Test route with detailed response
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongodbUri: process.env.MONGODB_URI ? 'Configured' : 'Missing'
    });
});

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully');
        
        // Start server only after DB connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Available on:');
            console.log(`  - http://localhost:${PORT}`);
            console.log(`  - http://127.0.0.1:${PORT}`);
            console.log(`  - http://192.168.1.5:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Improved error handler
app.use((err, req, res, next) => {
    console.error('Global error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        headers: req.headers
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
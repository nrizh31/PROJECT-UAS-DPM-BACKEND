const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRouter = require('./src/routes/authRouter');
const userRouter = require('./src/routes/userRouter'); 
const bookRouter = require('./src/routes/bookRouter');

const app = express();

app.use(cors({
   origin: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
   credentials: true,
   maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({ extendednt: true }));

app.use((req, res, next) => {
   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
   next();
});

// Updated routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/book', bookRouter);

app.get('/api/health', (req, res) => {
   res.json({ 
       status: 'up',
       timestamp: new Date().toISOString(),
       environment: process.env.NODE_ENV
   });
});

// Check MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected:', process.env.MONGODB_URI))
  .catch(err => console.error('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
   console.log(`Server running on port ${PORT}`);
   console.log('Available on:');
   console.log(`  - http://localhost:${PORT}`);
   console.log(`  - http://127.0.0.1:${PORT}`);
   console.log(`  - http://10.0.2.2:${PORT} (Android Emulator)`);
});

app.use((err, req, res, next) => {
   console.error('Server error:', {
       message: err.message,
       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
   });
   
   res.status(err.status || 500).json({
       success: false,
       message: err.message || 'Internal server error'
   });
});

process.on('unhandledRejection', (err) => {
   console.error('Unhandled Promise Rejection:', err);
});
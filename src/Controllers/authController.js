const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password, nama } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            const user = new User({
                username,
                email,
                password,
                nama
            });

            await user.save();

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed'
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Login attempt with:', { email }); // Debug log

            // Find user by email
            const user = await User.findOne({ email });
            console.log('User found in DB:', user ? 'Yes' : 'No'); // Debug log
            
            if (!user) {
                console.log('User not found for email:', email); // Debug log
                return res.status(401).json({
                    success: false,
                    message: "Email atau password salah"
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isValidPassword); // Debug log

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Email atau password salah"
                });
            }

            // Generate token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'tiketkusecret2024',
                { expiresIn: '24h' }
            );

            // Success response
            const response = {
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    nama: user.nama,
                    role: user.isAdmin ? 'admin' : 'user'
                }
            };

            console.log('Login successful for:', email); // Debug log
            res.json(response);

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: "Terjadi kesalahan saat login",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    verifyPassword: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const isMatch = await user.verifyPassword(password);
            
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Password incorrect'
                });
            }

            res.json({
                success: true,
                message: 'Password verified'
            });
        } catch (error) {
            console.error('Verify password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
};

module.exports = authController; 
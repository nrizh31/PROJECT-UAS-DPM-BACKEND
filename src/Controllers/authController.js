const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password, nama } = req.body;
            
            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username atau email sudah terdaftar'
                });
            }

            // Buat user baru tanpa hashing manual
            const user = new User({
                username,
                email,
                password, // Password akan di-hash oleh pre-save hook
                nama
            });

            await user.save();
            console.log('User saved successfully');

            res.status(201).json({
                success: true,
                message: 'Registrasi berhasil'
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan pada server',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);

            const user = await User.findOne({ email });
            console.log('User found:', !!user);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Verifikasi password
            console.log('Verifying password...');
            const isPasswordValid = await user.verifyPassword(password);
            console.log('Password verification result:', isPasswordValid);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        username: user.username,
                        nama: user.nama
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
};

module.exports = authController;
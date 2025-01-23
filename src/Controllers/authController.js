const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            console.log('Register request received:', req.body);
            const { username, email, password, nama } = req.body;
            
            // Validasi input
            if (!username || !email || !password || !nama) {
                return res.status(400).json({
                    success: false,
                    message: 'Semua field harus diisi'
                });
            }

            // Check existing user
            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username atau email sudah terdaftar'
                });
            }

            // Create user
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                username,
                email,
                password: hashedPassword,
                nama
            });

            await user.save();
            console.log('User created successfully:', user._id);

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
            console.log('Login request received:', req.body);
            const { email, password } = req.body;

            // Validasi input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password harus diisi'
                });
            }

            // Cari user berdasarkan email
            const user = await User.findOne({ email });
            console.log('User found:', user ? 'Yes' : 'No');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Verifikasi password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Kirim response sukses
            res.status(200).json({
                success: true,
                message: 'Login berhasil',
                data: {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        nama: user.nama
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan pada server',
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
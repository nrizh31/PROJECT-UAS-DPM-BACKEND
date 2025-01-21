const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
    console.log('Register request received:', req.body);
    try {
        const { username, email, password, nama } = req.body;

        // Validasi input
        if (!username || !email || !password || !nama) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi'
            });
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Format email tidak valid'
            });
        }

        // Validasi password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter'
            });
        }

        // Check if user exists
        console.log('Checking existing user...');
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            console.log('User already exists');
            return res.status(400).json({
                success: false,
                message: 'Username atau email sudah terdaftar'
            });
        }

        // Hash password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        console.log('Creating new user...');
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            nama
        });

        console.log('User created successfully:', user._id);

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'tiketkusecret2024',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
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
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
}; 

// Login Controller
exports.login = async (req, res) => {
    console.log('Login request received:', req.body);
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        // Check if user exists
        console.log('Finding user...');
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found');
            return res.status(400).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Check password
        console.log('Verifying password...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Invalid password');
            return res.status(400).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        console.log('Login successful for user:', user._id);

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'tiketkusecret2024',
            { expiresIn: '30d' }
        );

        // Handle admin login
        if (email === 'admin@tiketku.com' && password === 'dpmkel7') {
            return res.json({
                success: true,
                data: {
                    token: 'admin-token',
                    user: {
                        id: 'admin',
                        username: 'admin',
                        email: 'admin@tiketku.com',
                        nama: 'Administrator'
                    }
                }
            });
        }

        res.json({
            success: true,
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
            error: error.message
        });
    }
};
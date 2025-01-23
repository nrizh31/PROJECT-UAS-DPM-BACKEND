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
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email }); // Debug log

        // Validasi input
        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        // Cari user berdasarkan email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No'); // Debug log

        if (!user) {
            console.log('User not found');
            return res.status(400).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Debug log

        if (!isMatch) {
            console.log('Password incorrect');
            return res.status(400).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'tiketkusecret2024',
            { expiresIn: '30d' }
        );

        // Success response
        console.log('Login successful for user:', user.email);
        res.json({
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
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                username: user.username,
                nama: user.nama
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};
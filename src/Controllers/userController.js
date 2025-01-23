const User = require('../models/user');
const bcrypt = require('bcrypt');
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

// Get profile function
const getProfile = async (req, res) => {
    try {
        // Dapatkan user berdasarkan parameter id atau username
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
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
                nama: user.nama,
                role: user.isAdmin ? 'admin' : 'user'
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil profile'
        });
    }
};

// Get all users function
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data users'
        });
    }
};

// Update profile function
exports.updateProfile = async (req, res) => {
    try {
        const { nama, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { nama, email },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

module.exports = {
    getProfile,
    getAllUsers
};
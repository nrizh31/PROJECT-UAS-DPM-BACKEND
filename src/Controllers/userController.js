const User = require('../models/user');

const userController = {
    getProfile: async (req, res) => {
        try {
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
    },

    getAllUsers: async (req, res) => {
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
    },

    updateProfile: async (req, res) => {
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
                message: 'Profile berhasil diupdate'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengupdate profile'
            });
        }
    }
};

module.exports = userController;
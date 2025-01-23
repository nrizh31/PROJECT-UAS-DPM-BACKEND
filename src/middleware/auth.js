const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tiketkusecret2024');
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Token tidak valid'
        });
    }
};

module.exports = auth;

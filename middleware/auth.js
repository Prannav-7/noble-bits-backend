const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        console.log('=== Auth Middleware ===');
        console.log('Authorization Header:', req.header('Authorization'));
        console.log('Token extracted:', token ? 'Yes' : 'No');

        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        console.log('Verifying token with JWT_SECRET...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified. User ID:', decoded.userId);

        // Find user
        const user = await User.findById(decoded.userId);
        console.log('User found:', user ? `${user.name} (${user.email})` : 'Not found');

        if (!user || !user.isActive) {
            console.log('❌ User not found or inactive');
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = decoded.userId;

        console.log('✅ Auth successful for:', user.email);
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            console.error('JWT Error: Invalid token format or signature');
        } else if (error.name === 'TokenExpiredError') {
            console.error('JWT Error: Token has expired');
        }
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
            error: error.message
        });
    }
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin rights required.'
        });
    }
};

module.exports = { auth, isAdmin };

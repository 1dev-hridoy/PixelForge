const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
    authenticate: (req, res, next) => {
   
        let token = null;
        
        // amar coo*k*e check korlam
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        
        // he***da i mean header check korlam
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        // parameter check
        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            req.user = null;
            return next();
        }
        
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log('JWT verification error:', err.message);
                req.user = null;
                return next();
            }
            
            try {
                const user = await User.findById(decoded.id);
                req.user = user || null;
                next();
            } catch (error) {
                console.log('User fetch error:', error.message);
                req.user = null;
                next();
            }
        });
    },
    
    generateToken: (user) => {
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    },

    ensureAuthenticated: (req, res, next) => {
        if (req.user) {
            return next();
        }
        res.redirect('/auth');
    }
};
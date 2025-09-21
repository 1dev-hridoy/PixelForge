const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// ata hoilo middleware admin login check korar jonno
const ensureAdminAuthenticated = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};

// hedar login page
router.get('/login', (req, res) => {
    res.render('auth/adminLogin', { error: null });
});

// cu*dir bhai admin lohin handle korlam
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === process.env.ADMINEMAIL && password === process.env.ADMINPASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.render('auth/adminLogin', { error: 'Invalid credentials' });
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

// kono kp* jate login cara access na korte pare
router.get('/', ensureAdminAuthenticated, async (req, res) => {
    try {
        const pendingOrders = await Order.find({ status: 'pending' }).populate('userId', 'name email');
        const premiumUsers = await User.find({ accountType: 'premium' }).select('name email apiKey');
        res.render('admin', { pendingOrders, premiumUsers });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send('Server error');
    }
});


router.post('/approve-order/:orderId', ensureAdminAuthenticated, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await User.findByIdAndUpdate(order.userId, { accountType: 'premium' });
        order.status = 'confirmed';
        await order.save();

        res.json({ message: 'Order approved successfully.' });

    } catch (error) {
        console.error('Approve order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/user/rename-apikey/:userId', ensureAdminAuthenticated, async (req, res) => {
    try {
        const { newApiKey } = req.body;
        await User.findByIdAndUpdate(req.params.userId, { apiKey: newApiKey });
        res.json({ message: 'User API key renamed successfully.' });
    } catch (error) {
        console.error('Rename user api key error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/user/downgrade/:userId', ensureAdminAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { accountType: 'free' });
        res.json({ message: 'User downgraded to free successfully.' });
    } catch (error) {
        console.error('Downgrade user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

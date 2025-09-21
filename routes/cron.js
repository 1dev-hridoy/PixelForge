const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimit');

router.get('/reset-daily-limits', async (req, res) => {
    try {
        if (process.env.VERCEL_CRON_SECRET && req.headers['x-vercel-cron-secret'] !== process.env.VERCEL_CRON_SECRET) {
            return res.status(401).send('Unauthorized');
        }

        await rateLimiter.resetDailyCounters();
        res.status(200).send('Daily rate limits reset successfully.');
    } catch (error) {
        console.error('Cron job error:', error);
        res.status(500).send('Error resetting daily rate limits.');
    }
});

module.exports = router;

const mongoose = require('mongoose');

const usageStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    requests: { type: Number, default: 0 },
    endpoints: [{
        path: String,
        method: String,
        count: { type: Number, default: 1 }
    }],
    statusCodes: [{
        code: Number,
        count: { type: Number, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});


usageStatsSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('UsageStats', usageStatsSchema);
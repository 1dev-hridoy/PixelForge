const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');


const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, default: 'free' },
    apiKey: { type: String, unique: true },
    usageStats: {
        totalRequests: { type: Number, default: 0 },
        dailyRequests: { type: Number, default: 0 },
        monthlyRequests: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
        minuteWindows: [{
            windowStart: { type: Date, required: true },
            requestCount: { type: Number, default: 0 }
        }]
    },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    

    const randomString = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.apiKey = settings.apiPrefix + randomString;
    
    next();
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// ei docon er leiga 45+ min laglo bal mone rakhmu
userSchema.methods.getRateLimit = function() {
    const limits = settings.rateLimit[this.accountType] || settings.rateLimit.free;
    return {
        requestsPerMinute: limits.requestsPerMinute,
        requestsPerDay: limits.requestsPerDay
    };
};

module.exports = mongoose.model('User', userSchema);
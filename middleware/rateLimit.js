const User = require('../models/User');
const UsageStats = require('../models/UsageStats');
const fs = require('fs');


const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

class RateLimiter {
    constructor() {
        this.windowSize = 60 * 1000; 
        this.maxMinuteWindows = 5;
    }

    async checkRateLimit(userId, accountType) {
        const limits = settings.rateLimit[accountType] || settings.rateLimit.free;
        const now = new Date();
        const minuteStart = new Date(now.getTime() - (now.getTime() % this.windowSize));

        try {
            const user = await User.findById(userId);
            if (!user) return { allowed: false, reason: 'User not found' };


            const recentWindows = (user.usageStats.minuteWindows || []).filter(
                window => new Date(window.windowStart) >= new Date(now.getTime() - this.windowSize)
            );
            const minuteRequests = recentWindows.reduce((sum, window) => sum + window.requestCount, 0);

            if (minuteRequests >= limits.requestsPerMinute) {
                return {
                    allowed: false,
                    reason: 'Minute rate limit exceeded',
                    remaining: 0,
                    dailyRemaining: null, 
                    reset: this.getNextReset(minuteStart)
                };
            }

            // limit check baba
            const today = new Date();
            today.setHours(0, 0, 0, 0);

                            const dailyStats = await UsageStats.findOne({
                                userId: userId,
                                date: { $gte: today }
                            });
                    
                            const dailyRequests = dailyStats ? dailyStats.requests : 0;            if (dailyRequests >= limits.requestsPerDay) {
                return {
                    allowed: false,
                    reason: 'Daily rate limit exceeded',
                    remaining: limits.requestsPerMinute - minuteRequests,
                    dailyRemaining: 0,
                    reset: this.getNextReset(today)
                };
            }

            return {
                allowed: true,
                remaining: limits.requestsPerMinute - minuteRequests,
                dailyRemaining: limits.requestsPerDay - dailyRequests,
                reset: this.getNextReset(minuteStart),
                minuteRequests,
                dailyRequests
            };

        } catch (error) {
            console.error('Rate limit check error:', error);
            return { allowed: true };  
        }
    }

    async incrementUsage(userId, endpointPath, method, statusCode) {
        try {
            const now = new Date();
            const minuteStart = new Date(now.getTime() - (now.getTime() % this.windowSize));

         
            await User.findByIdAndUpdate(userId, {
                $inc: { 
                    'usageStats.totalRequests': 1,
                    'usageStats.monthlyRequests': 1
                },
                $push: {
                    'usageStats.minuteWindows': {
                        windowStart: minuteStart,
                        requestCount: 1
                    }
                },
                $set: {
                    'usageStats.lastResetDate': now
                }
            });

         
            await User.updateOne(
                { _id: userId },
                { 
                    $pull: { 
                        'usageStats.minuteWindows': { 
                            windowStart: { $lt: new Date(now.getTime() - this.maxMinuteWindows * this.windowSize) }
                        }
                    }
                }
            );

      
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            await UsageStats.findOneAndUpdate(
                { 
                    userId: userId, 
                    date: { 
                        $gte: today, 
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
                    }
                },
                { 
                    $inc: { requests: 1 },
                    $setOnInsert: { 
                        date: today, 
                        createdAt: now 
                    },
                    $push: {
                        endpoints: { 
                            $each: [{ path: endpointPath, method: method, count: 1 }], 
                            $slice: -10 
                        },
                        statusCodes: { 
                            $each: [{ code: statusCode, count: 1 }], 
                            $slice: -5 
                        }
                    }
                },
                { upsert: true, new: true }
            );

        } catch (error) {
            console.error('Usage increment error:', error);
        }
    }

    getNextReset(date) {
        const now = new Date();
        if (date.getHours() === 0 && date.getMinutes() === 0) {
         
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        } else {
       
            const nextMinute = new Date(Math.ceil(now.getTime() / (60 * 1000)) * (60 * 1000));
            return nextMinute;
        }
    }

  
    async resetDailyCounters() {
        try {
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            await User.updateMany({
                'usageStats.lastResetDate': { $lt: today }
            }, {
                $set: {
                    'usageStats.dailyRequests': 0,
                    'usageStats.lastResetDate': now
                }
            });

            console.log('Daily rate limit counters reset');
        } catch (error) {
            console.error('Daily reset error:', error);
        }
    }
}

const rateLimiter = new RateLimiter();

module.exports = rateLimiter;
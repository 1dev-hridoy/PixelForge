const meta = {
    name: "weather",
    version: "1.0.0",
    description: "Get weather information for a city",
    author: "1dev-hridoy",
    method: "get",
    category: "utils",
    path: "/weather",
    params: {
        city: "required",
        units: "optional"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { city, units = 'metric' } = req.query;
        const user = req.user; // From rate limiting middleware
        
        if (!city) {
            return res.status(400).json({
                service: {
                    name: "My Awesome Service",
                    ownerName: "Mohammed Hridoy"
                },
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "City parameter is required",
                rateLimit: {
                    remaining: req.get('X-RateLimit-Remaining') || 0,
                    reset: req.get('X-RateLimit-Reset')
                },
                usage: {
                    accountType: user?.accountType || 'anonymous',
                    totalRequests: user?.usageStats?.totalRequests || 0
                }
            });
        }

        // Simulate weather response
        const response = {
            city,
            temperature: Math.floor(Math.random() * 30) + 15,
            description: "Clear sky",
            units,
            timestamp: new Date().toISOString(),
            requestedBy: user ? `${user.name} (${user.accountType})` : 'anonymous'
        };

        res.json({
            service: {
                name: "My Awesome Service",
                ownerName: "Mohammed Hridoy"
            },
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: response,
            error: null,
            rateLimit: {
                remaining: req.get('X-RateLimit-Remaining') || 0,
                reset: req.get('X-RateLimit-Reset')
            },
            usage: {
                accountType: user?.accountType || 'anonymous',
                totalRequests: user?.usageStats?.totalRequests || 0,
                dailyRequests: req.rateLimit?.dailyRequests || 0
            }
        });

    } catch (error) {
        res.status(500).json({
            service: {
                name: "My Awesome Service",
                ownerName: "Mohammed Hridoy"
            },
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: null,
            error: error.message,
            rateLimit: null
        });
    }
};

module.exports = { meta, handler };
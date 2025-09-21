const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const gradient = require('gradient-string');


dotenv.config();


const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


const rateLimiter = require('./middleware/rateLimit');


if (process.env.VERCEL !== '1') {
    const cron = require('node-cron');
    const rateLimiter = require('./middleware/rateLimit');

    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily rate limit reset...');
        await rateLimiter.resetDailyCounters();
    });
}


app.use(cors());
app.use(cors());
app.use(cookieParser());

const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET || 'a-secret-key-that-is-long-and-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));
app.use(require('./middleware/logger'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));
app.use(express.static(path.join(__dirname, 'public')));


const { signup, signin, profile: profileHandler } = require('./routes/auth');
const { authenticate, ensureAuthenticated } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
const cronRoutes = require('./routes/cron');
const User = require('./models/User');
const UsageStats = require('./models/UsageStats');
const Order = require('./models/Order');

app.use('/admin', adminRoutes);
app.use('/api/cron', cronRoutes);


app.post('/auth/signup', signup);
app.post('/auth/signin', signin);
app.get('/auth/profile', authenticate, profileHandler);


function loadAPIs() {
    const apiDir = path.join(__dirname, 'api');
    const apis = [];
    
    if (fs.existsSync(apiDir)) {
        const items = fs.readdirSync(apiDir, { withFileTypes: true });
        
        items.forEach(item => {
            const itemPath = path.join(apiDir, item.name);
            
            if (item.isDirectory()) {
                const files = fs.readdirSync(itemPath);
                files.forEach(file => {
                    if (file.endsWith('.js')) {
                        const filePath = path.join(itemPath, file);
                        const apiModule = require(filePath);
                        
                        if (apiModule.meta && apiModule.handler) {
                            apiModule.meta.path = apiModule.meta.path.startsWith('/') 
                                ? apiModule.meta.path 
                                : `/${item.name}${apiModule.meta.path}`;
                            apiModule.meta.category = item.name;
                            apis.push(apiModule);
                        }
                    }
                });
            } else if (item.isFile() && item.name.endsWith('.js')) {
                const apiModule = require(itemPath);
                
                if (apiModule.meta && apiModule.handler) {
                    apis.push(apiModule);
                }
            }
        });
    }
    
    return apis;
}


const apis = loadAPIs();
apis.forEach(api => {
    const routePath = `/api${api.meta.path}`;
    console.log(`Registering ${api.meta.method.toUpperCase()} ${routePath} (Rate Limited)`);
    
    app[api.meta.method.toLowerCase()](routePath, async (req, res) => {
        const startTime = Date.now();
        let responseSent = false; 
        
        try {
          
            const apiKey = req.query.key || req.headers['x-api-key'] || req.query.apiKey;
            if (!apiKey) {
                responseSent = true;
                return res.status(401).json({
                    service: { name: settings.service.name, ownerName: settings.service.ownerName },
                    api: { author: 'system', version: '1.0', category: 'auth', errorCode: 'NO_API_KEY' },
                    result: null,
                    error: 'API key required (use ?key=YOUR_API_KEY or X-API-Key header)',
                    rateLimit: null
                });
            }

    
            const user = await User.findOne({ apiKey });
            if (!user) {
                responseSent = true;
                return res.status(401).json({
                    service: { name: settings.service.name, ownerName: settings.service.ownerName },
                    api: { author: 'system', version: '1.0', category: 'auth', errorCode: 'INVALID_API_KEY' },
                    result: null,
                    error: 'Invalid API key',
                    rateLimit: null
                });
            }

        
            const accountType = user.accountType || 'free';
            const limits = settings.rateLimit[accountType] || settings.rateLimit.free;

         
            const rateLimitCheck = await rateLimiter.checkRateLimit(user._id, accountType);

            if (!rateLimitCheck.allowed) {
                responseSent = true;
                return res.status(429).json({
                    service: { name: settings.service.name, ownerName: settings.service.ownerName },
                    api: { 
                        author: 'system', 
                        version: '1.0', 
                        category: 'rate-limit',
                        errorCode: 'RATE_LIMIT_EXCEEDED'
                    },
                    result: null,
                    error: `Rate limit exceeded: ${rateLimitCheck.reason}`
                });
            }

         
            req.user = user;
            req.rateLimit = rateLimitCheck;
            
       
            res.set({
                'X-RateLimit-Limit': limits.requestsPerMinute, 
                'X-RateLimit-Remaining': rateLimitCheck.remaining,
                'X-RateLimit-Reset': rateLimitCheck.reset ? Math.floor(rateLimitCheck.reset.getTime() / 1000) : Math.floor(Date.now() / 1000) + 60,
                'X-Daily-Limit': limits.requestsPerDay,
                'X-Daily-Remaining': rateLimitCheck.dailyRemaining,
                'X-Usage-Total': user.usageStats.totalRequests || 0,
                'X-Usage-Daily': rateLimitCheck.dailyRequests || 0,
                'X-API-Key-Valid': 'true'
            });

  
            await api.handler(req, res, api.meta);
            responseSent = true;
            
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode || 200;
            
           
            if (!res.headersSent) {
                res.set('X-RateLimit-Remaining', Math.max(rateLimitCheck.remaining - 1, 0));
                res.set('X-Usage-Total', (user.usageStats.totalRequests || 0) + 1);
                res.set('X-Usage-Daily', (user.usageStats.dailyRequests || 0) + 1);
            }
            
         
            await rateLimiter.incrementUsage(
                user._id, 
                req.route.path, 
                req.method, 
                statusCode
            );

            const purpleBlue = gradient('purple', 'blue');
            const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`;
            console.log(purpleBlue(logMessage));

        } catch (error) {

            if (!responseSent) {
                console.error(`API Error [${req.method} ${req.originalUrl}]:`, error);
                
          
                if (req.user) {
                    await rateLimiter.incrementUsage(
                        req.user._id, 
                        req.route ? req.route.path : req.originalUrl, 
                        req.method, 
                        500
                    );
                }
                
                res.status(500).json({
                    service: { name: settings.service.name, ownerName: settings.service.ownerName },
                    api: { author: 'system', version: '1.0', category: 'error', errorCode: 'SERVER_ERROR' },
                    result: null,
                    error: error.message,
                    rateLimit: null
                });
            }
        }
    });
});


app.get('/api/docs', (req, res) => {
    res.json({
        service: {
            name: settings.service.name,
            ownerName: settings.service.ownerName,
            description: settings.service.description
        },
        authentication: {
            required: true,
            method: "API Key",
            usage: "Use ?key=YOUR_API_KEY query parameter OR X-API-Key header",
            examples: [
                "GET /api/weather?city=dhaka&key=PF_ABC123XYZ",
                "GET /api/ai/deepseek?query=hello&key=PF_ABC123XYZ", 
                "curl \"http://localhost:3000/api/weather?city=dhaka&key=PF_ABC123XYZ\"",
                "curl -H \"X-API-Key: PF_ABC123XYZ\" \"http://localhost:3000/api/weather?city=dhaka\""
            ]
        },
        rateLimiting: {
            enabled: true,
            plans: settings.rateLimit,
            headers: {
                "X-RateLimit-Limit": "Maximum requests per window",
                "X-RateLimit-Remaining": "Remaining requests in current window", 
                "X-RateLimit-Reset": "Unix timestamp when window resets",
                "X-Usage-Total": "Total requests made",
                "X-Usage-Daily": "Daily requests made",
                "X-API-Key-Valid": "true/false - API key validation status"
            },
            errorResponse: {
                "status": 429,
                "errorCode": "RATE_LIMIT_EXCEEDED",
                "includes": "Only service info, API metadata, error details, and rate limit info"
            },
            endpoints: "All /api/* endpoints are rate limited"
        },
        apis: apis.map(api => ({
            name: api.meta.name,
            path: `/api${api.meta.path}`,
            method: api.meta.method.toUpperCase(),
            category: api.meta.category,
            description: api.meta.description,
            params: {
                ...api.meta.params,
                key: "required - Your API key (PF_XXXXXXXXX)"
            },
            example: `${api.meta.method.toUpperCase()} /api${api.meta.path}?${Object.entries(api.meta.params)
                .filter(([key]) => key !== 'key')
                .map(([key, type]) => `${key}=value`)
                .join('&')}&key=PF_ABC123XYZ`,
            rateLimited: true,
            authenticationRequired: true
        }))
    });
});


app.get('/api/user/stats', authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth', errorCode: 'UNAUTHORIZED' },
                result: null,
                error: 'Authentication required'
            });
        }

        const user = await User.findById(req.user._id);
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const dailyStats = await UsageStats.findOne({
            userId: req.user._id,
            date: { $gte: today }
        });

        const dailyRequests = dailyStats ? dailyStats.requests : 0;

        const accountType = user.accountType || 'free';
        const limits = settings.rateLimit[accountType] || settings.rateLimit.free;
        const minuteStart = new Date(now.getTime() - (now.getTime() % 60000));
        const recentWindows = (user.usageStats.minuteWindows || []).filter(
            w => new Date(w.windowStart) >= minuteStart
        );
        const minuteRequests = recentWindows.reduce((sum, w) => sum + (w.requestCount || 0), 0);

        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'stats' },
            result: {
                user: {
                    name: user.name,
                    email: user.email,
                    accountType: accountType,
                    apiKey: user.apiKey
                },
                usage: {
                    totalRequests: user.usageStats.totalRequests || 0,
                    dailyRequests: dailyRequests,
                    monthlyRequests: user.usageStats.monthlyRequests || 0,
                    minuteRequests: minuteRequests
                },
                limits: limits,
                rateLimit: {
                    remainingMinute: Math.max(limits.requestsPerMinute - minuteRequests, 0),
                    remainingDaily: Math.max(limits.requestsPerDay - dailyRequests, 0),
                    resetTime: new Date(Math.ceil(now.getTime() / 60000) * 60000).toISOString()
                }
            },
            error: null
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error', errorCode: 'SERVER_ERROR' },
            result: null,
            error: error.message
        });
    }
});


app.post('/api/user/update', authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth', errorCode: 'UNAUTHORIZED' },
                result: null,
                error: 'Authentication required'
            });
        }

        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'validation', errorCode: 'INVALID_NAME' },
                result: null,
                error: 'Name is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        ).select('-password');

        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'user' },
            result: {
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    accountType: user.accountType
                }
            },
            error: null
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error', errorCode: 'SERVER_ERROR' },
            result: null,
            error: error.message
        });
    }
});


app.post('/api/user/regenerate-key', authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth', errorCode: 'UNAUTHORIZED' },
                result: null,
                error: 'Authentication required'
            });
        }


        const newApiKey = settings.apiPrefix + Math.random().toString(36).substring(2, 9).toUpperCase() + 
                         Math.random().toString(36).substring(2, 9).toUpperCase();
        
    
        const user = await User.findByIdAndUpdate(
            req.user._id, 
            { apiKey: newApiKey },
            { new: true }
        ).select('-password');

        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'auth' },
            result: {
                message: 'API key regenerated successfully',
                apiKey: newApiKey,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    accountType: user.accountType
                }
            },
            error: null
        });

    } catch (error) {
        console.error('Regenerate key error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error', errorCode: 'SERVER_ERROR' },
            result: null,
            error: error.message
        });
    }
});


app.get('/', (req, res) => res.render('landingpage', { settings }));

app.get('/doc', (req, res) => res.render('api', { settings, apis }));

app.get('/auth', (req, res) => {
    res.render('auth/index', { settings });
});


app.get('/profile', async (req, res) => {
    try {
  
        let token = null;
        
 
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        
     
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
     
        if (!token && req.query.token) {
            token = req.query.token;
        }

        let user = null;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-password');
                console.log('Profile - User found:', user ? user.name : 'No user');
            } catch (error) {
                console.log('Profile - Token verification failed:', error.message);
              
            }
        }

        if (user) {
         
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);

            const dailyStats = await UsageStats.findOne({
                userId: user._id,
                date: { $gte: today }
            });

            const minuteStart = new Date(now.getTime() - (now.getTime() % 60000));
            const recentWindows = (user.usageStats.minuteWindows || []).filter(
                w => new Date(w.windowStart) >= minuteStart
            );
            const minuteRequests = recentWindows.reduce((sum, w) => sum + (w.requestCount || 0), 0);

           
            const renderUser = {
                ...user.toObject(),
                isAdmin: user.email === process.env.ADMIN_EMAIL,
                usageStats: {
                    ...user.toObject().usageStats,
                    dailyRequests: dailyStats ? dailyStats.requests : 0,
                    minuteRequests: minuteRequests
                }
            };

         
            res.render('profile', { 
                settings, 
                user: renderUser 
            });
        } else {
        
            console.log('Profile - No valid token found, showing login prompt');
            res.render('profile', { 
                settings, 
                user: null,
                error: 'Please sign in to view your profile'
            });
        }
    } catch (error) {
        console.error('Profile route error:', error);
        res.redirect('/auth');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth');
});

app.get('/order-premium', authenticate, ensureAuthenticated, (req, res) => {
    res.render('order', { settings, user: req.user });
});

app.post('/submit-order', authenticate, async (req, res) => {
    try {
        const { senderNumber, transactionId } = req.body;
        const userId = req.user._id;

        if (!senderNumber || !transactionId) {
            return res.status(400).json({ error: 'Sender number and transaction ID are required.' });
        }

        const newOrder = new Order({
            userId,
            senderNumber,
            transactionId
        });

        await newOrder.save();

        res.json({ message: 'Order submitted successfully. It will be reviewed by an admin shortly.' });

    } catch (error) {
        console.error('Submit order error:', error);
        res.status(500).json({ error: 'Server error while submitting order.' });
    }
});

app.get('/upgrade-premium', (req, res) => {
    res.redirect('/order-premium');
});

app.listen(PORT, () => {
    const purpleBlue = gradient('purple', 'blue');
    console.log(purpleBlue(`\n┌───────────────────────────────────────────────────┐`));
    console.log(purpleBlue(`│ Service: ${settings.service.name} - ${settings.service.slogan}`));
    console.log(purpleBlue(`│ Owner: ${settings.service.ownerName}`));
    console.log(purpleBlue(`│ Server: http://localhost:${PORT}`));
    console.log(purpleBlue(`├───────────────────────────────────────────────────┤`));
    console.log(purpleBlue(`│ Loaded APIs:`));
    apis.forEach(api => {
        console.log(purpleBlue(`│  - ${api.meta.method.toUpperCase()} ${api.meta.path}`));
    });
    console.log(purpleBlue(`├───────────────────────────────────────────────────┤`));
    console.log(purpleBlue(`│ Total APIs Loaded: ${apis.length}`));
    console.log(purpleBlue(`└───────────────────────────────────────────────────┘\n`));
});
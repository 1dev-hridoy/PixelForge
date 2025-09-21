module.exports = (req, res, next) => {
    const start = Date.now();
    const url = req.originalUrl;
    
    console.log(`${req.method} ${url}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        console.log(`${req.method} ${url} ${status} - ${duration}ms`);
    });
    
    next();
};
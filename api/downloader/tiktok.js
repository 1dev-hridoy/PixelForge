const axios = require('axios');

const meta = {
    name: "tiktok-downloader",
    version: "0.0.1",
    description: "TikTok video downloader",
    author: "1dev-hridoy",
    method: "get",
    category: "downloader",
    path: "/tiktok",
    params: {
        url: "required"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { url: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "URL parameter is required"
            });
        }

        const encodedParams = new URLSearchParams();
        encodedParams.set('url', query);
        encodedParams.set('hd', '1');

        const response = await axios({
            method: 'POST',
            url: 'https://tikwm.com/api/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'current_language=en',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
            },
            data: encodedParams
        });

        const videos = response.data.data;
        const result = {
            id: Date.now(),
            title: videos.title,
            cover: videos.cover,
            origin_cover: videos.origin_cover,
            no_watermark: videos.play,
            watermark: videos.wmplay,
            music: videos.music,
            created: new Date().toISOString()
        };

        res.json({
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: result,
            error: null
        });

    } catch (error) {
        res.status(500).json({
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: null,
            error: error.message
        });
    }
};

module.exports = { meta, handler };
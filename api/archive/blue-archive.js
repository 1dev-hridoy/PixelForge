const axios = require('axios');

const meta = {
    name: "blue-archive",
    version: "0.0.1",
    description: "Random Blue Archive image endpoint",
    author: "1dev-hridoy",
    method: "get",
    category: "archive",
    path: "/blue-archive",
    params: {}
};

const handler = async (req, res, meta) => {
    try {
        const { data } = await axios.get('https://raw.githubusercontent.com/1dev-hridoy/1dev-hridoy/refs/heads/main/hridoy-blue-archive.json');
        const urls = data;
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        const response = {
            id: Date.now(),
            url: randomUrl,
            created: new Date().toISOString()
        };

        res.json({
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: response,
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
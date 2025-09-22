const YouTube = require('youtube-search-api');

const meta = {
    name: "youtube search",
    version: "0.0.1",
    description: "YouTube search",
    author: "1dev-hridoy",
    method: "get",
    category: "api",
    path: "/youtube-search",
    params: {
        query: "required",
        limit: "optional (default: 10)"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { query, limit } = req.query;
        
        if (!query) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Query parameter is required"
            });
        }

        const searchLimit = parseInt(limit, 10) || 10;

        const results = await YouTube.GetListByKeyword(query, false, searchLimit, { type: 'video' });

        const timestamp = Date.now();

        const result = {
            id: timestamp,
            query,
            limit: searchLimit,
            items: results.items || [],
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
        console.error('YouTube search error:', error.message);
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
const axios = require('axios');

const meta = {
    name: "search anime",
    version: "0.0.1",
    description: "Search anime by name",
    author: "1dev-hridoy",
    method: "get",
    category: "anime",
    path: "/anime/search",
    params: {
        q: "required"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Query parameter 'q' is required"
            });
        }

        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`);

        const result = {
            id: Date.now(),
            query: q,
            total: data.pagination.items.total,
            anime: data.data.map(anime => ({
                id: anime.mal_id,
                title: anime.title,
                type: anime.type,
                episodes: anime.episodes,
                status: anime.status,
                score: anime.score,
                image: anime.images.jpg.large_image_url,
                synopsis: anime.synopsis?.substring(0, 200) + '...'
            })),
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
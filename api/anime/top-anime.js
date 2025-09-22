const axios = require('axios');

const meta = {
    name: "top-anime",
    version: "0.0.1",
    description: "Get top rated anime",
    author: "1dev-hridoy",
    method: "get",
    category: "anime",
    path: "/anime/top",
    params: {
        page: "optional",
        limit: "optional"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const { data } = await axios.get(`https://api.jikan.moe/v4/top/anime?page=${pageNum}&limit=${limitNum}`);

        const result = {
            id: Date.now(),
            page: pageNum,
            limit: limitNum,
            total: data.pagination.items.total,
            anime: data.data.map(anime => ({
                mal_id: anime.mal_id,
                title: anime.title,
                title_english: anime.title_english,
                type: anime.type,
                episodes: anime.episodes,
                status: anime.status,
                aired: anime.aired.string,
                score: anime.score,
                ranked: anime.rank,
                popularity: anime.popularity,
                image: anime.images.jpg.large_image_url,
                synopsis: anime.synopsis?.substring(0, 150) + '...',
                genres: anime.genres.map(g => g.name),
                studios: anime.studios.map(s => s.name)
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
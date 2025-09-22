const axios = require('axios');

const meta = {
    name: "Random Anime",
    version: "1.0",
    description: "Get random anime recommendation",
    author: "1dev-hridoy",
    method: "get",
    category: "anime",
    path: "/anime/random",
    params: {}
};

const handler = async (req, res, meta) => {
    try {
        const { data } = await axios.get('https://api.jikan.moe/v4/random/anime');

        const anime = data.data;
        const result = {
            id: Date.now(),
            mal_id: anime.mal_id,
            title: anime.title,
            title_english: anime.title_english,
            type: anime.type,
            episodes: anime.episodes,
            status: anime.status,
            aired: anime.aired.string,
            score: anime.score,
            ranked: anime.ranked,
            popularity: anime.popularity,
            image: anime.images.jpg.large_image_url,
            synopsis: anime.synopsis,
            genres: anime.genres.map(g => g.name),
            studios: anime.studios.map(s => s.name),
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
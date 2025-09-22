const axios = require('axios');

const meta = {
    name: "ai4chat",
    version: "0.0.1",
    description: "AI4Chat completion endpoint",
    author: "1dev-hridoy",
    method: "get",
    category: "ai",
    path: "/ai4chat",
    params: {
        prompt: "required"
    }
};

const handler = async (req, res, meta) => {
    try {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Prompt parameter is required"
            });
        }

        const url = new URL("https://yw85opafq6.execute-api.us-east-1.amazonaws.com/default/boss_mode_15aug");
        url.search = new URLSearchParams({
            text: prompt,
            country: "Europe",
            user_id: "Av0SkyG00D"
        }).toString();

        const response = await axios.get(url.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Mobile Safari/537.36",
                Referer: "https://www.ai4chat.co/pages/riddle-generator"
            }
        });

        if (response.status !== 200) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = response.data;

        const aiResponse = {
            id: Date.now(),
            model: "ai4chat-boss-mode",
            content: result,
            created: new Date().toISOString()
        };

        res.json({
            api: {
                author: meta.author,
                version: meta.version,
                category: meta.category
            },
            result: aiResponse,
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
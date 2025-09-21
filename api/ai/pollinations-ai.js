const axios = require('axios');
const fs = require('fs');

const meta = {
    name: "pollinations-ai",
    version: "0.0.1",
    description: "Pollinations AI chat completion endpoint",
    author: "1dev-hridoy",
    method: "get",
    category: "ai",
    path: "/pollinations-ai",
    params: {
        query: "required",
        model: "required",
    }
};

const handler = async (req, res, meta) => {
    try {
        const { query, model = 'gpt-4.1-mini', image } = req.query;
        
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

        if (!model) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Model parameter is required"
            });
        }

        const modelList = {
            'gpt-4.1': 'openai-large',
            'gpt-4.1-mini': 'openai',
            'gpt-4.1-nano': 'openai-fast'
        };

        if (!modelList[model]) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: `Available models: ${Object.keys(modelList).join(', ')}`
            });
        }

        let imageBuffer = null;
        if (image && fs.existsSync(image)) {
            imageBuffer = fs.readFileSync(image);
        }

        const messages = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: query },
                    ...(imageBuffer ? [{
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` }
                    }] : [])
                ]
            }
        ];

        const { data } = await axios.post('https://text.pollinations.ai/openai', {
            messages,
            model: modelList[model],
            temperature: 0.5,
            presence_penalty: 0,
            top_p: 1,
            frequency_penalty: 0
        }, {
            headers: {
                accept: '*/*',
                authorization: 'Bearer dummy',
                'content-type': 'application/json',
                origin: 'https://sur.pollinations.ai',
                referer: 'https://sur.pollinations.ai/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });

        const response = {
            id: Date.now(),
            model: `pollinations-${model}`,
            content: data.choices[0].message.content,
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
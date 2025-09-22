const fs = require('fs');
const path = require('path');
const FormData = require('form-data');


let fetch;

(async () => {
    if (typeof fetch === 'undefined') {
        fetch = (await import('node-fetch')).default;
    }
})();

const meta = {
    name: "pollinations-image",
    version: "0.0.1",
    description: "Pollinations AI image generator",
    author: "1dev-hridoy",
    method: "get",
    category: "ai",
    path: "/flux-image",
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


        // below is ai api parameters u can cng
        const width = 1024;
        const height = 1024;
        const seed = 42;
        const model = 'flux';
        
        // ai main api
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
        
      
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const buffer = await response.buffer();

        const timestamp = Date.now();
        const filename = `pollinations_${timestamp}.png`;

    
        const form = new FormData();
        form.append('file', buffer, { filename });

        const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: form
        });

        const uploadData = await uploadResponse.json();
        
  
        const fileId = uploadData.data.url.split('/')[3];
        const dlUrl = `https://tmpfiles.org/dl/${fileId}/${filename}`;

        const result = {
            id: timestamp,
            prompt,
            model,
            width,
            height,
            seed,
            temp_file: filename,
            uploaded_image_url: dlUrl,
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
        console.error('Image generation error:', error.message);
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
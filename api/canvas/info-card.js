const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { InfoCardBuilder } = require('discord-card-canvas');

let fetch;

(async () => {
    if (typeof fetch === 'undefined') {
        fetch = (await import('node-fetch')).default;
    }
})();

const meta = {
    name: "discord info card",
    version: "0.0.1",
    description: "Info card generator",
    author: "1dev-hridoy",
    method: "get",
    category: "canvas",
    path: "/info-card",
    params: {
        mainText: "optional"
    }
};

const backgroundThemes = [
    { background: '#fff', waves: '#0ca7ff', name: 'blue-waves' },
    { background: '#000000', waves: '#9b59b6', name: 'purple-waves' },
    { background: '#f8f9fa', waves: '#27ae60', name: 'green-waves' },
    { background: '#2c3e50', waves: '#e74c3c', name: 'red-waves' },
    { background: '#f0f8ff', waves: '#ff6b6b', name: 'pink-waves' },
    { background: '#1a1a2e', waves: '#16213e', name: 'midnight-waves' },
    { background: '#2d1b69', waves: '#ee5a24', name: 'sunset-waves' },
    { background: '#0c0c0c', waves: '#00d4ff', name: 'cyan-waves' },
    { background: '#1e3a1e', waves: '#f39c12', name: 'forest-waves' },
    { background: '#3b0b0b', waves: '#ff4500', name: 'fire-waves' }
];

const handler = async (req, res, meta) => {
    try {
        const { mainText } = req.query;
        
    
        const randomTheme = backgroundThemes[Math.floor(Math.random() * backgroundThemes.length)];
        const backgroundOption = { background: randomTheme.background, waves: randomTheme.waves };

    
        const infoCard = await new InfoCardBuilder({
            mainText: { content: mainText || 'INFORMATION' },
            backgroundColor: backgroundOption
        }).build();

        const buffer = infoCard.toBuffer();

        const timestamp = Date.now();
        const filename = `info_card_${timestamp}.png`;

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
            mainText: mainText || 'INFORMATION',
            backgroundTheme: randomTheme.name,
            backgroundColors: {
                background: randomTheme.background,
                waves: randomTheme.waves
            },
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
        console.error('Info card generation error:', error.message);
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
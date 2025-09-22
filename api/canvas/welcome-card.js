const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { WelcomeBuilder } = require('discord-card-canvas');

let fetch;

(async () => {
    if (typeof fetch === 'undefined') {
        fetch = (await import('node-fetch')).default;
    }
})();

const meta = {
    name: "welcome card",
    version: "0.0.1",
    description: "Welcome card generator",
    author: "1dev-hridoy",
    method: "get",
    category: "canvas",
    path: "/welcome-card",
    params: {
        nickname: "required",
        secondText: "required",
        avatarImgURL: "optional"
    }
};

const backgroundThemes = [
    { background: '#1a1a2e', bubbles: '#16213e', name: 'midnight-welcome' },
    { background: '#0f0f23', bubbles: '#ff6b6b', name: 'cyber-welcome' },
    { background: '#f0f8ff', bubbles: '#ffb6c1', name: 'pastel-welcome' },
    { background: '#2d1b69', bubbles: '#ee5a24', name: 'sunset-welcome' },
    { background: '#0c0c0c', bubbles: '#00d4ff', name: 'hacker-welcome' },
    { background: '#1e3a1e', bubbles: '#27ae60', name: 'nature-welcome' },
    { background: '#3b0b0b', bubbles: '#ff4500', name: 'fire-welcome' },
    { background: '#2c3e50', bubbles: '#e74c3c', name: 'retro-welcome' },
    { background: '#000000', bubbles: '#9b59b6', name: 'neon-welcome' },
    { background: '#070d19', bubbles: '#0ca7ff', name: 'ocean-welcome' }
];

const handler = async (req, res, meta) => {
    try {
        const { nickname, secondText, avatarImgURL } = req.query;
        
        if (!nickname || !secondText) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Required parameters (nickname, secondText) are missing"
            });
        }

   
        const randomTheme = backgroundThemes[Math.floor(Math.random() * backgroundThemes.length)];
        const backgroundOption = { background: randomTheme.background, bubbles: randomTheme.bubbles };

   
        const welcomeCard = await new WelcomeBuilder({
            nicknameText: { content: nickname, color: '#FFFFFF' },
            secondText: { content: secondText, color: '#FFFFFF' },
            avatarImgURL: avatarImgURL || undefined,
            backgroundColor: backgroundOption,
            fontDefault: 'Inter'
        }).build();

        const buffer = welcomeCard.toBuffer();

        const timestamp = Date.now();
        const filename = `welcome_card_${timestamp}.png`;

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
            nickname,
            secondText,
            avatarImgURL: avatarImgURL || 'none',
            backgroundTheme: randomTheme.name,
            backgroundColors: {
                background: randomTheme.background,
                bubbles: randomTheme.bubbles
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
        console.error('Welcome card generation error:', error.message);
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
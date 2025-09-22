const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { RankCardBuilder } = require('discord-card-canvas');

let fetch;

(async () => {
    if (typeof fetch === 'undefined') {
        fetch = (await import('node-fetch')).default;
    }
})();

const meta = {
    name: "rank card",
    version: "0.0.3",
    description: "Rank card generator",
    author: "1dev-hridoy",
    method: "get",
    category: "canvas",
    path: "/rank-card",
    params: {
        nickname: "required",
        currentLvl: "required",
        currentRank: "required",
        currentXP: "required",
        requiredXP: "required",
        userStatus: "required",
        avatarImgURL: "optional"
    }
};

const backgroundThemes = [
    { background: '#070d19', bubbles: '#0ca7ff', name: 'bubbly-blue' },
    { background: '#000000', bubbles: '#9b59b6', name: 'neon-purple' },
    { background: '#1e3a1e', bubbles: '#27ae60', name: 'fantasy-green' },
    { background: '#2c3e50', bubbles: '#e74c3c', name: 'retro-pixel' },
    { background: '#3b0b0b', bubbles: '#ff4500', name: 'volcanic-red' },
    { background: '#f0f8ff', bubbles: '#ffb6c1', name: 'pastel-cute' },
    { background: '#0f0f23', bubbles: '#ff6b6b', name: 'cyber-pink' },
    { background: '#1a1a2e', bubbles: '#16213e', name: 'midnight-blue' },
    { background: '#2d1b69', bubbles: '#ee5a24', name: 'sunset-gradient' },
    { background: '#0c0c0c', bubbles: '#00d4ff', name: 'hacker-green' }
];

const handler = async (req, res, meta) => {
    try {
        const { nickname, currentLvl, currentRank, currentXP, requiredXP, userStatus, avatarImgURL } = req.query;
        
        if (!nickname || !currentLvl || !currentRank || !currentXP || !requiredXP || !userStatus) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Required parameters (nickname, currentLvl, currentRank, currentXP, requiredXP, userStatus) are missing"
            });
        }

        const lvl = parseInt(currentLvl, 10);
        const rank = parseInt(currentRank, 10);
        const xp = parseInt(currentXP, 10);
        const reqXP = parseInt(requiredXP, 10);

        if (isNaN(lvl) || isNaN(rank) || isNaN(xp) || isNaN(reqXP)) {
            return res.status(400).json({
                api: {
                    author: meta.author,
                    version: meta.version,
                    category: meta.category
                },
                result: null,
                error: "Numeric parameters (currentLvl, currentRank, currentXP, requiredXP) must be valid integers"
            });
        }

   
        const randomTheme = backgroundThemes[Math.floor(Math.random() * backgroundThemes.length)];
        const backgroundOption = { background: randomTheme.background, bubbles: randomTheme.bubbles };

        const rankCard = await new RankCardBuilder({
            nicknameText: { content: nickname },
            currentLvl: lvl,
            currentRank: rank,
            currentXP: xp,
            requiredXP: reqXP,
            userStatus,
            avatarImgURL: avatarImgURL || undefined,
            backgroundColor: backgroundOption,
            fontDefault: 'Nunito',
            colorTextDefault: '#FFFFFF'
        }).build();

        const buffer = rankCard.toBuffer();

        const timestamp = Date.now();
        const filename = `rank_card_${timestamp}.png`;

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
            currentLvl: lvl,
            currentRank: rank,
            currentXP: xp,
            requiredXP: reqXP,
            userStatus,
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
        console.error('Rank card generation error:', error.message);
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
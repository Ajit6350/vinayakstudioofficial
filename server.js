const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const API_URL = process.env.VITE_API_URL || 'https://ajit63500-vs-web.hf.space/api-proxy';

app.use(compression());

// Serve API config
app.get('/api-config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`window.API_URL = "${API_URL}";`);
});

app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800');
        } else if (filePath.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        } else if (filePath.endsWith('data.json')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌍 सर्वर चल रहा है: http://localhost:${PORT}`);
    console.log(`📂 फाइलें serve हो रही हैं: ${__dirname}`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 सर्वर बंद किया जा रहा है...');
    process.exit();
});

const https = require('https');
const fs = require('fs');
const path = require('path');

const textures = [
    { name: 'earth.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_2048.jpg/1024px-Land_ocean_ice_2048.jpg' },
    { name: 'venus.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Venus_map_Magellan.jpg/1024px-Venus_map_Magellan.jpg' },
    { name: 'jupiter.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/1024px-Jupiter.jpg' },
    { name: 'mars.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mars_equirectangular_projection.jpg/1024px-Mars_equirectangular_projection.jpg' }
];

const imgDir = path.join(__dirname, 'image');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

textures.forEach(tex => {
    const filePath = path.join(imgDir, tex.name);
    const file = fs.createWriteStream(filePath);
    console.log(`Downloading ${tex.name}...`);
    https.get(tex.url, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Saved ${tex.name}`);
        });
    }).on('error', err => {
        fs.unlink(filePath, () => { });
        console.error(`Error downloading ${tex.name}: ${err.message}`);
    });
});

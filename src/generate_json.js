const fs = require('fs');
const path = require('path');
const config = require('./config');
const { checkStock } = require('./scraper');

async function generateData() {
    console.log('Generating status data...');

    try {
        const results = await checkStock(config.stores, config.productUrl);

        const data = {
            lastUpdated: new Date().toISOString(),
            productUrl: config.productUrl,
            stores: results
        };

        const publicDir = path.join(__dirname, '../public');

        // Ensure public directory exists
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(
            path.join(publicDir, 'data.json'),
            JSON.stringify(data, null, 2)
        );

        console.log('Successfully wrote public/data.json');

    } catch (error) {
        console.error('Error generating data:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    generateData();
}

module.exports = { generateData };

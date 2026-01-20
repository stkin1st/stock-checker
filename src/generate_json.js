const fs = require('fs');
const path = require('path');
const config = require('./config');
const { checkStock } = require('./scraper');
const { sendStockReport } = require('./notifier');

async function generateData() {
    console.log('Generating status data...');

    try {
        const results = await checkStock(config.stores, config.productUrl);

        const data = {
            lastUpdated: new Date().toISOString(),
            productUrl: config.productUrl,
            stores: results
        };

        // SMART ALERT:
        // 1. Stock must be found.
        // 2. Only send at 12:00 PM EST (17:00 UTC) to avoid spam.
        const hasStock = results.some(r => r.available);
        const currentHour = new Date().getUTCHours();
        const isNoon = currentHour === 17; // 17:00 UTC = 12:00 PM EST

        if (hasStock && isNoon) {
            console.log('Stock found AND it is Noon. Sending email notification...');
            await sendStockReport(results);
        } else if (hasStock) {
            console.log('Stock found, but skipping email (waiting for Noon daily digest).');
        } else {
            console.log('No stock found. Skipping email.');
        }

        const publicDir = path.join(__dirname, '../docs');

        // Ensure public directory exists
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(
            path.join(publicDir, 'data.json'),
            JSON.stringify(data, null, 2)
        );

        console.log('Successfully wrote docs/data.json');

    } catch (error) {
        console.error('Error generating data:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    generateData();
}

module.exports = { generateData };

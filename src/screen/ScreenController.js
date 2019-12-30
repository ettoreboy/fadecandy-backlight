const screenshot = require('screenshot-desktop');
const { PNG } = require('pngjs');
const FastAverageColor = require('fast-average-color');
const fs = require('fs');
const logger = require('node-color-log');

logger.setLevel(process.env.NODE_ENV === 'development' ? 'info' : 'error');

class ScreenController {
    constructor() {
        this.fac = new FastAverageColor();
    }

    /**
     * Get the average color from a png buffer - expects a Promise returning the buffer
     * @param {*} pngBuffer
     */
    getAverageColor(pngBuffer) {
        return pngBuffer.then((imageData) => {
            const screenAverageColor = this.fac.getColorFromArray4(imageData);
            logger.debug(`Average color is ${screenAverageColor}`);
            return screenAverageColor;
        })
            .catch((err) => {
                logger.error(`Average color parsing error: ${err}`);
            });
    }

    getAverageScreenColor() {
        return screenshot({ format: 'png' }).then((data) => {
            const png = PNG.sync.read(data);

            return this.getAverageColor(png);
        }).catch((err) => {
            logger.error(`Screenshot error: ${err}`);
        });
    }

    getAverageColorFromFile(filePath) {
        const data = fs.readFileSync(filePath);
        const png = PNG.sync.read(data);

        const bufferImage = new Promise((resolve, reject) => {
            if (png) {
                logger.debug('Parsed image from file');
                logger.debug(`Meta: width ${png.width} height ${png.height}`);
                resolve(png.data);
            }
            reject(new Error('Could not read encoding of png'));
        });

        return this.getAverageColor(bufferImage);
    }

    destroy() {
        this.fac.destroy();
    }
}

module.exports = ScreenController;

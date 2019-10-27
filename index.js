const ReadLine = require('readline');
const logger = require('node-color-log');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

// Number of led - one stripe
const LEDS_N = 64;
const ALL_LEDS = 64 * 3;
const REFRESH_INT = 500;

const currentColor = [0, 0, 0];
const previousColor = [];

// Logger
logger.setLevel('info');

logger.info('Fadecandy Backlight!'.rainbow);
logger.info('Server has started'.bold);

// LC.init(true);
// currentColor = SC.getAverageScreenColor();

// Main routine
/* LC.fc.on(LC.FadeCandy.events.COLOR_LUT_READY, () => {
    setInterval(() => {
        previousColor = currentColor;
        currentColor = SC.getAverageScreenColor();
        LC.setColorFilter(LEDS_N, currentColor, previousColor);
    }, REFRESH_INT);
    // LC.runAnimation(LEDS_N, 100);
}); */

// Handle shutdown leds on exit
if (process.platform === 'win32') {
    const rl = ReadLine.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.on('SIGINT', () => {
        process.emit('SIGINT');
    });
}

process.on('SIGINT', () => {
    // graceful shutdown - send a zeroed array
    LC.send(new Uint8Array(ALL_LEDS));
    process.exit();
});

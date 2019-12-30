const ReadLine = require('readline');
// eslint-disable-next-line no-unused-vars
const { rainbow } = require('colors');
const logger = require('node-color-log');
const LedController = require('./src/led/LedController');

// Logger
logger.setLevel(process.env.NODE_ENV === 'development' ? 'info' : 'error');
logger.info('Fadecandy Backlight!'.rainbow);

const controller = new LedController(logger);

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
    // LC.send(new Uint8Array(ALL_LEDS));
    logger.info('Shutting down'.bold);
    process.exit();
});

const FadeCandy = require('node-fadecandy');
const logger = require('node-color-log');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const fc = new FadeCandy();

let isReady = false;

/**
 * Init configuration and register events
 * @param data_transfer_led - allows blinking of led on the board
 */
function init(dataTransferLed) {
    fc.on(FadeCandy.events.READY, () => {
        console.log('FadeCandy is READY');
        isReady = true;

        // see the config schema
        console.debug(fc.Configuration.schema);

        // create default color look-up table
        fc.clut.create();

        // set fadecandy led to manual mode
        fc.config.set(fc.Configuration.schema.LED_MODE, 1);

        // blink that led
        if (dataTransferLed) {
            let state = false;
            setInterval(() => {
                state = !state;
                fc.config.set(fc.Configuration.schema.LED_STATUS, +state);
            }, 100);
        }
    });


    // Emitted if the FadeCancy device is detached from the host.
    fc.on(FadeCandy.USBInterface.DETACHED, () => {
        isReady = false;
        console.log('FadeCandy is DETACHED');
    });
}

/**
 * Running leds animation
 * @param LEDS_N - number of leds
 * @param interval (optional) - interval in milliseconds, basically the speed of the animation
 */
function runAnimation(LEDS_N, interval) {
    const interval_d = interval || 100;

    // do some reeeeally basic running light on 6 leds
    let frame = 0;
    setInterval(() => {
        const data = new Uint8Array(LEDS_N * 3);

        for (let pixel = 0; pixel < LEDS_N; pixel++) {
            if (frame % LEDS_N == pixel) {
                const i = 3 * pixel;

                data[i] = 255;
                data[i + 1] = 0;
                data[i + 2] = 255;
            }
        }
        fc.send(data);
        frame++;
    }, interval_d);
}

/**
 * Set a rgb passed color to the selected leds
 * @param leds_n - number of leds
 * @param color - a rgb color as an array [r, g, b]
 */
function setColor(leds_n, color) {
    const color_d = color || [255, 255, 255]; // white
    const data = new Uint8Array(leds_n * 3);

    for (let pixel = 0; pixel < leds_n; pixel++) {
        const i = pixel * 3;
        data[i] = color_d[0];
        data[i + 1] = color_d[1];
        data[i + 2] = color_d[2];
    }
    console.debug(`LED CONTROLLER sent data ${data}`);
    fc.send(data);
}

/**
 * Simple compare two arrays such as the rgb colors
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Set a rgb passed color only if not already set
 * @param ledsN - number of leds
 * @param color - a rgb color as an array [r, g, b]
 * @param previousColor - a rgb color a s an array [r, g, b]
 */
function setColorFilter(ledsN, color, previousColor) {
    if (!arraysEqual(color, previousColor)) {
        setColor(ledsN, color);
    } else {
        console.debug('LED CONTROLLER color sending skipped');
    }
}

/**
 * Send data to usb
 */
function send(Uint8ArrayData) {
    fc.send(Uint8ArrayData);
}

module.exports = {
    FadeCandy,
    fc,
    isReady,
    send,
    init,
    setColor,
    setColorFilter,
    runAnimation,
};

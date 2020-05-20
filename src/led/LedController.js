const NodeFadeCandy = require('node-fadecandy');
const { DISCONNECTED, READY, STARTED } = require('./LedControllerStatus');

let instance;

const DEFAULT_OPTIONS = { dataTransferLed: true };

class LedController {
    constructor(logger, options) {
        if (instance) {
            return instance;
        }

        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.fc = new NodeFadeCandy();
        this.logger = logger;
        this.status = STARTED;

        this.init(this.options.dataTransferLed);

        instance = this;
    }

    isValidStatus() {
        return this.status && READY === this.status;
    }

    /**
    * Init configuration and register events
    * @param dataTransferLed - allows blinking of led on the board
    */
    init(dataTransferLed) {
        this.fc.on(NodeFadeCandy.events.READY, () => {
            this.logger.debug('FadeCandy is READY');

            // see the config schema
            this.logger.debug(this.fc.Configuration.schema);

            // create default color look-up table
            this.fc.clut.create();

            // set fadecandy led to manual mode
            this.fc.config.set(this.fc.Configuration.schema.LED_MODE, 1);

            this.status = READY;

            this.logger.info('READY');

            // blink board led
            if (dataTransferLed) {
                let state = false;
                setInterval(() => {
                    state = !state;
                    this.fc.config.set(this.fc.Configuration.schema.LED_STATUS, +state);
                }, 100);
            }
        });


        // Emitted if the FadeCancy device is detached from the host.
        this.fc.on(NodeFadeCandy.USBInterface.DETACHED, () => {
            this.status = DISCONNECTED;
            this.logger.info('FadeCandy usb is disconnected');
        });
    }

    /**
    * Send data to usb
    * @param Uint8ArrayData an array of data
    */
    send(Uint8ArrayData) {
        if (this.isValidStatus()) {
            this.fc.send(Uint8ArrayData);
            this.logger.debug('Data sent to controller: ', Uint8ArrayData);
        }
    }

    /**
    * Running leds animation
    * @param ledsNumber - number of leds
    * @param interval (optional) - interval in milliseconds, basically the speed of the animation
    */
    runAnimation(ledsNumber, interval = 100) {
        let frame = 0;
        setInterval(() => {
            const data = new Uint8Array(ledsNumber * 3);

            for (let pixel = 0; pixel < ledsNumber; pixel += 1) {
                if (frame % ledsNumber === pixel) {
                    const i = 3 * pixel;

                    data[i] = 255;
                    data[i + 1] = 0;
                    data[i + 2] = 255;
                }
            }
            this.send(data);
            frame += 1;
        }, interval);
    }

    /**
    * Set a rgb passed color to the selected leds
    * @param leds_n - number of leds, default is 64
    * @param color - a rgb color as an array [r, g, b], default is white
    */
    setSingleColor(ledsNumber = 64, color = [255, 255, 255]) {
        const data = Uint8Array(ledsNumber * 3);
        const [r, g, b] = color;

        // Small optimization for matching colors channel
        if (r === g && r === b) {
            data.fill(r);
        } else {
            for (let index = 0; index < data.length; index += 1) {
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
            }
        }

        this.send(data);
    }
}

module.exports = LedController;

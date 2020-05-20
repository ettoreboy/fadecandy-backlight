const net = require('net');
const fs = require('fs');

const loadModel = (filename) =>
    // Synchronously load a JSON model from a file on disk
    JSON.parse(fs.readFileSync(filename));

const hsv = (h, s, v) => {
    /*
     * Converts an HSV color value to RGB.
     *
     * Normal hsv range is in [0, 1], RGB range is [0, 255].
     * Colors may extend outside these bounds. Hue values will wrap.
     *
     * Based on tinycolor:
     * https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
     * 2013-08-10, Brian Grinstead, MIT License
     */

    h = (h % 1) * 6;
    if (h < 0) h += 6;

    const i = h || 0;
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const r = [v, q, p, p, t, v][i];
    const g = [t, v, v, q, p, p][i];
    const b = [p, p, t, v, v, q][i];

    return [r * 255, g * 255, b * 255];
};

/*
 * Simple Open Pixel Control client for Node.js
 *
 * 2013-2014 Micah Elizabeth Scott
 * This file is released into the public domain.
 *
 * Adapted by Ettore Ciprian for 2019 with ES6 class syntax
 */
class OPC {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.pixelBuffer = null;
        this.socket = null;
    }

    reconnect() {
        this.socket = new net.Socket();
        this.connected = false;

        this.socket.onclose = function () {
            console.log('Connection closed');
            this.socket = null;
            this.connected = false;
        };

        this.socket.on('error', (e) => {
            if (e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET') {
                this.socket = null;
                this.connected = false;
            }
        });

        this.socket.connect(this.port, this.host, () => {
            console.log(`Connected to ${this.socket.remoteAddress}`);
            this.connected = true;
            this.socket.setNoDelay();
        });
    }

    writePixels() {
        if (!this.socket) {
            this.reconnect();
        }
        if (!this.connected) {
            return;
        }
        this.socket.write(this.pixelBuffer);
    }

    setPixelCount(num) {
        const length = 4 + num * 3;
        if (this.pixelBuffer == null || this.pixelBuffer.length !== length) {
            this.pixelBuffer = Buffer.from(length);
        }

        // Initialize OPC header
        this.pixelBuffer.writeUInt8(0, 0); // Channel
        this.pixelBuffer.writeUInt8(0, 1); // Command
        this.pixelBuffer.writeUInt16BE(num * 3, 2); // Length
    }

    setPixel(num, r, g, b) {
        const offset = 4 + num * 3;
        if (this.pixelBuffer == null || offset + 3 > this.pixelBuffer.length) {
            this.setPixelCount(num + 1);
        }

        this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, r || 0)), offset);
        this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, g || 0)), offset + 1);
        this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, b || 0)), offset + 2);
    }

    mapPixels(fn, model) {
        // Set all pixels, by mapping each element of "model" through "fn" and setting the
        // corresponding pixel value. The function returns a tuple of three 8-bit RGB values.
        // Implies 'writePixels' as well. Has no effect if the OPC client is disconnected.

        if (!this.socket) {
            this.reconnect();
        }
        if (!this.connected) {
            return;
        }

        this.setPixelCount(model.length);
        let offset = 4;
        const unused = [0, 0, 0]; // Color for unused channels (null model)

        for (let i = 0; i < model.length; i += 1) {
            const led = model[i];
            const rgb = led ? fn(led) : unused;

            this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, rgb[0] | 0)), offset);
            this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, rgb[1] | 0)), offset + 1);
            this.pixelBuffer.writeUInt8(Math.max(0, Math.min(255, rgb[2] | 0)), offset + 2);
            offset += 3;
        }

        this.writePixels();
    }

    mapParticles(particles, model) {
        // Set all pixels, by mapping a particle system to each element of "model".
        // The particles include parameters 'point', 'intensity', 'falloff', and 'color'.

        function shader(p) {
            let r = 0;
            let g = 0;
            let b = 0;

            for (let i = 0; i < particles.length; i += 1) {
                const particle = particles[i];

                // Particle to sample distance
                const dx = (p.point[0] - particle.point[0]) || 0;
                const dy = (p.point[1] - particle.point[1]) || 0;
                const dz = (p.point[2] - particle.point[2]) || 0;
                const dist2 = dx * dx + dy * dy + dz * dz;

                // Particle edge falloff
                const intensity = particle.intensity / (1 + particle.falloff * dist2);

                // Intensity scaling
                r += particle.color[0] * intensity;
                g += particle.color[1] * intensity;
                b += particle.color[2] * intensity;
            }

            return [r, g, b];
        }

        this.mapPixels(shader, model);
    }
}

module.exports = OPC;

const sc = require('robotjs');
const quantize = require('quantize');
const ColorThief = require('color-thief-jimp');
const screenshot = require('screenshot-desktop');

function captureScreen() {
    return sc.screen.capture(0, 0);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

/*
 * Get multidimensional rgb array
 */
function getRGBArray(img) {
    const data = [];
    for (let i = 0; i < img.width; i += 120) {
        for (let j = 0; j < img.height; j += 120) {
            const rgbF = hexToRgb(img.colorAt(i, j));
            data.push(rgbF);
        }
    }
    console.debug(data);

    return data;
}

/*
 * Simple average of rgb array with Quantize
 */
function getAverageQuantize(img) {
    const data = getRGBArray(img);
    const maximumColorCount = 2;
    const result = quantize(data, maximumColorCount).palette();
    console.debug(`Average color is ${result[2]} using quantize.`);
    return result[2];
}

/*
 * Simple average of rgb array with color-thief
 */
function getAverageColorThief(img) {
    const srcImg = {
        bitmap: {
            data: img.image,
            width: img.width,
            height: img.height,
        },
    };
    const dominantColor = ColorThief.getColor(srcImg, 1);
    console.debug(`Average color is ${dominantColor} using color thief.`);
    return dominantColor;
}

/*
 * Simple average of bits
 */
function getAverageRGB(img) {
    let r = 0;
    let g = 0;
    let b = 0;
    const data = getRGBArray(img);

    for (let i = 0; i < data.length; i += 4) {
        r += data[i][0];
        g += data[i][1];
        b += data[i][2];
    }

    r = Math.floor(r / (data.length / 4));
    g = Math.floor(g / (data.length / 4));
    b = Math.floor(b / (data.length / 4));

    console.debug(`Average color is ${r} ${g} ${b} using standard average.`);
    return [r, g, b];
}

/**
 * Get average color from Bitmap
 */
function getAverageScreenColor(method) {
    const img = captureScreen();
    console.debug(img.image);
    screenshot().then((img) => {
        console.debug('Desktop screen img');
        console.debug(img);
    }).catch((err) => {
        console.error(`Error when taking screenshot ${err}`);
    });
    let rgb;
    console.debug(`Image width: ${img.width} Image height: ${img.height}`);

    switch (method) {
    case 'quantize':
        rgb = getAverageQuantize(img);
        break;
    case 'color-thief':
        rgb = getAverageColorThief(img);
        break;
    default:
        rgb = getAverageRGB(img);
    }

    console.debug(`Average color is ${rgb}`);
    return rgb;
}

module.exports = {
    sc,
    getAverageScreenColor,
};

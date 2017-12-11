const sc = require('robotjs');

function captureScreen() {
    return sc.screen.capture(0, 0);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/*
 * Simple average of bits
 */
function getAverageRGB(img) {

    var data = [];
    var r = 0;
    var g = 0;
    var b = 0;

    for (let i = 0; i < img.width; i += 120) {
        for (let j = 0; j < img.height; j += 120) {
            let rgb_f = hexToRgb(img.colorAt(i, j));
            //console.debug("Color found " + JSON.stringify(rgb_f));
            data.push(rgb_f);
        }
    }
    console.debug(data);

    for (let i = 0; i < data.length; i += 4) {
        r += data[i].r;
        g += data[i].g;
        b += data[i].b;
    }

    r = Math.floor(r / (data.length / 4));
    g = Math.floor(g / (data.length / 4));
    b = Math.floor(b / (data.length / 4));

    console.debug("Average color is " + r + " " + g + " " + b);
    return [r, g, b];
}


/**
 * Get average color from Bitmap
 */
function getAverageScreenColor() {
    let img = captureScreen();
    console.debug("Image width: " + img.width + " Image height: " + img.height);

    let rgb = getAverageRGB(img);
    console.debug("Average color is " + rgb);
    return rgb;
}

module.exports = {
    sc,
    getAverageScreenColor
}
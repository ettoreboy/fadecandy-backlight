const Benchmark = require('benchmark');
const fs = require('fs');
const FastAverageColor = require('fast-average-color');
const screenshot = require('screenshot-desktop');

const suite = new Benchmark.Suite();
const fac = new FastAverageColor();

function getScreenColorFromFile() {
    const testImage = fs.readFileSync('./src/test/test-img2.png');
    return fac.getColorFromArray4(testImage);
}

function getScreenColorFromScreenshot() {
    screenshot().then((img) => fac.getColorFromArray4(img)).catch((err) => {
        console.error(err);
    });
}

// TEST
suite.add('FastAverageColor#screenshot', () => {
    getScreenColorFromScreenshot();
})
    .add('FastAverageColor#file', () => {
        getScreenColorFromFile();
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log(`Fastest is ${this.filter('fastest').map('name')}`);
    })
    .run({ async: true });

fac.destroy();

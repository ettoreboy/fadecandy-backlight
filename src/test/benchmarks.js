var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

const SC = require('../screen-controller');

// add tests
suite.add('Stupid Color Average', function () {
        SC.getAverageScreenColor();
    })
    // .add('Improved Color Average', function () {
    //     SC.getAverageScreenColor();
    // })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({
        'async': true
    });

// logs:
// => RegExp#test x 4,161,532 +-0.99% (59 cycles)
// => String#indexOf x 6,139,623 +-1.00% (131 cycles)
// => Fastest is String#indexOf
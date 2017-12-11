//Number of led - one stripe
const LEDS_N = 64;
const ALL_LEDS = 64 * 3;
const REFRESH_INT = 500;
const LC = require('./src/led-controller');
const SC = require('./src/screen-controller');

let current_color = [0, 0, 0];
let prev_color = [];
LC.init(true);

//Main routine
LC.fc.on(LC.FadeCandy.events.COLOR_LUT_READY, function () {
    setInterval(function () {
        prev_color = current_color;
        current_color = SC.getAverageScreenColor();
        LC.setColorFilter(LEDS_N, current_color, prev_color);
    }, REFRESH_INT);
    //LC.runAnimation(LEDS_N, 100);
});

//Handle shutdown leds on exit
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}

process.on("SIGINT", function () {
    //graceful shutdown - send a zeroed array
    LC.send(new Uint8Array(ALL_LEDS));
    process.exit();
});
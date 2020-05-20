const ScreenController = require('../screen/ScreenController');

describe('Screen Controller test ', () => {
    let sc;

    beforeEach(() => {
        sc = new ScreenController();
    });

    it('Find the correct average of a uniform image', (done) => {
        sc.getAverageColorFromFile('./src/test/assets/4000ff.png')
            .then((color) => {
                expect(color).toStrictEqual([64, 0, 255, 255]);
                done();
            });
    });

    afterEach(() => {
        sc.destroy();
    });
});

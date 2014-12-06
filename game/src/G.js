var G = {
    devMode: true,

    game: null,
    width: 640, /* stage width in pixels */
    height: 360, /* stage height in pixels */

    world: {
        gravity: 1000
    },

    sfx: {}, /* sound effects */

    backgroundColor: 0x4488cc,
    mainFont: '"Luckiest Guy"',

    message: null,
    tutorial: {}
};

G.setupStage = function() {
    game.stage.backgroundColor = G.backgroundColor;
};

G.addRectangle = function(color) {
    var rect = game.add.graphics(0, 0);
    rect.beginFill(color, 1);
    rect.drawRect(0, 0, game.width, game.height);
    rect.endFill();

    return rect;
};

G.fadeIn = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 1;
    game.add.tween(curtain).to({ alpha: 0 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.fadeOut = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 0;
    game.add.tween(curtain).to({ alpha: 1 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.showTutorial = function(flag, message) {
    if (G.tutorial[flag] === undefined && G.message.getQueueLength() === 0) {
        G.tutorial[flag] = true;
        G.message.add(message);
    }
};

G.shake = function() {
    var tx = game.camera.x + 30;
    var ty = game.camera.y + 30;

    var tween;
    tween = game.add.tween(game.camera)
        .to({ x: tx }, 40, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
        .start();

    tween = game.add.tween(game.camera)
        .to({ y: ty }, 80, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
        .start();
};

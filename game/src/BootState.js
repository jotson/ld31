var BootState = function(game) {
};

BootState.prototype.preload = function() {
    // Load assets for the preloader
    game.load.atlasJSONHash('preloader', 'assets/gfx/atlas/preloader.png', 'assets/gfx/atlas/preloader.json');
};

BootState.prototype.create = function() {
    if (game.device.desktop) {

    } else {

    }

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.refresh();

    game.stage.backgroundColor = G.backgroundColor;

    // Keyboard capture
    game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
    ]);

    // This triggers web fonts to start loading. They'll finish loading during the PreloadState.
    game.add.text(10, 10, '...', { font: '100px ' + G.mainFont, fill: '#ffffff' });

    // Focus game
    game.canvas.setAttribute('tabindex', '1');
    game.canvas.focus();

    game.state.start('preloader');
};

BootState.prototype.update = function() {
};

var game;
window.onload = function() {
    game = new Phaser.Game(G.width, G.height, Phaser.AUTO, 'game');

    game.state.add('boot', BootState, true);
    game.state.add('preloader', PreloadState, false);
    game.state.add('menu', MenuState, false);
    game.state.add('game', GameState, false);
    game.state.add('end', EndState, false);
    game.state.add('screenshot', ScreenshotState, false);
};

var DEBUG_PRELOADER = false;
if (DEBUG_PRELOADER) {
    Phaser.Loader.prototype.originalNextFile = Phaser.Loader.prototype.nextFile;

    Phaser.Loader.prototype.nextFile = function(previousIndex, success) {
        var self = this;
        window.setTimeout(function() { Phaser.Loader.prototype.originalNextFile.call(self, previousIndex, success); }, 100);
    };
}

var PreloadState = function(game) {
};

PreloadState.prototype.preload = function() {
    // Show progress bar
    preloadIcon = game.add.sprite(0, 0, 'preloader', 'preloader-icon.png');
    preloadIcon.y = game.height/2 - preloadIcon.height - 20;
    preloadIcon.x = game.width/2 - preloadIcon.width/2;

    preloadBg = game.add.sprite(0, 0, 'preloader', 'preloader-bg.png');
    preloadBg.y = game.height/2 - preloadBg.height/2;
    preloadBg.x = game.width/2 - preloadBg.width/2;

    preloadFg = game.add.sprite(0, 0, 'preloader', 'preloader-fg.png');
    preloadFg.y = game.height/2 - preloadFg.height/2;
    preloadFg.x = game.width/2 - preloadFg.width/2;

    game.load.setPreloadSprite(preloadFg);

    // Setup load callback
    game.load.onFileComplete.add(this.fileLoaded, this);

    // Load assets
    game.load.atlasJSONHash('sprites', 'assets/gfx/atlas/sprites.png', 'assets/gfx/atlas/sprites.json');
    // game.load.image('guts', 'assets/gfx/guts.png');
    // game.load.spritesheet('zombie', 'assets/gfx/zombie.png', 20, 20);
    // game.load.audio('rifle1', ['assets/sfx/rifle1.ogg', 'assets/sfx/rifle1.mp3']);
};

PreloadState.prototype.create = function() {
    // Setup sound effects
    // G.sfx.music = game.add.sound('music', 0.3, true);
    // G.sfx.music.play();

    game.stage.backgroundColor = G.backgroundColor;

    if (G.devMode) {
        game.state.start('game');
    } else {
        // Delay to allow web fonts to load
        game.add.text(10, 10, '...', { font: '6px ' + G.mainFont, fill: '#ffffff' });
        G.fadeOut(1000, G.backgroundColor);
        game.time.events.add(1000, function() { game.state.start('menu'); }, this);
    }
};

PreloadState.prototype.update = function() {
};

PreloadState.prototype.fileLoaded = function(progress, key, success, totalLoaded, totalFiles) {
};

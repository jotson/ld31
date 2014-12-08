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

    // Sounds
    game.load.audio('fuelget', ['assets/sfx/fuelget.ogg', 'assets/sfx/fuelget.mp3']);
    game.load.audio('flame', ['assets/sfx/flame.ogg', 'assets/sfx/flame.mp3']);
    game.load.audio('death', ['assets/sfx/death.ogg', 'assets/sfx/death.mp3']);
    game.load.audio('hit', ['assets/sfx/hit.ogg', 'assets/sfx/hit.mp3']);
    game.load.audio('snowhit', ['assets/sfx/snowhit.ogg', 'assets/sfx/snowhit.mp3']);
    game.load.audio('flameout', ['assets/sfx/flameout.ogg', 'assets/sfx/flameout.mp3']);
    game.load.audio('flamehit', ['assets/sfx/flamehit.ogg', 'assets/sfx/flamehit.mp3']);
    game.load.audio('jumphit', ['assets/sfx/jumphit.ogg', 'assets/sfx/jumphit.mp3']);
    game.load.audio('snowwalk', ['assets/sfx/snowwalk.ogg', 'assets/sfx/snowwalk.mp3']);
    game.load.audio('walk', ['assets/sfx/walk.ogg', 'assets/sfx/walk.mp3']);
};

PreloadState.prototype.create = function() {
    // Setup sound effects
    G.sfx.fuelget = game.add.sound('fuelget', 1, false);
    G.sfx.flame = game.add.sound('flame', 1, true);
    G.sfx.death = game.add.sound('death', 1, false);
    G.sfx.hit = game.add.sound('hit', 1, false);
    G.sfx.snowhit = game.add.sound('snowhit', 1, false);
    G.sfx.flameout = game.add.sound('flameout', 1, false);
    G.sfx.flamehit = game.add.sound('flamehit', 1, false);
    G.sfx.jumphit = game.add.sound('jumphit', 1, false);
    G.sfx.snowwalk = game.add.sound('snowwalk', 1, false);
    G.sfx.walk = game.add.sound('walk', 1, false);

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

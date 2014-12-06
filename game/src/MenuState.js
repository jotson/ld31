var MenuState = function(game) {
    this.name = 'menu';
};

MenuState.prototype.create = function() {
    G.setupStage();

    var t = game.add.text(0, 0, 'CLICK TO START', { font: '64px ' + G.mainFont, fill: '#ffffff' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = game.height * 0.3;

    game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

    game.input.onDown.add(function() { game.state.start('game'); }, this);

    G.fadeIn(1000, 0x000000, 0);
};

MenuState.prototype.update = function() {
};

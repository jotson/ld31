var EndState = function(game) {
    this.name = 'end';
};

EndState.prototype.create = function() {
    G.setupStage();

    var t = game.add.text(0, 0, 'GAME OVER', { font: '48px ' + G.mainFont, fill: '#ffffff' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = game.height * 0.3;

    game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

    game.input.onDown.add(function() { game.state.start('menu'); }, this);
};

EndState.prototype.update = function() {
};

var MenuState = function(game) {
    this.name = 'menu';
};

MenuState.prototype.create = function() {
    G.setupStage();

    var t;

    G.makeClouds();

    t = game.add.text(0, 0, 'FLAMETHROWERS\nVS. SNOWMEN!', { font: '96px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 10, align: 'center' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = 25;

    t = game.add.text(0, 0, 'by John Watson\nMade for Ludum Dare 31\nDecember 5-7 2014\nhttp://jotson.itch.io', { font: '36px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 5, align: 'center' });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = 300;

    t = game.add.text(0, 0, 'CLICK TO START', { font: '64px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 10 });
    t.x = game.width/2 - t.getBounds().width/2;
    t.y = game.height - 150;
    game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

    var dude = game.add.sprite(60, 75, 'sprites', 'player-idle__000.png');
    dude.scale.set(2, 2);
    dude.animations.add('idle', Phaser.Animation.generateFrameNames('player-idle__', 0, 19, '.png', 3), 20, true);
    dude.play('idle');

    var snowman = game.add.sprite(game.width - 275, 75, 'sprites', 'snowman-idle__000.png');
    snowman.scale.set(2, 2);
    snowman.animations.add('idle', Phaser.Animation.generateFrameNames('snowman-idle__', 0, 9, '.png', 3), 10, true);
    snowman.play('idle');

    game.input.onDown.add(function() { game.state.start('game'); }, this);

    G.fadeIn(1000, 0x000000, 0);
};

MenuState.prototype.update = function() {
};

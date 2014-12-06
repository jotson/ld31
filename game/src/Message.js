var Message = function(game, parent) {
    game = game;
    this.parent = parent;
    this.messages = [];

    this.messageTimer = 0;
};

Message.prototype.add = function(message) {
    this.messages.push(message);
};

Message.prototype.update = function() {
    this.messageTimer -= game.time.elapsed;

    if (this.messages.length === 0) return;

    if (this.messageTimer <= 0) {
        var m = this.messages.shift();

        var t = m.length * 80;
        if (t < 1000) t = 1500;

        var text = game.add.text(10, -250, m, { font: '36px ' + G.mainFont, fill: '#ffffff' });
        text.fixedToCamera = true;
        text.updateTransform();
        text.cameraOffset.x = game.width/2 - text.getBounds().width/2;

        // Tween
        game.add.tween(text).to({ alpha: 0.3 }, 250, Phaser.Easing.Cubic.In, true, t+350);
        var tween = game.add.tween(text.cameraOffset)
            .to({ y: 10 }, 250, Phaser.Easing.Elastic.Out, false, 100)
            .to({ y: game.camera.height }, 250, Phaser.Easing.Cubic.In, false, t);
        tween._lastChild.onComplete.add(function() { this.destroy(); }, text);
        tween.start();

        this.messageTimer = t + 300;
    }
};

Message.prototype.getQueueLength = function() {
    return this.messages.length;
};

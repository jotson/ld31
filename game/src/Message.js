var Message = function() {
    this.messages = [];
};

Message.prototype.add = function(message) {
    this.messages.push(message);

    if (this.timer === undefined) this.update();
};

Message.prototype.update = function() {
    if (this.messages.length === 0) return;

    var m = this.messages.shift();

    // Timer
    var t = m.length * 80;
    if (t < 1000) t = 1500;
    this.timer = game.time.create(true);
    this.timer.add(t + 1000, this.update, this);
    this.timer.start();

    var text = game.add.text(10, -500, m, { font: '64px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 10 });
    text.fixedToCamera = true;
    text.updateTransform();
    text.cameraOffset.x = game.width/2 - text.getBounds().width/2;

    // Tween
    game.add.tween(text).to({ alpha: 0 }, 500, Phaser.Easing.Cubic.In, true, t + 500);
    var tween = game.add.tween(text.cameraOffset)
        .to({ y: 100 }, 500, Phaser.Easing.Elastic.Out, false, 100)
        .to({ y: game.camera.height * 2 }, 500, Phaser.Easing.Cubic.In, false, t);
    tween.onComplete.add(function() { this.destroy(); }, text);
    tween.start();
};

Message.prototype.getQueueLength = function() {
    return this.messages.length;
};

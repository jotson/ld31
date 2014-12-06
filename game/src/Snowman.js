var Snowman = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', 'snowman-00.png');

    this.width = 48;
    this.height = 48;
    this.anchor.setTo(0.5, 0.5);
    
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.mass = G.snowmanMass;
    this.body.drag.setTo(G.snowmanDrag, 0);
    this.body.maxVelocity.setTo(G.snowmanMaxSpeed, G.snowmanMaxSpeed * 10);
    this.body.collideWorldBounds = true;
    this.body.checkCollision.up = false;
    // this.animations.add('default', [0,1,2], 10, true);
    // this.animations.play('default');
};

Snowman.prototype = Object.create(Phaser.Sprite.prototype);
Snowman.prototype.constructor = Snowman;

Snowman.prototype.update = function() {
    if (!this.alive) return;

};

Snowman.create = function(x, y) {
    var s;
    s = G.enemies.getFirstDead();
    if (s === null) {
        s = G.enemies.add(new Snowman(x, y));
    }
    s.reset(x, y);
    s.revive();
    s.firstMove = true;
    s.animations.play('default');

    return s;
};

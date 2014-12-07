var Boss = function(x, y) {
    Snowman.call(this, game, x, y, 'sprites', '');

    this.subSprite.tint = 0xff0000;

    this.events.onKilled.add(function() {
        G.score += G.bossScore;
        this.subSprite.destroy();
        this.healthbar.destroy();
        this.destroy(true);
    }, this);
};

Boss.prototype = Object.create(Snowman.prototype);
Boss.prototype.constructor = Boss;

Boss.create = function() {
    var s;
    s = G.enemiesGroup.add(new Boss(0, 0));
    s.reset(0, 0);
    if (game.math.chanceRoll(50)) {
        s.x = game.width + G.groundSize;
        s.myDirection = Phaser.LEFT;
    } else {
        s.x = -G.groundSize;
        s.myDirection = Phaser.RIGHT;
    }
    if (game.math.chanceRoll(50)) {
        s.y = game.height - G.groundSize - s.height/2;
    } else {
        s.y = 50;
    }
    s.revive();

    s.health = G.bossHealth;
    s.maxHealth = s.health;

    s.firstMove = true;
    s.animations.play('default');
    s.changeState(s.WAITING);

    return s;
};

var Player = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', '');

    this.width = 36;
    this.height = 48;
    this.health = G.playerHealth;
    this.anchor.setTo(0.5, 0.5);

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.body.checkCollision.up = false;
    this.body.mass = G.playerMass;
    this.body.bounce.set(G.playerBounce, 0);
    this.body.maxVelocity.setTo(G.playerMaxSpeed, Number.POSITIVE_INFINITY);

    // Use a child sprite without physics to draw the actual animations
    this.alpha = 0;
    this.subSprite = game.add.sprite(x, y, 'sprites', '');
    this.subSprite.anchor.setTo(0.5, 1);
    this.events.onKilled.add(function() {
        this.subSprite.kill();
    }, this);

    // Use the child animation manager for this sprite
    this.animations = this.subSprite.animations;

    var anim;
    this.animations.add('idle', Phaser.Animation.generateFrameNames('player-idle__', 0, 19, '.png', 3), 20, true);
    this.animations.add('run', Phaser.Animation.generateFrameNames('player-run__', 0, 9, '.png', 3), 20, true);

    this.animations.play('idle');

    this.myDirection = Phaser.RIGHT;
    
    this.IDLE = 1;
    this.MOVING = 2;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    if (!this.alive) return;

    // Align the bottom edge of the child sprite
    // to the bottom edge of the parent.
    this.subSprite.x = this.x;
    this.subSprite.y = this.y + this.height / 2;

    if (this.body.velocity.x < 0) {
        G.player.subSprite.scale.x = -1;
        this.myDirection = Phaser.LEFT;
    }
    if (this.body.velocity.x > 0) {
        G.player.subSprite.scale.x = 1;
        this.myDirection = Phaser.RIGHT;
    }

    if (this.body.velocity.x !== 0) {
        this.animations.play('run');
        this.changeState(this.MOVING);
    } else {
        this.animations.play('idle');
        this.changeState(this.IDLE);
    }
};

Player.prototype.changeState = function(state) {
    this.myState = state;
};

Player.create = function() {
    var s = new Player(game.width/2, 200);

    game.add.existing(s);

    return s;
};

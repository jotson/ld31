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
        this.healthbar.kill();
    }, this);

    // Health bar
    this.healthbar = game.add.sprite(0, 0, 'sprites', 'healthbar.png');
    this.healthbar.anchor.set(0.5, 0.5);

    // Use the child animation manager for this sprite
    this.animations = this.subSprite.animations;

    var anim;
    this.animations.add('idle', Phaser.Animation.generateFrameNames('player-idle__', 0, 19, '.png', 3), 20, true);
    this.animations.add('run', Phaser.Animation.generateFrameNames('player-run__', 0, 9, '.png', 3), 20, true);
    anim = this.animations.add('hurt', [ 'player-hurt__000.png' ], 3, false);
    anim.onComplete.add(function(sprite, animation) {
        this.animations.play('idle');
    }, this);

    this.animations.play('idle');

    this.myDirection = Phaser.RIGHT;
    
    this.IDLE = 1;
    this.MOVING = 2;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.damage = function(amount) {
    if (!this.alive) return;

    Phaser.Sprite.prototype.damage.call(this, amount);

    if (this.alive) {
        this.animations.play('hurt');
        G.sfx.hit.play();
    }
};

Player.prototype.update = function() {
    if (!this.alive) return;

    // Align the bottom edge of the child sprite
    // to the bottom edge of the parent.
    this.subSprite.x = this.x;
    this.subSprite.y = this.y + this.height / 2;

    this.healthbar.x = this.x;
    this.healthbar.y = this.y - this.subSprite.height;
    this.healthbar.width = (this.health / G.playerHealth) * this.healthbar.texture.frame.width;
    if (this.alive && this.healthbar.width < 10) this.healthbar.width = 10;
    if (this.health < G.playerHealth / 2 && !game.tweens.isTweening(this.healthbar)) {
        game.add.tween(this.healthbar)
            .to( { alpha: 0 }, 250, Phaser.Easing.Cubic.InOut)
            .loop()
            .start();
    }

    if (this.body.velocity.x < 0) {
        G.player.subSprite.scale.x = -1;
        this.myDirection = Phaser.LEFT;
    }
    if (this.body.velocity.x > 0) {
        G.player.subSprite.scale.x = 1;
        this.myDirection = Phaser.RIGHT;
    }

    if (this.body.velocity.x !== 0) {
        if (this.animations.currentAnim.name != 'hurt') {
            this.animations.play('run');
        }
        this.changeState(this.MOVING);
    } else {
        this.changeState(this.IDLE);
        if (this.animations.currentAnim.name != 'hurt') {
            this.animations.play('idle');
        }
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

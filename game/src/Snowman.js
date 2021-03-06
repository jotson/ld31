var Snowman = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', '');

    this.width = 64;
    this.height = 96;
    this.anchor.setTo(0.5, 0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.mass = G.snowmanMass;
    this.body.maxVelocity.setTo(G.snowmanMaxSpeed, Number.POSITIVE_INFINITY);
    this.body.collideWorldBounds = false;
    this.body.checkCollision.up = true;
    this.body.bounce.set(G.snowmanBounce, G.snowmanBounce * 0.3);

    // Use a child sprite without physics to draw the actual animations
    this.alpha = 0;
    this.subSprite = game.add.sprite(x, y, 'sprites', '');
    this.subSprite.anchor.setTo(0.5, 1);
    this.events.onKilled.add(function() {
        G.score += G.snowmanScore;
        this.subSprite.kill();
        this.healthbar.kill();
        var state = game.state.getCurrentState();
        if (state.emitGibs !== undefined) state.emitGibs(this.x, this.y);
    }, this);

    // Health bar
    this.healthbar = game.add.sprite(0, 0, 'sprites', 'healthbar.png');
    this.healthbar.anchor.set(0.5, 0.5);

    // Use the child animation manager for this sprite
    this.animations = this.subSprite.animations;

    var anim;
    this.animations.add('idle', Phaser.Animation.generateFrameNames('snowman-idle__', 0, 9, '.png', 3), 10, true);
    anim = this.animations.add('jump', Phaser.Animation.generateFrameNames('snowman-jump__', 0, 9, '.png', 3), 20);
    anim.onComplete.add(function(sprite, animation) {
        this.animations.play('idle');
    }, this);
    anim = this.animations.add('attack', Phaser.Animation.generateFrameNames('snowman-attack__', 0, 4, '.png', 3), 20);
    anim.onComplete.add(function(sprite, animation) {
        this.animations.play('idle');
    }, this);

    this.animations.play('idle');
    
    this.MOVING = 1;
    this.WAITING = 2;
    this.ATTACK = 3;
};

Snowman.prototype = Object.create(Phaser.Sprite.prototype);
Snowman.prototype.constructor = Snowman;

Snowman.prototype.update = function() {
    if (!this.alive) return;

    // Align the bottom edge of the child sprite
    // to the bottom edge of the parent.
    this.subSprite.x = this.x;
    this.subSprite.y = this.y + this.height / 2;

    this.healthbar.x = this.x;
    this.healthbar.y = this.y - this.subSprite.height * 0.8;
    this.healthbar.width = (this.health / this.maxHealth) * this.healthbar.texture.frame.width;
    if (this.alive && this.healthbar.width < 10) this.healthbar.width = 10;

    if (this.myDirection === Phaser.RIGHT) {
        this.subSprite.scale.x = -1;
    } else {
        this.subSprite.scale.x = 1;
    }

    this.myStateElapsed += game.time.physicsElapsedMS;

    if (this.myStateElapsed > this.myStateTime) {
        this.changeState(this.myNextState);
    }

    // Hit player
    if (this.myState == this.MOVING && game.physics.arcade.distanceBetween(G.player, this) < G.player.width * 4) {
        this.changeState(this.ATTACK);
        G.sfx.snowhit.play();
        G.player.damage(1);
    }

    // Hit fuel
    if (this.myState == this.MOVING) {
        G.fuelGroup.forEachAlive(function(f) {
            if (game.physics.arcade.distanceBetween(f, this) < f.width * 2) {
                this.changeState(this.ATTACK);
                f.damage(1);
            }
        }, this);
    }
};

Snowman.prototype.changeState = function(state) {
    this.myState = state;
    this.myStateElapsed = 0;

    this.body.acceleration.x = 0;
    this.body.drag.setTo(G.snowmanDrag, 0);

    if (state == this.MOVING) {
        this.animations.play('jump');

        this.myNextState = this.WAITING;
        this.myStateTime = G.snowmanMovementTime;

        if (G.player !== undefined && G.player.alive) {
            if (G.player.x > this.x) {
                this.myDirection = Phaser.RIGHT;
            } else {
                this.myDirection = Phaser.LEFT;
            }
        }

        this.body.velocity.y = -G.snowmanJump;
        var v;
        if (this.myDirection === Phaser.LEFT) {
            v = -G.snowmanSpeed;
        } else {
            v = G.snowmanSpeed;
        }
        this.body.velocity.x = v;
        this.body.drag.set(0);

        game.add.tween(this.subSprite.scale)
            .to({ y: 0.5 }, G.snowmanMovementTime, Phaser.Easing.Bounce.Out)
            .yoyo(true)
            .start();
    }

    if (state == this.WAITING) {
        this.myNextState = this.MOVING;
        this.myStateTime = G.snowmanWaitTime;
    }

    if (state == this.ATTACK) {
        this.animations.play('attack');
        this.myNextState = this.WAITING;
        this.myStateTime = G.snowmanAttackTime;
    }
};

Snowman.create = function() {
    var s;
    s = G.enemiesGroup.getFirstDead();
    if (s === null) {
        s = G.enemiesGroup.add(new Snowman(0, 0));
    }
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

    // It ain't pretty but it works
    s.subSprite.x = -1000;
    s.subSprite.y = -1000;
    s.subSprite.revive();

    s.healthbar.x = -1000;
    s.healthbar.y = -1000;
    s.healthbar.revive();

    s.health = G.snowmanHealth;
    s.maxHealth = s.health;

    s.firstMove = true;
    s.animations.play('default');
    s.changeState(s.WAITING);

    return s;
};

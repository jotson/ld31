var Snowman = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', 'snowman-00.png');

    this.width = 48;
    this.height = 48;
    this.anchor.setTo(0.5, 0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.mass = G.snowmanMass;
    this.body.maxVelocity.setTo(G.snowmanMaxSpeed, G.snowmanMaxSpeed * 10);
    this.body.collideWorldBounds = false;
    this.body.bounce.set(G.snowmanBounce, G.snowmanBounce * 0.3);

    // this.animations.add('default', [0,1,2], 10, true);
    // this.animations.play('default');
    
    this.MOVING = 1;
    this.WAITING = 2;
    this.ATTACK = 3;
};

Snowman.prototype = Object.create(Phaser.Sprite.prototype);
Snowman.prototype.constructor = Snowman;

Snowman.prototype.update = function() {
    if (!this.alive) return;

    this.myStateElapsed += game.time.physicsElapsedMS;

    if (this.myStateElapsed > this.myStateTime) {
        this.changeState(this.myNextState);
    }

    if (this.myState == this.MOVING && game.physics.arcade.distanceBetween(G.player, this) < G.player.width * 2) {
        this.changeState(this.ATTACK);
    }
};

Snowman.prototype.changeState = function(state) {
    this.myState = state;
    this.myStateElapsed = 0;

    this.body.acceleration.x = 0;
    this.body.drag.setTo(G.snowmanDrag, 0);

    if (state == this.MOVING) {
        this.myNextState = this.WAITING;
        this.myStateTime = G.snowmanMovementTime;

        this.body.velocity.y = -G.snowmanJump;
        var v;
        if (this.myDirection == Phaser.LEFT) {
            v = -G.snowmanSpeed;
        } else {
            v = G.snowmanSpeed;
        }
        this.body.velocity.x = v;
        this.body.drag.set(0);
    }

    if (state == this.WAITING) {
        this.myNextState = this.MOVING;
        this.myStateTime = G.snowmanWaitTime;
    }

    if (state == this.ATTACK) {
        this.myNextState = this.WAITING;
        this.myStateTime = G.snowmanAttackTime;
    }
};

Snowman.create = function() {
    var s;
    s = G.enemies.getFirstDead();
    if (s === null) {
        s = G.enemies.add(new Snowman(x, y));
    }
    s.reset(x, y);
    s.y = game.height - G.groundSize - s.height/2;
    if (game.math.chanceRoll(50)) {
        s.x = game.width + G.groundSize;
        s.myDirection = Phaser.LEFT;
    } else {
        s.x = -G.groundSize;
        s.myDirection = Phaser.RIGHT;
    }
    s.revive();
    s.firstMove = true;
    s.animations.play('default');
    s.changeState(s.WAITING);

    return s;
};

var Fuel = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', '');

    this.width = 64;
    this.height = 64;
    this.anchor.setTo(0.5, 0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.health = G.fuelHealth;

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.mass = G.fuelMass;
    this.body.maxVelocity.setTo(G.fuelMaxSpeed, Number.POSITIVE_INFINITY);
    this.body.collideWorldBounds = false;
    this.body.bounce.set(G.fuelBounce, G.fuelBounce * 0.3);

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
    this.animations.add('idle', [ 'fuel-idle.png' ], 1, true);
    this.animations.add('falling', Phaser.Animation.generateFrameNames('fuel-falling__', 0, 19, '.png', 3), 10, true);

    this.FALLING = 1;
    this.WAITING = 2;
    this.COLLECTED = 3;
};

Fuel.prototype = Object.create(Phaser.Sprite.prototype);
Fuel.prototype.constructor = Fuel;

Fuel.prototype.update = function() {
    if (!this.alive) return;

    // Align the bottom edge of the child sprite
    // to the bottom edge of the parent.
    this.subSprite.x = this.x;
    this.subSprite.y = this.y + this.height / 2;

    if (this.myState == this.FALLING && this.body.touching.down) {
        this.changeState(this.WAITING);
    }
};

Fuel.prototype.changeState = function(state) {
    this.myState = state;
    this.myStateElapsed = 0;

    this.body.acceleration.x = 0;
    this.body.drag.setTo(G.fuelDrag, 0);

    if (state == this.FALLING) {
        this.myNextState = this.WAITING;
        this.body.maxVelocity.set(Number.POSITIVE_INFINITY, G.fuelFallingSpeed);
        this.animations.play('falling');
    }

    if (state == this.WAITING) {
        this.myNextState = this.COLLECTED;
        this.body.gravity.y = 0;
        this.body.acceleration.set(0);
        this.body.velocity.set(0);
        this.body.maxVelocity.set(Number.POSITIVE_INFINITY);
        this.animations.play('idle');
    }

    if (state == this.COLLECTED) {
        this.kill();
    }
};

Fuel.create = function() {
    var s;
    s = G.fuelGroup.getFirstDead();
    if (s === null) {
        s = G.fuelGroup.add(new Fuel(0, 0));
    }
    s.reset(0, 0);
    s.x = game.rnd.between(game.camera.x, game.camera.x + game.camera.width);
    s.revive();
    s.subSprite.x = -1000;
    s.subSprite.y = -1000;
    s.subSprite.revive();
    s.firstMove = true;
    s.animations.play('default');
    s.changeState(s.FALLING);

    return s;
};

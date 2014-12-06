var Fuel = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprites', 'fuel-00.png');

    this.anchor.setTo(0.5, 0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.mass = G.fuelMass;
    this.body.maxVelocity.setTo(G.fuelMaxSpeed, Number.POSITIVE_INFINITY);
    this.body.collideWorldBounds = false;
    this.body.bounce.set(G.fuelBounce, G.fuelBounce * 0.3);

    // this.animations.add('default', [0,1,2], 10, true);
    // this.animations.play('default');
    
    this.FALLING = 1;
    this.WAITING = 2;
    this.COLLECTED = 3;
};

Fuel.prototype = Object.create(Phaser.Sprite.prototype);
Fuel.prototype.constructor = Fuel;

Fuel.prototype.update = function() {
    if (!this.alive) return;

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
    }

    if (state == this.WAITING) {
        this.myNextState = this.COLLECTED;
    }

    if (state == this.COLLECTED) {
        // Play animation and die
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
    s.firstMove = true;
    s.animations.play('default');
    s.changeState(s.FALLING);

    return s;
};

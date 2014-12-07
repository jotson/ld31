var GameState = function(game) {
    this.name = 'game';

};

GameState.prototype.create = function() {
    if (G.devMode) {
        // Advanced timing (for fps)
        game.time.advancedTiming = true;
    }

    G.setupStage();

    // Start physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Set gravity
    game.physics.arcade.gravity.y = G.gravity;

    // Adjustment for physics tunneling
    game.physics.arcade.OVERLAP_BIAS = G.groundSize * 0.75;

    this.resetGame();

    this.buildWorld();

    G.enemiesGroup = game.add.group();

    G.fuelGroup = game.add.group();

    G.player = Player.create();

    this.equipFlamethrower();

    this.addUI();

    if (G.devMode) {
        this.fps = game.add.text(5, game.height - 50, '', { font: '28px ' + G.mainFont, fill: '#ffffff' });
        game.add.text(120, game.height - 50, '** DEVELOPMENT ­— DEVELOPMENT — DEVELOPMENT — DEVELOPMENT — DEVELOPMENT **', { font: '28px ' + G.mainFont, fill: '#ffffff' });
    }
};

GameState.prototype.resetGame = function() {
    G.fuel = G.fuelStart;

    G.gameTimer = 0; /* millis */

    this.fuelTimer = game.time.create(false);
    this.fuelTimer.loop(G.fuelInterval, function() { Fuel.create(); }, this);
    this.fuelTimer.start();
};

GameState.prototype.update = function() {
    G.gameTimer += game.time.physicsElapsedMS;

    // Collisions
    game.physics.arcade.collide(G.player, G.ground);
    game.physics.arcade.collide(G.player, G.enemiesGroup, function(p, e) {
        if (p.body.touching.down && !p.body.touching.left && !p.body.touching.right) {
            p.body.velocity.y = G.playerJumpSpeed;
        }
    });
    game.physics.arcade.collide(G.enemiesGroup, G.ground);
    game.physics.arcade.collide(G.enemiesGroup, G.fuelGroup);
    game.physics.arcade.collide(G.fuelGroup, G.ground);
    game.physics.arcade.collide(this.flameThrower, [ G.enemiesGroup, G.fuelGroup ], function(flame, target) {
        target.damage(1);
    });

    // Input
    this.processPlayerInput();

    // Player collecting fuel
    G.fuelGroup.forEachAlive(function(f) {
        if (f.state !== f.COLLECTED && game.physics.arcade.distanceBetween(G.player, f) < f.width * 2) {
            f.changeState(f.COLLECTED);
            G.fuel += G.fuelValue;
        }
    }, this);

    if (G.devMode) {
        if (game.time.fps != this.lastFps) {
            this.fps.setText('FPS: ' + game.time.fps);
            this.lastFps = game.time.fps;
        }
    }

    this.updateUI();
};

GameState.prototype.processPlayerInput = function() {
    // Left, right, idle
    if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        if (G.player.body.velocity.x > 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = -G.playerAcceleration;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        if (G.player.body.velocity.x < 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = G.playerAcceleration;
    } else {
        G.player.body.acceleration.x = 0;
    }

    // Jump
    if (G.player.body.touching.down) {
        G.player.body.drag.set(G.playerDrag, 0);
        G.player.canJump = true;
    } else {
        G.player.body.drag.set(0);
    }

    if (G.player.canJump && this.input.keyboard.downDuration(Phaser.Keyboard.UP, G.playerJumpDuration)) {
        G.player.body.velocity.y = G.playerJumpSpeed;
    }
    if (!this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        G.player.canJump = false;
    }

    // Flamethrower
    this.flameThrower.on = false;
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if (G.player.myState == G.player.MOVING) {
            this.flameThrower.y = G.player.y - 30;
        } else {
            this.flameThrower.y = G.player.y - 50;
        }

        if (G.player.myDirection === Phaser.RIGHT) {
            this.flameThrower.x = G.player.x + 80;
            this.flameThrower.minParticleSpeed.set(G.flameSpeed * 0.8 + G.player.body.velocity.x, -G.flameJitter);
            this.flameThrower.maxParticleSpeed.set(G.flameSpeed + G.player.body.velocity.x, G.flameJitter);
        } else {
            this.flameThrower.x = G.player.x - 80;
            this.flameThrower.minParticleSpeed.set(-G.flameSpeed * 0.8 + G.player.body.velocity.x, -G.flameJitter);
            this.flameThrower.maxParticleSpeed.set(-G.flameSpeed + G.player.body.velocity.x, G.flameJitter);
        }

        if (G.fuel > 0) {
            G.fuel -= game.time.physicsElapsed * G.fuelBurnRate;
            this.flameThrower.on = true;
        }
        
        if (G.fuel > 50) {
            this.flameThrower.frequency = 1;
        } else {
            this.flameThrower.frequency = (100 - G.fuel);
        }

        if (G.fuel <= 0) {
            G.fuel = 0;
        }
    }
};

GameState.prototype.addUI = function() {
    G.ui = game.add.group();

    G.ui.fuelText = game.add.text(10, 5, "", { font: '36px ' + G.mainFont, fill: '#ffffff' });
};

GameState.prototype.updateUI = function() {
    if (G.ui === undefined) return;

    // Update fuel display
    if (Math.abs(G.fuel - G.fuelDisplay) < 1) G.fuelDisplay = G.fuel;
    if (G.fuel != G.fuelDisplay) {
        var delta = Math.ceil((G.fuel - G.fuelDisplay) * 0.10);
        G.fuelDisplay += delta;
    }
    G.ui.fuelText.setText("FUEL: " + Math.ceil(G.fuelDisplay));
};

GameState.prototype.buildWorld = function() {
    // Set world boundary slightly larger than the camera area to allow enemies to be
    // created off camera without falling out of the world and to allow the player to
    // jump through the top of the screen.
    var xOffset = G.groundSize * 2;
    game.world.setBounds(-xOffset, -game.height, game.width + xOffset * 2, game.height*2);

    // Ground
    var world = [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '#######..........#######',
        '........................',
        '........................',
        '........................',
        '........................',
        '########################',
    ];

    G.ground = game.add.group();

    for(var i = 0; i < world.length; i++) {
        for(var j = 0; j < world[i].length; j++) {
            if (world[i].substr(j, 1) == '#') {
                x = j * G.groundSize - xOffset;
                y = i * G.groundSize + game.height % G.groundSize;

                var g = game.add.sprite(x, y, 'sprites', 'ground.png');
                g.width = G.groundSize;
                g.height = G.groundSize;
                game.physics.enable(g, Phaser.Physics.ARCADE);
                g.body.allowGravity = false;
                g.body.mass = 100;
                g.body.immovable = true;
                g.body.checkCollision.down = false;
                g.body.checkCollision.left = false;
                g.body.checkCollision.right = false;
                G.ground.add(g);
            }
        }
    }
};

GameState.prototype.equipFlamethrower = function() {
    this.flameThrower = game.add.emitter(0, 0, 400);
    this.flameThrower.makeParticles( 'sprites', [ 'fire.png', 'fire.png', 'smoke.png', 'smoke.png', 'smoke.png' ] );
    this.flameThrower.gravity = -G.gravity;
    this.flameThrower.setAlpha(1, 0.2, G.flameLifetime);
    this.flameThrower.setScale(0.2, 2, 0.2, 2, G.flameLifetime * 2);
    this.flameThrower.area = new Phaser.Rectangle(0, -10, 1, 20);
    this.flameThrower.setAll('body.mass', 0);
    this.flameThrower.start(false, G.flameLifetime, 1);
    this.flameThrower.on = false;
};

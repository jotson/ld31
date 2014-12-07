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

    G.makeClouds();
    G.makeSnow();

    G.enemiesGroup = game.add.group();

    G.fuelGroup = game.add.group();

    G.player = Player.create();

    this.setupSnowBits();
    this.setupSnowGibs();

    this.equipFlamethrower();

    G.showTutorial('survive', 'Kill all snowmen!');
    G.showTutorial('move', 'Use ARROWS to move');
    G.showTutorial('shoot', 'SPACEBAR for flamethrower');

    this.addUI();

    if (G.devMode) {
        this.fps = game.add.text(5, game.height - 50, '', { font: '28px ' + G.mainFont, fill: '#ffffff' });
        game.add.text(120, game.height - 50, '** DEVELOPMENT ­— DEVELOPMENT — DEVELOPMENT — DEVELOPMENT — DEVELOPMENT **', { font: '28px ' + G.mainFont, fill: '#ffffff' });
    }
};

GameState.prototype.resetGame = function() {
    this.gameOver = false;

    G.fuel = G.fuelStart;
    G.fuelDisplay = G.fuel;

    G.score = 0;
    G.scoreDisplay = G.score;

    G.gameTimer = 0; /* millis */

    // Timer for more fuel
    this.fuelTimer = game.time.create(false);
    this.fuelTimer.loop(G.fuelInterval, function() { Fuel.create(); }, this);
    this.fuelTimer.start();

    // Timer for enemies
    this.enemyTimer = game.time.create(false);
    this.enemyTimer.loop(G.snowmanInterval, function() {
        var bossExists = false;
        for(var i = 0; i < G.enemiesGroup.children; i++) {
            if (G.enemiesGroup.children[i] instanceof Boss) {
                bossExists = true;
                break;
            }
        }
        if (!bossExists && game.math.chanceRoll(10) && G.gameTimer > G.bossTimeThreshold) {
            Boss.create();
        } else {
            Snowman.create();
        }
    }, this);
    this.enemyTimer.start();
};

GameState.prototype.update = function() {
    G.gameTimer += game.time.physicsElapsedMS;

    // Turn off snowbits
    this.snowbits.on = false;
    this.snowgibs.on = false;

    // Collisions
    game.physics.arcade.collide(this.snowbits, G.ground);
    game.physics.arcade.collide(this.snowgibs, G.ground);
    game.physics.arcade.collide(G.player, G.ground);
    game.physics.arcade.collide(G.player, G.enemiesGroup, function(p, target) {
        if (p.body.touching.down && !p.body.touching.left && !p.body.touching.right) {
            p.body.velocity.y = G.playerJumpSpeed;
            target.damage(G.snowmanHealth / 2);
            G.score += G.snowmanScore / 2;
        }
    }, null, this);
    game.physics.arcade.collide(G.enemiesGroup, G.ground);
    game.physics.arcade.collide(G.enemiesGroup, G.fuelGroup);
    game.physics.arcade.collide(G.fuelGroup, G.ground);
    game.physics.arcade.overlap(this.flameThrower, [ G.enemiesGroup, G.fuelGroup ], function(flame, target) {
        target.damage(1);
        G.score += G.flameScore;
        this.snowbits.x = target.x;
        this.snowbits.y = target.y;
        this.snowbits.on = true;
    }, null, this);

    if (this.gameOver) return;

    // Input
    this.processPlayerInput();

    if (!G.player.alive) {
        this.gameOver = true;

        this.fuelTimer.stop();
        this.enemyTimer.stop();

        this.flameThrower.on = false;

        var death = game.add.sprite(G.player.x, G.player.y, 'sprites', 'player-death__000.png');
        var deathX = 200;
        if (G.player.x > game.width/2) {
            deathX = -deathX;
        } else {
            death.scale.x = -1;
        }
        death.anchor.set(0.5, 1);
        game.add.tween(death)
            .to({ x: G.player.x + deathX }, 1000, Phaser.Easing.Sinusoidal.Out)
            .start();
        game.add.tween(death)
            .to({ y: G.player.y - 50 }, 500, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .start();
        game.add.tween(death)
            .to({ alpha: 0 }, 250, Phaser.Easing.Cubic.InOut)
            .delay(500)
            .start();

        var t = game.add.text(0, 0, 'GAME OVER', { font: '48px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 10 });
        t.x = game.width/2 - t.getBounds().width/2;
        t.y = game.height * 0.3;
        game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

        var t = game.add.text(0, 0, 'CLICK TO RESTART', { font: '48px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 10 });
        t.x = game.width/2 - t.getBounds().width/2;
        t.y = game.height * 0.5;
        game.add.tween(t).to({ y: t.y + 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, Number.POSITIVE_INFINITY, true);

        game.input.onDown.add(function() { game.state.start('menu'); }, this);
    }

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

        var range = 1;
        if (G.fuel < 50) range = 0.5;

        if (G.player.myDirection === Phaser.RIGHT) {
            this.flameThrower.x = G.player.x + 80;
            this.flameThrower.minParticleSpeed.set(range * G.flameSpeed * 0.8 + G.player.body.velocity.x, -G.flameJitter);
            this.flameThrower.maxParticleSpeed.set(range * G.flameSpeed + G.player.body.velocity.x, G.flameJitter);
        } else {
            this.flameThrower.x = G.player.x - 80;
            this.flameThrower.minParticleSpeed.set(range * -G.flameSpeed * 0.8 + G.player.body.velocity.x, -G.flameJitter);
            this.flameThrower.maxParticleSpeed.set(range * -G.flameSpeed + G.player.body.velocity.x, G.flameJitter);
        }

        if (G.fuel > 0) {
            G.fuel -= game.time.physicsElapsed * G.fuelBurnRate;
            this.flameThrower.on = true;
        }
        
        if (G.fuel <= 0) {
            G.fuel = 0;
        }
    }
};

GameState.prototype.addUI = function() {
    G.ui = game.add.group();

    G.ui.fuelText = game.add.text(10, 5, "", { font: '48px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 5 });
    G.ui.scoreText = game.add.text(50, 5, "", { font: '48px ' + G.mainFont, fill: '#ffffff', stroke: '#000000', strokeThickness: 5 });
};

GameState.prototype.updateUI = function() {
    if (G.ui === undefined) return;

    // Update fuel display
    var delta;
    if (Math.abs(G.fuel - G.fuelDisplay) < 1) G.fuelDisplay = G.fuel;
    if (G.fuel != G.fuelDisplay) {
        delta = Math.ceil((G.fuel - G.fuelDisplay) * 0.10);
        G.fuelDisplay += delta;
    }
    G.ui.fuelText.setText("FUEL: " + Math.ceil(G.fuelDisplay));

    // Update score display
    if (Math.abs(G.score - G.scoreDisplay) < 1) G.scoreDisplay = G.score;
    if (G.score != G.scoreDisplay) {
        delta = Math.ceil((G.score - G.scoreDisplay) * 0.10);
        G.scoreDisplay += delta;
    }
    G.ui.scoreText.setText("SCORE: " + Math.ceil(G.scoreDisplay));
    G.ui.scoreText.x = game.width/2 - G.ui.scoreText.getBounds().width/2;

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

GameState.prototype.setupSnowBits = function() {
    this.snowbits = game.add.emitter(0, 0, 1000);
    this.snowbits.makeParticles( 'sprites', 'snowball.png' );
    this.snowbits.gravity = G.gravity;
    this.snowbits.minParticleScale = 0.2;
    this.snowbits.maxParticleScale = 0.4;
    this.snowbits.particleDrag = new Phaser.Point(200, 0);
    this.snowbits.angularDrag = 200;
    this.snowbits.setXSpeed(-300, 300);
    this.snowbits.setYSpeed(-500, -2000);
    this.snowbits.area = new Phaser.Rectangle(0, 0, 20, 60);
    this.snowbits.setAll('body.mass', 1);
    this.snowbits.start(false, 30000, 1);
    this.snowbits.on = false;
};

GameState.prototype.setupSnowGibs = function() {
    this.snowgibs = game.add.emitter(0, 0, 1000);
    this.snowgibs.makeParticles( 'sprites', [ 'snowbits1.png', 'snowbits1.png', 'snowbits1.png', 'snowbits2.png', 'snowbits2.png', 'snowbits3.png' ] );
    this.snowgibs.gravity = G.gravity;
    this.snowgibs.minParticleScale = 1;
    this.snowgibs.maxParticleScale = 1;
    this.snowgibs.particleDrag = new Phaser.Point(200, 0);
    this.snowgibs.angularDrag = 200;
    this.snowgibs.setXSpeed(-300, 300);
    this.snowgibs.setYSpeed(-500, -2000);
    this.snowgibs.area = new Phaser.Rectangle(0, 0, 20, 60);
    this.snowgibs.setAll('body.mass', 1);
    this.snowgibs.start(false, 30000, 1);
    this.snowgibs.on = false;
};

GameState.prototype.emitGibs = function(x, y) {
    this.snowgibs.x = x;
    this.snowgibs.y = y;
    this.snowgibs.on = true;
};

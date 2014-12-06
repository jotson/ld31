var GameState = function(game) {
    this.name = 'game';

};

GameState.prototype.create = function() {
    if (G.devMode) {
        // Advanced timing (for fps)
        game.time.advancedTiming = true;
    }

    G.setupStage();

    G.enemies = game.add.group();

    this.resetGame();

    this.buildWorld();

    this.addPlayer();

    Snowman.create();

    if (G.devMode) {
        this.fps = game.add.text(5, 5, '', { font: '14px ' + G.mainFont, fill: '#ffffff' });
        game.add.text(65, 5, '** DEVELOPMENT ­— DEVELOPMENT — DEVELOPMENT — DEVELOPMENT — DEVELOPMENT **', { font: '14px ' + G.mainFont, fill: '#ffffff' });
    }
};

GameState.prototype.update = function() {
    // Collide player with ground
    game.physics.arcade.collide(G.player, G.ground);
    game.physics.arcade.collide(G.player, G.enemies, function(p, e) {
        if (p.body.touching.down && !p.body.touching.left && !p.body.touching.right) {
            p.body.velocity.y = G.playerJumpSpeed;
        }
    });
    game.physics.arcade.collide(G.enemies, G.ground);

    this.movePlayer();

    if (G.devMode) {
        if (game.time.fps != this.lastFps) {
            this.fps.setText('FPS: ' + game.time.fps);
            this.lastFps = game.time.fps;
        }
    }
};

GameState.prototype.movePlayer = function() {
    if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        if (G.player.body.velocity.x > 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = -G.playerAcceleration;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        if (G.player.body.velocity.x < 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = G.playerAcceleration;
    } else {
        G.player.body.acceleration.x = 0;
    }

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
};

GameState.prototype.resetGame = function() {
    // Start physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Set gravity
    game.physics.arcade.gravity.y = G.gravity;

    // Adjustment for physics tunneling
    game.physics.arcade.OVERLAP_BIAS = G.groundSize * 0.75;
};

GameState.prototype.addPlayer = function() {
    G.player = game.add.sprite(game.width/2, 50, 'sprites', 'player-00.png');
    G.player.width = 48;
    G.player.height = 48;
    G.player.anchor.setTo(0.5, 0.5);
    game.physics.enable(G.player, Phaser.Physics.ARCADE);
    G.player.body.collideWorldBounds = true;
    G.player.body.checkCollision.up = false;
    G.player.body.mass = G.playerMass;
    G.player.body.bounce.set(G.playerBounce, 0);
    G.player.body.maxVelocity.setTo(G.playerMaxSpeed, G.playerMaxSpeed * 10);
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
        '#######..........#######',
        '........................',
        '........................',
        '..........####..........',
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

                var g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
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

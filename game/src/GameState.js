var GameState = function(game) {
    this.name = 'game';
};

GameState.prototype.create = function() {
    G.setupStage();

    this.resetGame();

    this.buildWorld();

    this.addPlayer();

    if (G.devMode) {
        this.fps = game.add.text(5, 5, '', { font: '14px ' + G.mainFont, fill: '#ffffff' });
    }
};

GameState.prototype.update = function() {
    // Collide player with ground
    game.physics.arcade.collide(G.player, G.ground);

    this.movePlayer();

    if (G.devMode) {
        this.fps.setText('FPS: ' + game.time.fps);
    }
};

GameState.prototype.movePlayer = function() {
    if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        if (G.player.body.velocity.x > 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = -G.world.playerAcceleration;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        if (G.player.body.velocity.x < 0) G.player.body.velocity.x = G.player.body.velocity.x * 0.8;
        G.player.body.acceleration.x = G.world.playerAcceleration;
    } else {
        G.player.body.acceleration.x = 0;
    }

    if (G.player.body.touching.down) G.player.canJump = true;
    if (G.player.canJump && this.input.keyboard.downDuration(Phaser.Keyboard.UP, 150)) {
        G.player.body.velocity.y = G.world.playerJumpSpeed;
    }
    if (!this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        G.player.canJump = false;
    }
};

GameState.prototype.resetGame = function() {
    if (G.devMode) {
        // Advanced timing (for fps)
        game.time.advancedTiming = true;
    }

    // Start physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Set gravity
    game.physics.arcade.gravity.y = G.world.gravity;
};

GameState.prototype.addPlayer = function() {
    G.player = game.add.sprite(game.width/2 - 24, 50, 'sprites', 'player-00.png');
    G.player.width = 48;
    G.player.height = 48;
    game.physics.enable(G.player, Phaser.Physics.ARCADE);
    G.player.body.collideWorldBounds = true;
    G.player.body.mass = G.world.playerMass;
    G.player.body.drag.setTo(G.world.playerDrag, 0);
    G.player.body.maxVelocity.setTo(G.world.playerMaxSpeed, G.world.playerMaxSpeed * 10);
};

GameState.prototype.buildWorld = function() {
    // Set top world boundary above the top of the camera so that
    // the player can jump without hitting his head on the sky.
    game.world.setBounds(0, -game.height, game.width, game.height*2);

    // Ground
    var world = [
        '....................',
        '....................',
        '....................',
        '#####..........#####',
        '....................',
        '....................',
        '........####........',
        '....................',
        '....................',
        '....................',
        '####################',
    ];
    var groundSize = 32;

    G.ground = game.add.group();
    for(var i = 0; i < world.length; i++) {
        for(var j = 0; j < world[i].length; j++) {
            if (world[i].substr(j, 1) == '#') {
                x = j * groundSize;
                y = i * groundSize + game.height % groundSize;

                var g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
                game.physics.enable(g, Phaser.Physics.ARCADE);
                g.body.allowGravity = false;
                g.body.immovable = true;
                G.ground.add(g);
            }
        }
    }
};
var GameState = function(game) {
    this.name = 'game';
};

GameState.prototype.create = function() {
    G.setupStage();

    this.resetGame();

    this.buildWorld();

    this.addPlayer();
};

GameState.prototype.update = function() {
    // Collide player with ground
    game.physics.arcade.collide(G.player, G.ground);
};

GameState.prototype.resetGame = function() {
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
};

GameState.prototype.buildWorld = function() {
    var x, y, n;

    // Ground
    var platformWidth = 4;
    var tileSize = 32;

    G.ground = game.add.group();
    var g;
    x = 0;
    while(x < game.width) {
        g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
        game.physics.enable(g, Phaser.Physics.ARCADE);
        g.body.allowGravity = false;
        g.body.immovable = true;
        g.y = game.height - g.height;
        x += g.width;
        G.ground.add(g);
    }

    // Middle platform
    x = game.width * 0.5 - platformWidth * tileSize * 0.5;
    n = 0;
    while(true) {
        g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
        game.physics.enable(g, Phaser.Physics.ARCADE);
        g.body.allowGravity = false;
        g.body.immovable = true;
        g.y = game.height - g.height * 5;
        x += g.width;
        n++;
        G.ground.add(g);
        if (n >= platformWidth) break;
    }

    // Top left
    platformWidth += 1;
    x = 0;
    n = 0;
    while(true) {
        g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
        game.physics.enable(g, Phaser.Physics.ARCADE);
        g.body.allowGravity = false;
        g.body.immovable = true;
        g.y = game.height - g.height * 8;
        x += g.width;
        n++;
        G.ground.add(g);
        if (n >= platformWidth) break;
    }

    // Top right
    x = game.width - platformWidth * tileSize;
    n = 0;
    while(true) {
        g = game.add.sprite(x, y, 'sprites', 'ground-00.png');
        game.physics.enable(g, Phaser.Physics.ARCADE);
        g.body.allowGravity = false;
        g.body.immovable = true;
        g.y = game.height - g.height * 8;
        x += g.width;
        n++;
        G.ground.add(g);
        if (n >= platformWidth) break;
    }
};

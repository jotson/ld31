var G = {
    devMode: false,

    game: null,
    width: 1280, /* stage width in pixels */
    height: 720, /* stage height in pixels */

    gravity: 4800,

    playerAcceleration: 3000,
    playerJumpSpeed: -1200,
    playerJumpDuration: 200,
    playerMaxSpeed: 1000,
    playerDrag: 2000,
    playerMass: 1,
    playerBounce: 0.3,
    playerHealth: 5,

    snowmanSpeed: 500,
    snowmanJump: 1200,
    snowmanMaxSpeed: 300,
    snowmanDrag: 600,
    snowmanMovementTime: 150,
    snowmanWaitTime: 1750,
    snowmanAttackTime: 1000,
    snowmanMass: 10,
    snowmanBounce: 0.8,
    snowmanHealth: 60,
    snowmanInterval: 2000, /* millis */
    snowmanScore: 1000,

    bossHealth: 500,
    bossTimeThreshold: 30000, /* millis */
    bossScore: 10000,

    fuel: 0,
    fuelDisplay: 0,
    fuelValue: 50, /* units */
    fuelStart: 100, /* units */
    fuelBurnRate: 50, /* units per second */
    fuelMass: 100,
    fuelDrag: 300,
    fuelBounce: 0.8,
    fuelMaxSpeed: 50,
    fuelHealth: 2,
    fuelInterval: 5000, /* millis */
    fuelFallingSpeed: 100,
    fuelScore: 10,

    flameSpeed: 1500,
    flameJitter: 150,
    flameLifetime: 250,
    flameScore: 5,

    score: 0,
    scoreDisplay: 0,

    groundSize: 64,

    sfx: {}, /* sound effects */

    backgroundColor: 0x4488cc,
    mainFont: '"Luckiest Guy"',

    message: null,
    tutorial: {}
};

G.setupStage = function() {
    game.stage.backgroundColor = G.backgroundColor;
};

G.addRectangle = function(color) {
    var rect = game.add.graphics(0, 0);
    rect.beginFill(color, 1);
    rect.drawRect(0, 0, game.width, game.height);
    rect.endFill();

    return rect;
};

G.fadeIn = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 1;
    game.add.tween(curtain).to({ alpha: 0 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.fadeOut = function(length, color, delay) {
    if (delay === undefined) delay = 0;
    if (color === undefined) color = 0x000000;
    if (length === undefined) length = 500;

    var curtain = G.addRectangle(color);
    curtain.alpha = 0;
    game.add.tween(curtain).to({ alpha: 1 }, length, Phaser.Easing.Quadratic.In, true, delay);
};

G.showTutorial = function(flag, message) {
    if (G.message === null || G.message === undefined) {
        G.message = new Message();
    }
    if (G.tutorial[flag] === undefined) {
        G.tutorial[flag] = true;
        G.message.add(message);
    }
};

G.shake = function() {
    var tx = game.camera.x + 5;
    var ty = game.camera.y + 5;

    if (game.tweens.isTweening(game.camera)) return;

    var tween;
    tween = game.add.tween(game.camera)
        .to({ x: tx }, 10, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .start();

    tween = game.add.tween(game.camera)
        .to({ y: ty }, 10, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .start();
};

G.makeClouds = function() {
    if (G.cloudGroup === undefined) G.cloudGroup = game.add.group();

    var i, cloud;
    for(i = 0; i < 3; i++) {
        cloud = game.add.sprite(game.rnd.between(0, game.width), game.rnd.between(0, game.height * 0.5), 'sprites', 'cloud.png');
        game.physics.enable(cloud, Phaser.Physics.ARCADE);
        cloud.body.velocity.x = game.rnd.between(5, 40);
        cloud.body.allowGravity = false;
        cloud.alpha = 0.5;
        cloud.checkWorldBounds = true;
        cloud.outOfBoundsKill = true;
        cloud.events.onKilled.add(function() {
            this.x = -this.width;
            this.y = game.rnd.between(0, game.height * 0.5);
            this.revive();
        }, cloud);
    }
};

G.makeSnow = function() {
    var snowLife = 6000;

    var snow = game.add.emitter(game.width/2, 0, 500);
    snow.gravity = 100;
    snow.area = new Phaser.Rectangle(0, 0, game.width, 0);
    snow.makeParticles( 'sprites', 'snowflake.png' );
    snow.minParticleScale = 0.2;
    snow.maxParticleScale = 0.2;
    snow.alpha = 0.5;
    snow.setAll('body.maxVelocity', new Phaser.Point(Number.POSITIVE_INFINITY, 100));
    snow.start(false, snowLife, 100);
};
var game = new Phaser.Game(743, 396, Phaser.AUTO, 'game_div', { preload: preload, create: create, update: update, render: render});

function preload() {
    game.load.audio('bgm', 'bgm.ogg');
    game.load.audio('attackRod', '_attack_rod.ogg');
    game.load.audio('hitRod', '_hit_rod.ogg');
    game.load.spritesheet('felock', 'Geffen_Mage_02_noBG.png', 80, 130, 50);
    game.load.spritesheet('felock2', 'Geffen_Mage_14_noBG.png', 90, 140, 50);
    game.load.spritesheet('felock3', 'Felock_noBG.png', 60, 70, 50);
    game.load.spritesheet('comodo', 'Comodo_noBG.png', 150, 100, 42);
    game.load.image('background', 'back03.jpg');
}

var felock;
var felock2;
var felock3;
var comodo;
var background;
var cursors;
var attackButton;
var facing = 'right';
var attacking = false;
var attackTimer = 0;
var bgm;
var swing;
var hitRod;

function create() {
    background = game.add.tileSprite(0, 0, 743, 396, 'background');
    background.fixedToCamera = true;

    bgm = game.add.audio('bgm', 1, true);
    bgm.play('', 0, 0.3, true);

    swing = game.add.audio('attackRod');
    hitRod = game.add.audio('hitRod');

    game.stage.backgroundColor = '#001122';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    comodo = game.add.sprite(295, 250, 'comodo');
    game.physics.enable(comodo, Phaser.Physics.ARCADE);
    comodo.animations.add('idle', [0, 1, 2, 3, 4, 5], 8, true, true);
    comodo.animations.add('hurt', [38], 8, false, true);
    comodo.animations.add('dying', [39], 8, false, true);
    comodo.health = 5;
    comodo.anchor.setTo(0.5, 0.5);
    comodo.body.setSize(comodo.width-75, comodo.height-40, 0, 0);
    comodo.state = { hurting: false, died: false };
    comodo.hitRecoverTimer = 0;
    comodo.hitRecover = 500;
    comodo.animations.play('idle');

    felock2 = game.add.sprite(450, 150, 'felock2');
    felock2.animations.add('idle', [0, 1, 2, 3, 4, 5], 8, true, true);
    felock2.animations.play('idle');

    felock3 = game.add.sprite(300, 300, 'felock3');
    felock3.animations.add('idle', [0, 1, 2, 3], 8, true, true);
    felock3.animations.play('idle');

    felock = game.add.sprite(200, 250, 'felock');
    game.physics.enable(felock, Phaser.Physics.ARCADE);
    felock.anchor.setTo(0.5,0.5);
    felock.body.setSize(felock.width-20, felock.height-95, 0, 0);
    felock.scale.x *= -1;
    felock.animations.add('idle', [0, 1, 2, 3, 4], 10, true, true);
    felock.animations.add('walk', [10, 11, 12, 13, 14, 15, 16, 17], 10, true, true);
    felock.animations.add('attack', [30, 31, 32, 33, 34, 35, 36], 12, false, true);
    felock.inputEnabled = true;
    felock.input.enableDrag();

    cursors = game.input.keyboard.createCursorKeys();
    attackButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function render() {
    // game.debug.body(felock);
    // game.debug.body(comodo);
}

function update() {
    felock.body.velocity.x = 0;
    felock.body.velocity.y = 0;
    if (cursors.left.isDown)
    {
        if (facing == 'right') {
            felock.scale.x *= -1;
        }
        facing = 'left';
        felock.body.velocity.x = -80;
        felock.animations.play('walk');
    } else if(cursors.right.isDown) {
        if (facing == 'left') {
            felock.scale.x *= -1;
        }
        facing = 'right';
        felock.body.velocity.x = 80;
        felock.animations.play('walk');
    } else if (cursors.up.isDown) {
        felock.body.velocity.y = -80;
        felock.animations.play('walk');
    } else if (cursors.down.isDown) {
        felock.body.velocity.y = 80;
        felock.animations.play('walk');
    } else if (attackButton.isDown && game.time.now > attackTimer) {
        var canHitComodo = false;
        attacking = true;
        felock.animations.play('attack');
        game.physics.arcade.overlap(felock, comodo,
                                    function() {
                                        canHitComodo = true;
                                    },
                                    null, this);
        canHitComodo = canHitComodo && !(comodo.state.died);
        if (canHitComodo) {
            felock.animations.getAnimation('attack').onComplete.addOnce(function() {
                comodo.state.hurting = true;
                comodo.animations.play('hurt');
                comodo.hitRecoverTimer = game.time.now + comodo.hitRecover;
                hitRod.play('', 0, 1, false, false);
                comodo.health -= 1;
                if (comodo.health <= 0) {
                    comodo.state.died = true;
                    comodo.animations.play('dying');
                    var fadeOut = game.add.tween(comodo);
                    fadeOut.to({ alpha: 0 },
                               2000,
                               Phaser.Easing.Linear.None, true);
                    fadeOut.onComplete.add(function() { fadeOut.stop(); comodo.kill(); }, this);
                }
            }, this);
        } else {
            swing.play('', 0, 1, false, false);
        }
        attackTimer = game.time.now + 600;
    } else if(!attacking) {
        felock.animations.play('idle');
    }
    if (game.time.now > attackTimer && attackTimer != 0) {
        attacking = false;
    }
    if (game.time.now > comodo.hitRecoverTimer &&
        comodo.hitRecoverTimer > 0 && comodo.state.died == false) {
        comodo.state.hurting = false;
        comodo.animations.play('idle');
    }
}

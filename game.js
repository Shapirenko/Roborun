var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config)
var worldWidth = 9600
var playerspeed = 320
var score = 0
var scoreText
var money
var gameOver = false

function preload() {
    this.load.image('background', 'assets/Background.png');
    this.load.spritesheet('cyborg', 'assets/Cyborg-1.png', { frameWidth: 48, frameHeight: 32 });
    this.load.image('platform', 'assets/Platform.png');

    this.load.image('platform1', 'assets/IndustrialTile_1.png');
    this.load.image('platform2', 'assets/IndustrialTile_2.png');
    this.load.image('platform3', 'assets/IndustrialTile_3.png');

    this.load.image('box', 'assets/Box.png');
    this.load.image('barrel', 'assets/Barrel.png');
    this.load.image('screen', 'assets/Screen.png');

    this.load.image('money', 'assets/Money.png');
    this.load.image('bomb', 'assets/Bomb.png');
}

function create() {
    this.background = this.add.tileSprite(0, 0, worldWidth, game.config.height, 'background').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();


    for (var x = 0; x <= worldWidth; x = x + 64) {
        platforms.create(x, 1016, 'platform').setOrigin(0, 0).refreshBody();
    }

    for (var x = 0; x <= worldWidth; x = x + Phaser.Math.Between(400, 500)) {
        var y = Phaser.Math.Between(400, 900)
        platforms.create(x-64, y, 'platform1').setOrigin(0, 0).refreshBody();
        for(i = 0; i<=Phaser.Math.Between(1, 4); i++){
                platforms.create(x+64*i, y, 'platform2').setOrigin(0, 0).refreshBody();
        }        
        platforms.create(x+64*i, y, 'platform3').setOrigin(0, 0).refreshBody();
    }


    //
    objects = this.physics.add.staticGroup();

    for (var x = 0; x <= worldWidth; x = x + Phaser.Math.Between(200, 800)) {
        objects
            .create(x, 1016, 'screen')
            .setScale(Phaser.Math.FloatBetween(1.5, 3,))
            .setDepth(Phaser.Math.Between(0, 2))
            .setOrigin(0, 1)
            .refreshBody();
        objects
            .create(x = x + Phaser.Math.Between(50, 200), 1016, 'box')
            .setScale(Phaser.Math.FloatBetween(0.5, 1.2,))
            .setDepth(Phaser.Math.Between(0, 2))
            .setOrigin(0, 1)
            .refreshBody();
        objects
            .create(x = x + Phaser.Math.Between(45, 300), 1016, 'barrel')
            .setScale(Phaser.Math.FloatBetween(0.5, 1.2,))
            .setDepth(Phaser.Math.Between(0, 2))
            .setOrigin(0, 1)
            .refreshBody();
    }

    //

    player = this.physics.add.sprite(100, 450, 'cyborg').setDepth(1);

    player.setBounce(0);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 6, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    money = this.physics.add.group({
        key: 'money',
        repeat: 120,
        setXY: { x: 12, y: 0, stepX: 80 }
    });
    
    money.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    this.physics.add.collider(money, platforms);
    this.physics.add.overlap(player, money, collectMoney, null, this);

    scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '32px', fill: '#000' })
        .setOrigin(0,0)
        .setScrollFactor(0) 

    var resetButton = this.add.text(2, 100, 'reset',{ fontSize: '32px', fill: '#000' }).setInteractive().setScrollFactor(0);
    resetButton.on('pointerdown', () =>{      
        this.sceen.restart();       
    });
    
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
 
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //camera settings
    this.cameras.main.setBounds(0, 0, worldWidth, game.config.height);
    this.physics.world.setBounds(0, 0, worldWidth, game.config.height);

    //camera follow
    this.cameras.main.startFollow(player);

    this.scale.startFullscreen();
}


function update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-playerspeed);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(playerspeed);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectMoney(player, money) {
    money.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (money === 0) {
        money.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
    } 
    var x = (player.x < worldWidth) ? Phaser.Math.Between(0, worldWidth) : Phaser.Math.Between(0, worldWidth);

        var bomb = bombs.create(x, 0, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}   

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    gameOver = true;
}
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var worldWidth = 9600;

function preload() {
    this.load.image('background', 'assets/Background.png');
    this.load.image('cyborg', 'assets/Cyborg.png');
    this.load.image('platform', 'assets/Platform.png');
}

function create ()
{
    background = this.add.image(0, 0, 'background').setOrigin(0,0);
    background.displayWidth = game.config.width; 
    background.displayHeight = game.config.height;
    
    platforms = this.physics.add.staticGroup();

    for (var x = 0; x <= worldWidth; x = x + 32) {
        platforms.create(x, 1048, 'platform').setOrigin(0, 0).refreshBody();
    }

    player = this.physics.add.sprite(100, 450, 'cyborg');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);


    this.scale.startFullscreen();
}


function update ()
{
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}
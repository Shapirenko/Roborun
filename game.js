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
var playerspeed = 400
var score = 0
var scoreText
var money
var gameOver = false
var life = 1
var enemySpeed = 420

//Завантaження асетів
function preload() {

    this.load.image('background', 'assets/Background.png');

    this.load.spritesheet('cyborg', 'assets/Cyborg-1.png', { frameWidth: 96, frameHeight: 64 });
    this.load.spritesheet('cyborg_idle', 'assets/Cyborg_idle.png', { frameWidth: 40, frameHeight: 64 });
    this.load.spritesheet('cyborg_jump', 'assets/Cyborg_jump.png', { frameWidth: 60, frameHeight: 64 });
    this.load.spritesheet('cyborg_death', 'assets/Cyborg_death.png', { frameWidth: 76, frameHeight: 64 });

    this.load.spritesheet('enemy', 'assets/Idle.png', { frameWidth: 46, frameHeight: 48 });
    this.load.spritesheet('enemy_attack', 'assets/Attack.png', { frameWidth: 48, frameHeight: 74 });

    this.load.image('platform', 'assets/Platform.png');
    this.load.image('platform1', 'assets/IndustrialTile_1.png');
    this.load.image('platform2', 'assets/IndustrialTile_2.png');
    this.load.image('platform3', 'assets/IndustrialTile_3.png');

    this.load.image('box', 'assets/Box.png');
    this.load.image('barrel', 'assets/Barrel.png');
    this.load.image('screen', 'assets/Screen.png');

    this.load.spritesheet('money', 'assets/Money.png', { frameWidth: 34, frameHeight: 30 });
    this.load.image('bomb', 'assets/Bomb.png');
}

function create() {
    //Платформа в низу екрана
    this.background = this.add.tileSprite(0, 0, worldWidth, game.config.height, 'background').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();

    //Генерація платформ у повітрі
    for (var x = 0; x <= worldWidth; x = x + 64) {
        platforms.create(x, 1016, 'platform').setOrigin(0, 0).refreshBody();
    }

    for (var x = 0; x <= worldWidth; x = x + Phaser.Math.Between(400, 500)) {
        var y = Phaser.Math.Between(400, 850)
        platforms.create(x - 64, y, 'platform1').setOrigin(0, 0).refreshBody();
        for (i = 0; i <= Phaser.Math.Between(1, 4); i++) {
            platforms.create(x + 64 * i, y, 'platform2').setOrigin(0, 0).refreshBody();
        }
        platforms.create(x + 64 * i, y, 'platform3').setOrigin(0, 0).refreshBody();
    }



    objects = this.physics.add.staticGroup();
    //рандомна генерація об'єктів
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


    //створення персонажа
    player = this.physics.add.sprite(100, 450, 'cyborg').setDepth(1);

    player.setBounce(0);
    player.setCollideWorldBounds(true);
    //фнімація в ліву сторону 
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 6, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('cyborg_idle', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('cyborg_jump', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('cyborg_death', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: 1,
    });
    //Анімація в праву сторону 
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 6, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    //Анімація грошей 
    this.anims.create({
        key: 'money_idle',
        frames: this.anims.generateFrameNumbers('money', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_move',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    // Колізія гравця з платформами
    this.physics.add.collider(player, platforms);

    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 9,
        setXY: { x: 0, y: 0, stepX: 1000 }
    });


    this.physics.add.collider(player, enemies, hitEnemy, null, this);

    this.physics.add.overlap(player, enemies, function (player, enemy) {
        if (player.x < enemy.x && enemy.body.touching.left) {
            enemy.setVelocityX(-200);
        } else if (player.x > enemy.x && enemy.body.touching.right) {
            enemy.setVelocityX(200);
        }
    }, null, this);

    // Створення грошей
    money = this.physics.add.group({
        key: 'money',
        repeat: 120,
        setXY: { x: 12, y: 0, stepX: 80 }
    });
    hearts = this.physics.add.group({
        repeat: 20,
        setXY: { x: 12, y: 0, stepX: 400 }
    });

    money.children.iterate(function (child) {
        // Налаштування анімації для грошей
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.anims.play('money_idle', true);
    });

    //Взаємодія з грошима
    this.physics.add.collider(money, platforms);
    this.physics.add.overlap(player, money, collectMoney, null, this);
    // Pахунок
    scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '32px', fill: '#000' })
        .setOrigin(0, 0)
        .setScrollFactor(0)
    //Лінія життів
    lifeText = this.add.text(1500, 100, showLife(), { fontSize: '32px', fill: '#000' })
        .setOrigin(1, 0)
        .setScrollFactor(0)
    //Кнопка перезапуску
    var resetButton = this.add.text(2, 100, 'reset', { fontSize: '32px', fill: '#000' })
        .setInteractive()
        .setScrollFactor(0);

    //При натисканні рестарт
    resetButton.on('pointerdown', function () {
        console.log('restart')
        refreshBody()
    });
    // додання бомбочок
    bombs = this.physics.add.group();
    //Колізії бомбочок
    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //camera settings
    this.cameras.main.setBounds(0, 0, worldWidth, game.config.height);
    this.physics.world.setBounds(0, 0, worldWidth, game.config.height);

    //camera follow
    this.cameras.main.startFollow(player);

}

//Рух за допомогою стрілочок
function update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-playerspeed);
        player.anims.play('left', true);
        player.setScale(-1, 1);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(playerspeed);
        player.anims.play('right', true);
        player.setScale(1, 1);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
        player.anims.play('jump', true);
    }

    else if (!player.body.touching.down) {
        player.anims.play('jump', true);
    }


    //збір грошей
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
    //Колізія гравця та бомби
    function hitBomb(player, bomb) {
        bomb.disableBody(true, true);

        player.setTint(0xff0000);
        life -= 1
        lifeText.setText(showLife())

        console.log('boom')
        //Перевірка умови наявності життів
        if (life == 0) {
            gameOver = true
            //player.anims.play('death');
            this.physics.pause()

            this.add.text(660, 490, 'For restart press: ENTER', { fontSize: '64px', fill: '#fff' })
                .setScrollFactor(0);



            document.addEventListener('keyup', function (event) {
                if (event.code == 'Enter') {
                    window.location.reload()
                }
            });
        }
    }
    //Лінія життя
    function showLife() {
        var lifeLine = ''

        for (var i = 0; i < life; i++) {
            lifeLine = lifeLine + '🧯'
        }

        return lifeLine
    }

    //Функція перезапуску
    function refreshBody() {
        console.log('game over')
        location.reload()
    }

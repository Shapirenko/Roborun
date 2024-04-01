var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: true
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
var life = 5
var enemySpeed = 420
var enemyCount = 9

//Завантaження асетів
function preload() {

    this.load.image('background', 'assets/Background.png');

    this.load.spritesheet('cyborg', 'assets/Cyborg_run.png', { frameWidth: 57, frameHeight: 64 });

    this.load.spritesheet('enemy', 'assets/Idle.png', { frameWidth: 46, frameHeight: 48 });

    this.load.image('platform', 'assets/Platform.png');
    this.load.image('platform1', 'assets/IndustrialTile_1.png');
    this.load.image('platform2', 'assets/IndustrialTile_2.png');
    this.load.image('platform3', 'assets/IndustrialTile_3.png');

    this.load.image('box', 'assets/Box.png');
    this.load.image('barrel', 'assets/Barrel.png');
    this.load.image('screen', 'assets/Screen.png');

    this.load.spritesheet('money', 'assets/Money.png', { frameWidth: 34, frameHeight: 30 });
    this.load.image('bomb', 'assets/Bomb.png');
    this.load.image('battery', 'assets/Battery.png');
}

function create() {

    this.math = Phaser.Math;

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
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 10, end: 14 }),
        frameRate: 4,
        repeat: -1,
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 6, end: 9 }),
        frameRate: 8,
        repeat: -1,
    });
    this.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 22, end: 27 }),
        frameRate: 6,
        repeat: 1,
    });
    this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 15, end: 22 }),
        frameRate: 6,
        repeat: 1,
    });
    //Анімація в праву сторону 
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
    });

    //Анімація грошей 
    this.anims.create({
        key: 'money_idle',
        frames: this.anims.generateFrameNumbers('money', { start: 0, end: 5 }),
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

    enemy = this.physics.add.group({
        key: 'enemy',
        repeat: enemyCount,
        setXY: { x: 1000, y: 0, stepX: 1000 }
    });

    enemy.children.iterate(function (child) {
        child.setBounce(0);
        child.setCollideWorldBounds(true);
        child.moveBelow = 100;

        child.chasePlayer = true;
        child.setScale(1, 1);
        child.anims.play('enemy_move', true);
    });



    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);




    hearts = this.physics.add.group({
        key: 'battery',
        repeat: 20,
        setXY: { x: 12, y: 0, stepX: 400 }
    });

    hearts.children.iterate(function (child) {

        child.setScale(0.5);
    });

    this.physics.add.collider(hearts, platforms);
    this.physics.add.overlap(player, hearts, collectHearts, null, this);

    // Створення грошей
    money = this.physics.add.group({
        key: 'money',
        repeat: 120,
        setXY: { x: 12, y: 0, stepX: 80 }
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
    lifeText = this.add.text(1900, 30, showTextSymbols('⚡', life), { fontSize: '32px', fill: '#000' })
        .setOrigin(1, 0)
        .setScrollFactor(0)

    enemyText = this.add.text(300, 50, showTextSymbols('🧬', enemyCount), { fontSize: '32px', fill: '#000' })
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
        player.body.setSize(57, 64).setOffset(64, 0);
    } else if (cursors.right.isDown) {
        player.setVelocityX(playerspeed);
        player.anims.play('right', true);
        player.setScale(1, 1);
        player.body.setSize(57, 64).setOffset(0, 0);
    } else {
        player.setVelocityX(0);
        if (player.scaleX === -1) {
            player.anims.play('idle', true);
            player.body.setSize(57, 64).setOffset(64, 0);
        } else {
            player.anims.play('idle', true);
            player.body.setSize(57, 64).setOffset(0, 0);
        }
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
        player.anims.play('jump', true);
    } else if (!player.body.touching.down) {
        player.anims.play('jump', true);
    }

    enemy.children.iterate(function (enemy) {
        if (enemy.active) {
            const playerToEnemy = player.x - enemy.x;
            const playerToEnemyY = player.y - enemy.y;

            if (Math.abs(playerToEnemy) < 400) {
                const enemySpeedModifier = 50;
                const enemySpeedX = playerspeed * (playerToEnemy > 0 ? 1 : -1) * enemySpeedModifier / 200;

                enemy.setAccelerationX(enemySpeedX);

                if (Math.abs(playerToEnemyY) > 100) {
                    const enemySpeedY = playerspeed * (playerToEnemyY > 0 ? 1 : -1) * enemySpeedModifier / 200;
                    enemy.setAccelerationY(enemySpeedY);
                } else {
                    enemy.setAccelerationY(0);
                }

                enemy.setVelocityY(enemy.body.acceleration.y);

                enemy.anims.play('enemy_move', true);

                if (this.physics.world.collide(enemy, player)) {
                    enemy.setAccelerationX(0);
                    enemy.setVelocityY(0);
                }
            } else {
                const initEnemyX = enemy.x;
                const initEnemyY = enemy.y;

                if (Math.abs(playerToEnemy) > 100) {
                    const enemySpeedX = playerspeed * (initEnemyX > player.x ? -1 : 1) * enemySpeed / 500;
                    enemy.setAccelerationX(enemySpeedX);
                } else {
                    enemy.setAccelerationX(0);
                }

                if (playerToEnemyY > 100) {
                    const enemySpeedY = playerspeed * (initEnemyY > player.y ? -1 : 1) * enemySpeed / 500;
                    enemy.setAccelerationY(enemySpeedY);
                } else {
                    enemy.setAccelerationY(0);
                }

                enemy.setVelocityY(enemy.body.acceleration.y);
            }
        }
    }, this);
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

function collectHearts(player, hearts) {
    hearts.disableBody(true, true);

    console.log()

    life += 1;
    lifeText.setText(showTextSymbols('⚡', life))

    if (hearts === 0) {
        hearts.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
    }
    
}
//Колізія гравця та бомби
function hitBomb(player, bomb) {
    bomb.disableBody(true, true);

    player.setTint(0xff0000);
    life -= 1;
    lifeText.setText(showTextSymbols('⚡', life)); // Update health text

    console.log('boom');

    if (life === 0) {
        gameOver = true;
        this.physics.pause();

        this.add.text(560, 490, 'For restart press: ENTER', { fontSize: '64px', fill: '#fff' })
            .setScrollFactor(0);

        document.addEventListener('keyup', function (event) {
            if (event.code == 'Enter') {
                window.location.reload();
            }
        });
    }
}


//Лінія життя
function showTextSymbols(symbol, count) {
    var symbolLine = ''

    for (var i = 0; i < count; i++) {
        symbolLine = symbolLine + symbol
    }

    return symbolLine
}

//Функція перезапуску
function refreshBody() {
    console.log('game over')
    location.reload()
}

function hitEnemy(player, enemy) {
    enemy.disableBody(true, true);

    player.setTint(0xff0000);
    life -= 1;
    lifeText.setText(showTextSymbols('⚡', life));

    enemyCount -= 1;
    enemyText.setText(showTextSymbols('🧬', enemyCount));

    console.log('enemy hit');

    if (life === 0) {
        gameOver = true;
        this.physics.pause();

        this.add.text(660, 490, 'For restart press: ENTER', { fontSize: '64px', fill: '#fff' })
            .setScrollFactor(0);

        document.addEventListener('keyup', function (event) {
            if (event.code == 'Enter') {
                window.location.reload();
            }
        });
    }
}
// Calculate the range between the player and the enemy
function calculateRange(player, enemy) {
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Update the enemy's behavior
function updateEnemy(enemy, player) {
    // Calculate the range between the player and the enemy
    var range = calculateRange(player, enemy);

    // If the range is within the enemy's attack range
    if (range <= enemyAttackRange) {
        // Attack the player
        hitEnemy(player, enemy);
    } else {
        // Move towards the player
        var enemySpeedX = 0;
        var enemySpeedY = 0;

        if (Math.abs(player.x - enemy.x) > 100) {
            enemySpeedX = playerspeed * (player.x > enemy.x ? -1 : 1) * enemySpeed / 1000;
            enemy.setAccelerationX(enemySpeedX);
        } else {
            enemy.setAccelerationX(0);
        }

        if (Math.abs(player.y - enemy.y) > 100) {
            enemySpeedY = playerspeed * (player.y > enemy.y ? -1 : 1) * enemySpeed / 1000;
            enemy.setAccelerationY(enemySpeedY);
        } else {
            enemy.setAccelerationY(0);
        }

        // Set the enemy's velocity
        enemy.setVelocityY(enemy.body.acceleration.y);

        // Play the enemy's idle animation
        enemy.anims.play('enemy_idle', true);
    }
}
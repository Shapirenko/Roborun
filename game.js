var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
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
var worldWidth = 3840
var playerspeed = 400
var score = 0
var scoreText
var money
var gameOver = false
var life = 5
var enemySpeed = 400
var enemyCount = 0
var totalStars = 0
var attackCooldown = false;

//Завантaження асетів
function preload() {

    this.load.image('background', 'assets/Background.png');

    this.load.spritesheet('cyborg', 'assets/Necromancer.png', { 
        frameWidth: 84,
        frameHeight: 104,
        margin: 124,
        spacing: 236,  });
    this.load.image('slash', 'assets/Attack.png');

    this.load.spritesheet('enemy', 'assets/Idle.png', { frameWidth: 46, frameHeight: 48 });

    this.load.image('platform', 'assets/Platform.png');
    this.load.image('platform1', 'assets/IndustrialTile_1.png');
    this.load.image('platform2', 'assets/IndustrialTile_2.png');
    this.load.image('platform3', 'assets/IndustrialTile_3.png');

    this.load.image('box', 'assets/Box.png');
    this.load.image('barrel', 'assets/Barrel.png');
    this.load.image('screen', 'assets/Screen.png');

    this.load.spritesheet('scull', 'assets/Skull.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('money', 'assets/Money.png', { frameWidth: 34, frameHeight: 30 });
    this.load.spritesheet('bomb', 'assets/Bomb_1.png', { frameWidth: 64, frameHeight: 64 });
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

    if (this.textures.exists('cyborg')) {
        console.log('Cyborg texture loaded');
    } else {
        console.log('Cyborg texture not found');
    }
    
    //створення персонажа
    player = this.physics.add.sprite(100, 450, 'cyborg').setDepth(1);
    


    player.setBounce(0);
    player.setCollideWorldBounds(true);
    //фнімація в ліву сторону 
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 17, end: 22 }),
        frameRate: 8,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
    });
    this.anims.create({
        key: 'airmove',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 17, end: 22 }),
        frameRate: 8,
        repeat: -1,
    });
    this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 34, end: 50 }),
        frameRate: 17,
        repeat: 0,
    });
    this.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 68, end: 76 }),
        frameRate: 6,
        repeat: 1,
    });
    //Анімація в праву сторону 
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 17, end: 22 }),
        frameRate: 8,
        repeat: -1
    });
    this.anims.create({
        key: 'hit',
        frames: this.anims.generateFrameNumbers('cyborg', { start: 51, end: 55 }), 
        frameRate: 10,
        repeat: 0
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

    this.anims.create({
        key: 'bomb_idle',
        frames: this.anims.generateFrameNumbers('bomb', { start: 0, end: 29 }), // Adjust start and end based on frames available
        frameRate: 18, // Adjust frame rate for smoothness
        repeat: -1     // Loop the animation
    });

    this.anims.create({
        key: 'projectile_anim',
        frames: this.anims.generateFrameNumbers('scull', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // Колізія гравця з платформами
    this.physics.add.collider(player, platforms);

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

    enemy = this.physics.add.group();

    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);

    hearts = this.physics.add.group();

    this.physics.add.collider(hearts, platforms);
    this.physics.add.overlap(player, hearts, collectHearts, null, this);

    projectiles = this.physics.add.group();

    // Set up controls
    this.input.on('pointerdown', attack, this);
    //camera settings
    this.cameras.main.setBounds(0, 0, worldWidth, game.config.height);
    this.physics.world.setBounds(0, 0, worldWidth, game.config.height);

    //camera follow
    this.cameras.main.startFollow(player);

}

//Рух за допомогою стрілочок
function update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (player.anims.currentAnim && player.anims.currentAnim.key === 'hit') {
        return; // Skip update while playing "hit" animation
    }

    if (player.anims.currentAnim && player.anims.currentAnim.key === 'attack') {
        return; // Skip updates while attacking
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-playerspeed);
        player.anims.play('left', true);
        player.setScale(-1, 1);
        player.body.setOffset(84, 0);
    } else if (cursors.right.isDown) {
        player.setVelocityX(playerspeed);
        player.anims.play('right', true);
        player.setScale(1, 1);
        player.body.setOffset(0, 0);
    } else {
        player.setVelocityX(0);
        if (player.scaleX === -1) {
            player.anims.play('idle', true);
            player.body.setOffset(84, 0);
        } else {
            player.anims.play('idle', true);
            player.body.setOffset(0, 0);
        }
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-600);
        player.anims.play('airmove', true);
    } else if (!player.body.touching.down) {
        player.anims.play('airmove', true);
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

    bombs.children.iterate(function (bomb) {
        if (bomb.active) {
            // Update the bomb's rotation based on its velocity direction
            bomb.rotation = Math.atan2(bomb.body.velocity.y, bomb.body.velocity.x);
        }
    });

    projectiles.children.iterate(function (projectile) {
        if (projectile.active) {
            // Disable gravity for projectiles
            projectile.body.gravity.y = 0;
        }
    });

    
}

function collectMoney(player, money) {
    money.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    

    // Check if the score is a multiple of 10
    if (score % 10 === 0) {
        spawnBomb();
        totalStars++;
    }

    // Check if the score is a multiple of 100
    if (score % 80 === 0) {
        spawnBattery();
    }

    if (score % 50 === 0) {
        spawnEnemy();
        enemyCount +=1;
    }

    if (totalStars === 120) {
        // Display end text
        this.add.text(560, 490, 'Congratulations! You collected all stars!\nPress ENTER to play again.', { fontSize: '32px', fill: '#fff' })
            .setScrollFactor(0);

        // Listen for key press to restart the game
        document.addEventListener('keyup', function (event) {
            if (event.code == 'Enter') {
                window.location.reload();
            }
        });
    }
}

function spawnBattery() {
    var battery = hearts.create(player.x, player.y - 500, 'battery'); // Spawn directly above the player
    battery.setScale(0.5);
    battery.setVelocity(0, 0); // Set velocity to zero so it doesn't move
}

function spawnBomb() {
    var x = (player.x < worldWidth) ? Phaser.Math.Between(0, worldWidth) : Phaser.Math.Between(0, worldWidth);
    var bomb = bombs.create(x, 0, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    bomb.body.setSize(52, 52); // Set new hitbox size (width, height)
    bomb.body.setOffset(11, 11); // Optional: Offset the hitbox from the sprite
    // Play the bomb idle animation
    bomb.anims.play('bomb_idle', true);
}

function spawnEnemy() {
    var newEnemy = enemy.create(player.x - 200, player.y - 500, 'enemy');
    newEnemy.setBounce(0);
    newEnemy.setCollideWorldBounds(true);
    newEnemy.setScale(1, 1);
    newEnemy.anims.play('enemy_move', true);
}

function collectHearts(player, hearts) {
    hearts.disableBody(true, true);

    life += 1;
    lifeText.setText(showTextSymbols('⚡', life))

    console.log('heal')


    if (hearts === 0) {
        hearts.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
    }

}
//Колізія гравця та бомби
function hitBomb(player, bomb) {
    bomb.disableBody(true, true); // Disable the bomb on collision

    player.anims.play('hit'); // Play the hit animation

    player.on('animationcomplete-hit', function () {
        player.anims.play('idle');
    });

    life -= 1; // Decrease player life
    lifeText.setText(showTextSymbols('⚡', life)); // Update life display

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
    enemy.disableBody(true, true); // Disable the enemy on collision
    
    player.anims.play('hit'); // Play the hit animation

    player.on('animationcomplete-hit', function () {
        player.anims.play('idle');
    });

    life -= 1; // Reduce life by 1
    lifeText.setText(showTextSymbols('⚡', life)); // Update life display

    enemyCount -= 1; // Reduce enemy count
    enemyText.setText(showTextSymbols('🧬', enemyCount)); // Update enemy display

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

function attack() {
    // Ensure attack is not on cooldown and that player can attack
    if (attackCooldown || (player.anims.currentAnim && player.anims.currentAnim.key === 'attack')) {
        return;
    }

    attackCooldown = true;
    projectileSpawned = false;

    // Play the attack animation
    player.anims.play('attack', true);

    // Event listener for the specific frame to spawn the projectile
    player.on('animationupdate', (anim, frame) => {
        if (frame.index === 5 && !projectileSpawned) {
            const projectile = projectiles.create(player.x, player.y, 'projectile_sprite');
            this.physics.add.existing(projectile);

            // Set gravity, bounce, and initial velocity
            projectile.body.setGravityY(300);
            projectile.body.setBounce(0.5);
            const velocityX = player.scaleX === -1 ? -1000 : 1000;
            const velocityY = -200;

            projectile.setVelocity(velocityX, velocityY);
            projectile.anims.play('projectile_anim', true);

            // Rotate the projectile based on its velocity
            projectile.update = function () {
                const angle = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
                projectile.setRotation(angle);
            };

            // Add collisions to destroy the projectile upon impact
            this.physics.add.collider(projectile, platforms, () => projectile.destroy());
            this.physics.add.overlap(projectile, enemies, (projectile, enemy) => {
                projectile.destroy();
                enemy.takeDamage(); // Example function for enemy
            });

            projectileSpawned = true;
        }
    });

    // Reset player state after the attack animation completes
    player.once('animationcomplete-attack', () => {
        player.anims.play('idle', true);
        attackCooldown = false;
    });
}

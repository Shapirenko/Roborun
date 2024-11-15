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
var stars = worldWidth/80
let playerScore = 0;       // Player's current score
let gameTime = 0;          // Time spent in the game (in seconds)
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || []; // Load leaderboard from localStorage
let timerInterval;

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

    this.load.spritesheet('scull', 'assets/Skull.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('money', 'assets/Money.png', { frameWidth: 34, frameHeight: 30 });
    this.load.spritesheet('bomb', 'assets/Bomb_1.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('battery', 'assets/HP.png');
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
        frameRate: 28,
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
        repeat: stars-1,
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
    lifeText = this.add.text(1900, 30, showTextSymbols('💀', life), { fontSize: '32px', fill: '#000' })
        .setOrigin(1, 0)
        .setScrollFactor(0)

    enemyText = this.add.text(195, 50, 'Enemies: ' + enemyCount, { fontSize: '32px', fill: '#000' })
        .setOrigin(1, 0)
        .setScrollFactor(0)

    //Кнопка перезапуску
    resetButton = this.add.text(2, 100, 'reset', { fontSize: '32px', fill: '#000' })
        .setInteractive()
        .setScrollFactor(0);

    //При натисканні рестарт
    resetButton.on('pointerdown', function () {
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

    gameTime = 0;
    timerInterval = setInterval(() => gameTime++, 1000)

    

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
    if (score % 60 === 0) {
        spawnBattery();
    }

    if (score % 50 === 0) {
        spawnEnemy();
        enemyCount +=1;
    }

    if (totalStars === stars) {
        // Display end text
        showLeaderboardPopup.call(this);
        gameOver = true;
        this.physics.pause();

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

// Function to spawn an enemy
function spawnEnemy() {
    var newEnemy = enemy.create(player.x - 200, player.y - 500, 'enemy');
    newEnemy.setBounce(0);
    newEnemy.setCollideWorldBounds(true);
    newEnemy.setScale(1, 1);
    newEnemy.anims.play('enemy_move', true);

    // Increment enemy count and update enemyText
    enemyCount += 1;
    enemyText.setText('Enemies: ' + enemyCount);
}

// Function for when the player collides with an enemy
function hitEnemy(player, enemy) {
    enemy.disableBody(true, true); // Disable the enemy on collision
    
    player.anims.play('hit'); // Play the hit animation

    player.on('animationcomplete-hit', function () {
        player.anims.play('idle');
    });

    life -= 1; // Reduce life by 1
    lifeText.setText(showTextSymbols('💀', life)); // Update life display

    // Decrement enemy count and update enemyText
    enemyCount -= 1;
    enemyText.setText('Enemies: ' + enemyCount);  // Update enemy text

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

function collectHearts(player, hearts) {
    hearts.disableBody(true, true);

    life += 1;
    lifeText.setText(showTextSymbols('💀', life))



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
    lifeText.setText(showTextSymbols('💀', life)); // Update life display

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
    // Completely reload the window, resetting all game states
    window.location.reload();
}
function attack() {
    if (attackCooldown || (player.anims.currentAnim && player.anims.currentAnim.key === 'attack')) {
        return;
    }

    attackCooldown = true;
    projectileSpawned = false;

    player.anims.play('attack', true);

    player.on('animationupdate', (anim, frame) => {
        if (frame.index === 14 && !projectileSpawned) {
            // Spawn the projectile at the right center of the player
            const spawnX = player.x + player.width / 2 * player.scaleX; // Adjust spawn based on facing direction
            const spawnY = player.y;
            const projectile = projectiles.create(spawnX, spawnY, 'projectile_sprite');
            this.physics.add.existing(projectile);

            // Set projectile hitbox to half size and adjust offset
            projectile.body.setSize(projectile.width * 1.5, projectile.height / 1.3);
            projectile.body.setOffset(projectile.width / 2, projectile.height / 1.3);

            // Determine velocity and flip based on player direction
            const velocityX = player.scaleX === -1 ? -1000 : 1000;
            projectile.setVelocity(velocityX, 0); // No Y velocity for a straight line
            projectile.body.setAllowGravity(false); // Disable gravity

            // Flip the projectile if firing to the left
            projectile.setFlipX(player.scaleX === -1);

            // Play the projectile animation
            projectile.anims.play('projectile_anim', true);

            // Update rotation to follow movement vector
            projectile.update = function () {
                const angle = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
                projectile.setRotation(angle);
            };

            // Destroy projectile on impact with platforms or enemies
            this.physics.add.collider(projectile, platforms, () => projectile.destroy());
            this.physics.add.overlap(projectile, enemy, (projectile, enemy) => {
                projectile.destroy();
                enemy.destroy();
                enemyCount -= 1;
                enemyText.setText('Enemies: ' + enemyCount);
            });

            // Destroy projectile and bomb on impact
            this.physics.add.overlap(projectile, bombs, (projectile, bomb) => {
                projectile.destroy();
                bomb.destroy();
            });

            projectileSpawned = true;
        }
    });

    player.once('animationcomplete-attack', () => {
        player.anims.play('idle', true);
        attackCooldown = false;
    });
}

// Function to show the leaderboard pop-up window centered on the screen

function showLeaderboardPopup() {
        // Stop the timer
        clearInterval(timerInterval);

        // Add current score and time to leaderboard
        leaderboard.push({ score: score, time: gameTime });
        leaderboard.sort((a, b) => b.score - a.score); // Sort leaderboard by score
        leaderboard = leaderboard.slice(0, 5); // Limit to top 5 scores
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

        // Build leaderboard list
        const leaderboardText = leaderboard.map((entry, index) => {
            return `<li>${index + 1}. Score: ${entry.score}, Time: ${entry.time} sec</li>`;
        }).join('');

        // Show leaderboard in the popup
        const popupOverlay = document.getElementById('popup-overlay');
        const popupTitle = document.getElementById('popup-title');
        const popupLeaderboard = document.getElementById('popup-leaderboard');
        const popupButton = document.getElementById('popup-button');

        // Ensure the elements exist before modifying them
        if (popupOverlay && popupTitle && popupLeaderboard && popupButton) {
            popupTitle.innerHTML = 'Leaderboard:';
            popupLeaderboard.innerHTML = leaderboardText;

            // Show the popup overlay
            popupOverlay.style.display = 'flex';

            // Restart button functionality
            popupButton.onclick = function () {
                console.log("Restart button clicked");
                refreshBody();
                popupOverlay.style.display = 'none'; // Hide the popup after clicking restart
            };

            // Close the popup on 'Enter' key press
            document.addEventListener('keyup', function (event) {
                if (event.code == 'Enter') {
                    console.log("Enter key pressed");
                    refreshBody();
                    popupOverlay.style.display = 'none'; // Hide the popup
                }
            }, { once: true });
        } else {
            console.error("Popup elements are not found.");
        }
}


// Optional: Remove pop-up elements if you need to
function removePopup() {
    this.popupElements.forEach(element => element.destroy());
}

function startTimer() {
    gameTime = 0;
    timerInterval = setInterval(() => {
      gameTime++;
      updateGameTimeUI(); // Function to update the time display if needed
    }, 1000);
  }
  
  function stopTimer() {
    clearInterval(timerInterval);
  }

  function saveToLeaderboard(name) {
    // Stop the timer
    stopTimer();
  
    // Create a new leaderboard entry
    const newEntry = {
      name: name || "Player",  // Replace with a prompt or user input if needed
      score: playerScore,
      time: gameTime
    };
  
    // Add the new entry to the leaderboard array
    leaderboard.push(newEntry);
  
    // Sort leaderboard by score, and then by time for ties (lower time is better)
    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
  
    // Keep only the top 5 entries (or any desired number)
    leaderboard = leaderboard.slice(0, 5);
  
    // Save updated leaderboard to localStorage
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }

  function endGame(won) {
    if (won) {
      // Stop the timer
      stopTimer();
  
      // Save the score to leaderboard
      const playerName = prompt("Enter your name:");
      saveToLeaderboard(playerName);
  
      // Show the leaderboard
      showLeaderboard();
    }
  }

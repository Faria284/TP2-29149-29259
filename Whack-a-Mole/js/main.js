// Variáveis globais para o jogo
let score = 0;
let lives = 10;
let level = 1;
let moleDisplayTime = 2000;
let moleHideTime = 1500;
let isGameOver = false;
let finalScore = 0;  // Adiciona a variável global para a pontuação final

// Definição da cena do menu principal
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('background', 'assets/campo.jpg');
    }

    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        const titleText = this.add.text(400, 200, 'Whack-a-Mole', {
            fontSize: '64px',
            fill: '#000',
            fontFamily: 'Impact',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#fff',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        titleText.setOrigin(0.5);

        const startText = this.add.text(400, 400, 'Press SPACE to Start', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333',
                blur: 2,
                stroke: true,
                fill: true
            }
        });
        startText.setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

// Definição da cena do jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'assets/campo.jpg');
        this.load.image('mole', 'assets/toupeira.png');
        this.load.image('bomb', 'assets/bomba.png');
        this.load.spritesheet('player', 'assets/AnimationSheet.png', { frameWidth: 24, frameHeight: 24 });

        // Carregar sons
        this.load.audio('backgroundMusic', 'assets/background.mp3');
        this.load.audio('hitSound', 'assets/hit.mp3');
        this.load.audio('gameOverSound', 'assets/gameover.mp3');
        this.load.audio('hitbomb', 'assets/bomb.mp3')
    }

    create() {
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        this.moles = this.physics.add.group({
            key: 'mole',
            repeat: 8,
            setXY: { x: Phaser.Math.Between(50, 750), y: Phaser.Math.Between(50, 550), stepX: 0, stepY: 0 }
        });

        this.bombs = this.physics.add.group({
            key: 'bomb',
            repeat: 2,
            setXY: { x: Phaser.Math.Between(50, 750), y: Phaser.Math.Between(50, 550), stepX: 0, stepY: 0 }
        });

        this.moles.children.iterate(function (mole) {
            mole.setScale(0.6);
            mole.setInteractive();
            mole.setVisible(false);
        });

        this.bombs.children.iterate(function (bomb) {
            bomb.setScale(0.6);
            bomb.setInteractive();
            bomb.setVisible(false);
        });

        this.player = this.physics.add.sprite(400, 300, 'player').setScale(3);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 13, end: 16 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'sit',
            frames: this.anims.generateFrameNumbers('player', { start: 41, end: 42 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'stop',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('player', { start: 39, end: 40 }),
            frameRate: 10,
            repeat: 0
        });

        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333',
                blur: 2,
                stroke: true,
                fill: true
            }
        });

        this.livesText = this.add.text(16, 56, 'Lives: 10', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Verdana',
            stroke: '#fff',
            strokeThickness: 3
        });

        this.levelText = this.add.text(600, 16, 'Level: 1', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333',
                blur: 2,
                stroke: true,
                fill: true
            }
        });

        this.gameOverText = this.add.text(400, 300, 'Game Over', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Impact',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);

        this.time.addEvent({
            delay: moleDisplayTime,
            callback: this.showObject,
            callbackScope: this,
            loop: true
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.killKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

        // Criar instâncias dos sons
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        this.hitSound = this.sound.add('hitSound');
        this.gameOverSound = this.sound.add('gameOverSound');
        this.hitbomb = this.sound.add('hitbomb');
    
        // Tocar música de fundo
        this.backgroundMusic.play();
    }

    update() {
        if (isGameOver) {
            return;
        }

        const playerSpeed = 300;
        let isMoving = false;

        if (this.wKey.isDown) {
            this.player.setVelocityY(-playerSpeed);
            isMoving = true;
        } else if (this.sKey.isDown) {
            this.player.setVelocityY(playerSpeed);
            isMoving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (this.aKey.isDown) {
            this.player.setVelocityX(-playerSpeed);
            isMoving = true;
        } else if (this.dKey.isDown) {
            this.player.setVelocityX(playerSpeed);
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (!isMoving) {
            this.player.body.enable = true;
            this.player.anims.play('stop', true);
        } else {
            this.player.anims.play('run', true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.killKey)) {
            this.player.anims.play('sit', true);
            this.checkHit();
        }
    }

    showObject() {
        let isMole = Math.random() < 0.8; // 80% chance de ser uma toupeira, 20% chance de ser uma bomba
        let object;
    
        if (isMole) {
            object = Phaser.Utils.Array.GetRandom(this.moles.getChildren());
        } else {
            object = Phaser.Utils.Array.GetRandom(this.bombs.getChildren());
        }
    
        let objectWidth = object.width * object.scaleX;
        let objectHeight = object.height * object.scaleY;
    
        // Defina a área onde os objetos podem aparecer
        let minX = 50;
        let maxX = 750;
        let minY = 100;
        let maxY = 500;
    
        object.setPosition(
            Phaser.Math.Between(minX + objectWidth / 2, maxX - objectWidth / 2),
            Phaser.Math.Between(minY + objectHeight / 2, maxY - objectHeight / 2)
        );
    
        object.setVisible(true);
        this.time.addEvent({
            delay: moleHideTime,
            callback: function() {
                if (object.visible) {
                    object.setVisible(false);
                    if (isMole) {
                        this.loseLife();
                    }
                }
            },
            callbackScope: this
        });
    }

    checkHit() {
        const playerCenterX = this.player.x;
        const playerCenterY = this.player.y;
    
        let objectHit = false;
    
        this.moles.children.iterate(function (mole) {
            if (mole.visible) {
                const moleBounds = mole.getBounds();
    
                if (playerCenterX >= moleBounds.left && playerCenterX <= moleBounds.right &&
                    playerCenterY >= moleBounds.top && playerCenterY <= moleBounds.bottom) {
                    mole.setVisible(false);
                    score += 10;
                    this.scoreText.setText('Score: ' + score);
                    this.updateMoleSpeed();
                    this.updateMoleScale();
                    this.updateLevel();
                    
                    // Tocar som de acerto
                    this.hitSound.play();
    
                    objectHit = true;
                }
            }
        }, this);
    
        if (!objectHit) {
            this.bombs.children.iterate(function (bomb) {
                if (bomb.visible) {
                    const bombBounds = bomb.getBounds();
    
                    if (playerCenterX >= bombBounds.left && playerCenterX <= bombBounds.right &&
                        playerCenterY >= bombBounds.top && playerCenterY <= bombBounds.bottom) {
                        bomb.setVisible(false);
                        score -= 50;
                        lives -= 2;
                        this.livesText.setText('Lives: ' + lives);
                        this.scoreText.setText('Score: ' + score);
                        
                        if (lives <= 0) {
                            this.gameOver();
                        }

                        this.hitbomb.play();
    
                        objectHit = true;
                    }
                }
            }, this);
        }
    }

    loseLife() {
        lives--;
        this.livesText.setText('Lives: ' + lives);
        if (lives == 0) {
            this.gameOver();
        }

        score -= 5; // Decrease score by 5 for each lost life
        this.scoreText.setText('Score: ' + score);

        if (score === 0) {
            this.gameOver();
        }
    }

    gameOver() {
        isGameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.stop();
        this.player.anims.play('die', true);
    
        this.player.on('animationcomplete', () => {
            this.player.setFrame(40);  // Define o último frame da animação 'die'
        }, this);
    
        finalScore = score;  // Definir a pontuação final
    
        this.gameOverText.setVisible(true);
        
        // Parar a música de fundo e tocar som de Game Over
        this.backgroundMusic.stop();
        this.gameOverSound.play();
    
        this.time.delayedCall(3000, () => {
            this.scene.start('GameOverScene');
        });
    }

    updateMoleSpeed() {
        if (score >= 800) {
            moleDisplayTime = 1200;
            moleHideTime = 1000;
        } else if (score >= 400) {
            moleDisplayTime = 1400;
            moleHideTime = 1200;
        } else if (score >= 200) {
            moleDisplayTime = 1600;
            moleHideTime = 1400;
        }
    }

    updateLevel() {
        if (score >= 800) {
            level = 4;
        } else if (score >= 400) {
            level = 3;
        } else if (score >= 200) {
            level = 2;
        } else {
            level = 1;
        }
        this.levelText.setText('Level: ' + level);
    }

    updateMoleScale() {
        let scale;
        if (score >= 800) {
            scale = 0.20;
        } else if (score >= 400) {
            scale = 0.40;
        } else if (score >= 200) {
            scale = 0.50;
        } else {
            scale = 0.6; // Valor padrão inicial
        }

        this.moles.children.iterate(function (mole) {
            mole.setScale(scale);
        });
    }
}

// Definição da cena de Game Over
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('background', 'assets/campo.jpg');
    }

    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        const gameOverText = this.add.text(400, 200, 'Game Over', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Impact',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        gameOverText.setOrigin(0.5);

        const finalScoreText = this.add.text(400, 300, 'Final Score: ' + finalScore, {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333',
                blur: 2,
                stroke: true,
                fill: true
            }
        });
        finalScoreText.setOrigin(0.5);

        const restartText = this.add.text(400, 400, 'Press R to Restart', {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'Arial',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333',
                blur: 2,
                stroke: true,
                fill: true
            }
        });
        restartText.setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            // Reinicia o jogo
            score = 0;
            finalScore = 0;  // Reiniciar a pontuação final
            lives = 10;
            level = 1;
            moleDisplayTime = 2000;
            moleHideTime = 1500;
            isGameOver = false;

            this.scene.start('GameScene', { backgroundMusic: this.backgroundMusic });
        });
    }
}

// Configuração principal do jogo
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
};

// Inicialização do jogo
let game = new Phaser.Game(config);





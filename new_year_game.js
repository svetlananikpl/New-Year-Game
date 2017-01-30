const HERO_UPDATE_FREQUENCY = 10;
const MAGIC_UPDATE_FREQUENCY = 5;
const EXPLOSION_UPDATE_FREQUENCY = 5;
const HEIGHT_SCORE_ELEMENT = 20;

class Game {
    constructor() {
        this.canvas = document.getElementById('main');
        this.bgCanvas = document.getElementById('background');
        this.context = this.canvas.getContext("2d");
        this.bgContext = this.bgCanvas.getContext('2d');
        this.imgsGift = [
            'img/gifts/gift.png',
            'img/gifts/gift2.png',
            'img/gifts/gift3.png',
            'img/gifts/gift4.png',
            'img/gifts/gift5.png',
            'img/gifts/gift6.png'];
        this.barriersArr = [];
        this.bg = {
            speed: 1,
            x: 0,
            y: 0};
        this.score = document.getElementById('score');
        this.life = document.getElementById('life');
        this.keysDown = {};
        this.lastTime = null;
        this.hit = false;
        this.initial = true;
        this.newGift = true;

    }

    init() {
        document.getElementById('game-over').style.display = 'none';
        this.frame = 0;
        this.count = 0;
        this.level = 5;
        this.heroLife = 3;
        this.hero = new SpritesCreature(256, 0, this.canvas.height / 2, 140, 70,
            resources.get('img/santasprite.png'), 0, 0, 150, 70, 3, 100);
        this.magic = new SpritesCreature(0, 0, 0, 90, 82,
            resources.get('img/explosionred.png'), 0, 0, 90, 82, 5, 100);
        this.explosion = new SpritesCreature(0, 0, 0, 90, 82,
            resources.get('img/explosionred.png'), 0, 100, 90, 82, 5, 100);
        let imageGift = this.imgsGift[randomInteger(0, 5)];
        this.gift = new Creature(1, this.canvas.height / 3, this.canvas.height / 3, 40, 45, resources.get(imageGift));
        this.barriersArr.push(new Creature(1, this.canvas.width, randomInteger(70, this.canvas.height - 70), 55, 70,
            resources.get('img/pineSapling.png')))

    }

    backgroundMove() {
        let imgBg = resources.get('img/bg.jpg');
        if (!this.hit) {
            this.bg.x -= this.bg.speed;
        }
        this.bgContext.drawImage(imgBg, this.bg.x, this.bg.y);
        this.bgContext.drawImage(imgBg, this.bg.x + this.bgCanvas.width, this.bg.y);
        if (this.bg.x < -this.bgCanvas.width)
            this.bg.x = 0;
    }

    barrierMove() {
        this.barriersArr.forEach(barrier=> {
            if (!this.hit) {
                barrier.x -= barrier.speed;
            }
            this.context.drawImage(barrier.img, barrier.x, barrier.y);
        });
    }

    giftMove() {
        if (!this.hit) {
            this.gift.x -= this.gift.speed;
        }
        this.context.drawImage(this.gift.img, this.gift.x, this.gift.y);
    }

    heroMove() {
        this.context.drawImage(this.hero.img, this.hero.spriteX, this.hero.spriteY,
            this.hero.spriteWidth, this.hero.spriteHeight, this.hero.x, this.hero.y, this.hero.width, this.hero.height);
        if (!this.hit) {
            if (!(this.frame % HERO_UPDATE_FREQUENCY)) {  //changing santa sprite every 10s frame
                this.frame = 0;
                this.hero.spriteX !== (this.hero.spriteWidth * (this.hero.spriteFrames - 1)) ?
                    this.hero.spriteX += this.hero.spriteWidth : this.hero.spriteX = 0;
            }
        }
    }

    exploding() {
        this.context.drawImage(this.explosion.img, this.explosion.spriteX, this.explosion.spriteY,
            this.explosion.spriteWidth, this.explosion.spriteHeight,
            this.hero.x + 100, this.hero.y - 20, this.explosion.width, this.explosion.height); //this.hero.x + 100, this.hero.y - 20 - the middle of a deer head
        if (!(this.frame % EXPLOSION_UPDATE_FREQUENCY)) {     //changing explosion sprite every 5s frame
            this.explosion.spriteX += this.explosion.spriteWidth;
        }
        if (this.explosion.spriteX === this.explosion.spriteWidth * (this.explosion.spriteFrames - 1)) {
            this.hit = false;
            this.explosion.spriteX = 0;
            this.newLife();
        }
    }

    newGiftMagicMove() {
        this.context.drawImage(this.magic.img, this.magic.spriteX, this.magic.spriteY,
            this.magic.spriteWidth, this.magic.spriteHeight, this.gift.x - 30, this.gift.y - 20, // this.gift.x - 30, this.gift.y - 20 the middle of a gift
            this.magic.width, this.magic.height);
        if (!(this.frame % MAGIC_UPDATE_FREQUENCY)) {  //changing magic sprite every 5s frame
            this.magic.spriteX += this.magic.spriteWidth;
        }
        if (this.magic.spriteX == this.magic.spriteWidth * (this.magic.spriteFrames - 1)) {
            this.newGift = false;
        }
    }

    listen() {
        let keysDown = this.keysDown;
        document.addEventListener('keydown', function (e) {
            keysDown[e.keyCode] = true;
        });
        document.addEventListener('keyup', function (e) {
            delete keysDown[e.keyCode];
        });
    }

    newLife() {
        if (!this.heroLife) {
            this.gameOver();
        }
        this.hero.x = 0;
        this.hero.y = this.canvas.height / 2;
        this.hero.spriteX = 0;
        this.hero.spriteY += this.hero.spriteRow;
        this.resetGift();
        this.barriersArr = [];
        this.barriersArr.push(new Creature(1, this.canvas.width, randomInteger(70, this.canvas.height - 70), 55, 70,
            resources.get('img/pineSapling.png')))
    }

    gameOver() {
        document.getElementById('game-over').style.display = 'block';
    }

    resetGift() {
        this.newGift = true;
        this.magic.spriteX = 0;
        this.gift.img = resources.get(this.imgsGift[randomInteger(0, 5)]);
        let x = randomInteger(0, this.canvas.width - this.gift.width);
        let y = randomInteger(HEIGHT_SCORE_ELEMENT, this.canvas.height - this.gift.height);// 20 size 'score'
        while (this.barriersArr.length && this.barriersArr.every((barrier=> {
            collides(barrier.x, barrier.y, barrier.width, barrier.height,
                x, y, this.gift.width, this.gift.height)
        }))) {
            x = randomInteger(0, this.canvas.width - this.gift.width);
            y = randomInteger(HEIGHT_SCORE_ELEMENT, this.canvas.height - this.gift.height)
        }
        this.gift.x = x;
        this.gift.y = y;
    }

    updateHeroXY(timeDiff) {
        if (!this.hit) {
            if (38 in this.keysDown) {
                this.hero.y -= this.hero.speed * timeDiff;
            }
            if (40 in this.keysDown) {
                this.hero.y += this.hero.speed * timeDiff;
            }
            if (37 in this.keysDown) {
                this.hero.x -= this.hero.speed * timeDiff;
            }
            if (39 in this.keysDown) {
                this.hero.x += this.hero.speed * timeDiff;
            }
        }
        if (this.hero.y < HEIGHT_SCORE_ELEMENT) {// 30 size 'score'
            this.hero.y = HEIGHT_SCORE_ELEMENT;
        }
        if (this.hero.x < 0) {
            this.hero.x = 0;
        }
        if (this.hero.x > this.canvas.width - this.hero.width) { // if out convas
            this.hero.x = this.canvas.width - this.hero.width;
        }
        if (this.hero.y > this.canvas.height - this.hero.height) { // if out convas
            this.hero.y = this.canvas.height - this.hero.height;
        }
    }

    updateGift() {
        if (this.gift.x < -this.gift.width) { // Check if gift out convas
            this.resetGift();
        }
        if (!this.hit) {
            // Check if hero and Gift are on the same square
            if (collides(this.gift.x, this.gift.y, this.gift.width, this.gift.height,
                    this.hero.x, this.hero.y, this.hero.width, this.hero.height)) {
                ++this.count;
                this.resetGift();
            }
        }
    }

    checkCollisionHeroBarriers() {
        // Check if hero and barrier are on the same square
        this.barriersArr.forEach(barrier=> {
            if (collides(barrier.x, barrier.y, barrier.width, barrier.height,
                    this.hero.x, this.hero.y, this.hero.width, this.hero.height)) {
                this.heroLife--;
                this.frame = 0;
                this.hit = true;
            }
        });
    }

    updateBarriers() {
        if (this.barriersArr.length && this.barriersArr[0].x < -this.barriersArr[0].width) {
            this.barriersArr.shift();
        }

        if (!this.hit) {
            if (Math.random() > 0.995 && this.barriersArr.length < this.level) { // pass a new barrier probability 5/1000
                this.barriersArr.push(new Creature(1, this.canvas.width, randomInteger(70, this.canvas.height - 70), 55, 70,
                    resources.get('img/pineSapling.png')))
            }
        }
    }

    updateLevel() {
        if (this.score > 100) {
            this.level++;
        }
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.heroLife) {
            this.backgroundMove();
            this.barrierMove();
            this.giftMove();
            this.heroMove();
            if (this.hit) {
                this.exploding();
            }
            if (this.newGift) {
                this.newGiftMagicMove();
            }
        } else {
            this.exploding();
        }
        this.score.innerHTML = this.count;
        this.life.innerHTML = this.heroLife;
    }

    main() {
        if (this.initial) {
            this.sound = new Sound("Sound/Jingle Bells.mp3");
            this.init();
            document.getElementById('play-again').addEventListener('click', () =>
                this.init());
            document.getElementById('sound').addEventListener('click', () =>
                this.sound.stop());
            this.initial = false;
        }
        const now = Date.now();
        if (this.heroLife && !this.hit) {
            this.updateHeroXY((now - this.lastTime) / 1000);
            this.updateGift();
            this.checkCollisionHeroBarriers();
            this.updateBarriers();
            this.updateLevel();
        }
        this.frame++;
        this.render();
        this.lastTime = now;
        requestAnimationFrame(this.main.bind(this));
    }
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame;
})();

let theGame = new Game();
resources.load([
    'img/santasprite.png',
    'img/bg.jpg',
    'img/gifts/gift.png',
    'img/gifts/gift2.png',
    'img/gifts/gift3.png',
    'img/gifts/gift4.png',
    'img/gifts/gift5.png',
    'img/gifts/gift6.png',
    'img/pineSapling.png',
    'img/explosionred.png'
]);

resources.onReady(theGame.main, theGame);
theGame.listen();

class Creature {
    constructor(speed, x, y, width, height, img) {
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
    }
}

class SpritesCreature extends Creature {
    constructor(speed, x, y, width, height, img, spriteX, spriteY, spriteWidth, spriteHeight, spriteFrames, spriteRow) {
        super(speed, x, y, width, height, img);
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.spriteFrames = spriteFrames;
        this.spriteRow = spriteRow;
    }
}

class Sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.volume = 0.2;
        this.sound.autoplay = "autoplay";
        this.sound.loop = "loop";
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.stop = function(){
            this.sound.pause();
        }
    }
}

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

function collides(x, y, w, h, x2, y2, w2, h2) {
    return !(x + w <= x2 || x > x2 + w2 ||
    y + h <= y2 || y > y2 + h2);
}


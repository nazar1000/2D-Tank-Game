"use strict"

// Canvas ----------------------------------------------------------
const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 900;


var state = {
    menu: true,
    game: false,
    gamemode: "none", //single, 2player, multiplayer
    endGame: false,
}

let tick = 0;
let menu;
let map;
let handler;
let hud;
let player1;
let player2;


const mouse = {
    x: null,
    y: null,
    click: false
}

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousedown", function () {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;

    // + window.pageYOffset - 7;
})

canvas.addEventListener("mouseup", function () {
    mouse.click = false;

});

canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;

    // console.log(mouse.x + " " + mouse.y);
});

const keyboard = {
    //player 1
    keyA: false,
    keyD: false,
    keyW: false,
    keyS: false,
    keyC: false,

    //player 2
    keyUp: false,
    keyDown: false,
    keyLeft: false,
    keyRight: false,
    keyDot: false
}

document.addEventListener("keydown", function (event) {
    // console.log(event)
    //player 1 controls
    if (event.key == "w") keyboard.keyW = true;
    if (event.key == "s") keyboard.keyS = true;
    if (event.key == "a") keyboard.keyA = true;
    if (event.key == "d") keyboard.keyD = true;
    if (event.key == "c") keyboard.keyC = true; //shoot

    //player 2 controls
    if (event.key == "ArrowUp") keyboard.keyUp = true;
    if (event.key == "ArrowDown") keyboard.keyDown = true;
    if (event.key == "ArrowLeft") keyboard.keyLeft = true;
    if (event.key == "ArrowRight") keyboard.keyRight = true;
    if (event.key == ".") keyboard.keyDot = true; //shoot


}, false);

document.addEventListener("keyup", function (event) {
    // console.log(event);
    //player 1 controls
    if (event.key == "a") keyboard.keyA = false;
    if (event.key == "d") keyboard.keyD = false;
    if (event.key == "w") keyboard.keyW = false;
    if (event.key == "s") keyboard.keyS = false;
    if (event.key == "c") keyboard.keyC = false;

    //player 2 controls
    if (event.key == "ArrowUp") keyboard.keyUp = false;
    if (event.key == "ArrowDown") keyboard.keyDown = false;
    if (event.key == "ArrowLeft") keyboard.keyLeft = false;
    if (event.key == "ArrowRight") keyboard.keyRight = false;
    if (event.key == ".") keyboard.keyDot = false;

    // console.log(event);	
}, false);


class Menu {
    constructor() {

    }

    update() {
        this.draw();
    }

    draw() {

        ctx.beginPath();
        ctx.font = "70px Arial";
        ctx.fillStyle = "black";

        let menuX = canvas.width / 2 - 100;
        ctx.fillText("1 Player", menuX / 2, 150);
        ctx.fillText("2 Player", menuX / 2, 300);
        ctx.fillText("Multiplayer", menuX / 2, 450);
        ctx.fillText(tick, menuX / 2, 600);

        if (mouse.y > 150 && mouse.y < 300 && mouse.click) {
            //start single player game
            state.menu = false;
            state.game = true;
            state.gamemode = "2player";
        }
    }

}

let walls = [];
let bullets = [];
class Map {
    constructor() {
        this.mapConfig = 1;
        this.isReady = false;
    }

    update() {
        if (!this.isReady) {
            player1.x = 0;
            player1.y = 0;

            if (state.gamemode == "2player") {
                player2.x = 200;
                player2.y = 200;
            }

            let gridX = 25;
            let gridY = 25;
            let gridWidth = canvas.width / gridX;
            let gridHeight = canvas.height / gridY;
            let repeat = false;

            for (let i = 0; i < 50; i++) {
                let randomX = Math.floor(Math.random() * gridX);
                let randomY = Math.floor(Math.random() * gridY);

                for (let w = 0; w < walls.length; w++) {
                    if (walls[w].x == randomX && walls[w].y == randomY) {
                        i--;
                        repeat = true;
                        break;
                    }

                }

                if (repeat) {
                    repeat = false;
                    continue;
                }
                walls.push(new Wall(randomX * gridWidth, randomY * gridHeight, gridWidth, gridHeight));
            }

            this.isReady = true;
        }

        this.draw();

    }

    draw() {

    }
}

class Wall {
    constructor(x, y, w, h) {
        this.x = x,
            this.y = y,
            this.width = w,
            this.height = h;
    }

    update() {

    }

    draw() {
        ctx.beginPath()

        ctx.fillStyle = "black";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    }
}

class Player {
    constructor(player) {
        this.x = 0;
        this.y = 0;
        this.width = 50;
        this.height = 50;
        this.player = player; //player 1 or 2
        this.angle = 1.5708; // Angle of tank

        this.speed = 1;
        this.dirX = 0;
        this.dirY = 0;

        this.bulletDelay = 20;
        this.bulletShot = 0; //frame when the last bullet was shot.

    }

    update() {
        this.speed = 0;

        if (this.player == 1) {
            if (keyboard.keyW) this.speed = 2;
            if (keyboard.keyS) this.speed = -2;
            if (keyboard.keyA) this.angle -= 0.02;
            if (keyboard.keyD) this.angle += 0.02;
            if (keyboard.keyC) {
                if (tick > this.bulletShot) {
                    bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height / 2, this.dirX, this.dirY, 1));
                    this.bulletShot = tick + this.bulletDelay;
                }
            }

        } else if (this.player == 2) {
            if (keyboard.keyUp) this.speed = 2;
            if (keyboard.keyDown) this.speed = -2;
            if (keyboard.keyLeft) this.angle -= 0.02;
            if (keyboard.keyRight) this.angle += 0.02;
            if (keyboard.keyDot) {
                if (tick > this.bulletShot) {
                    bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height / 2, this.dirX, this.dirY, 2));
                    this.bulletShot = tick + this.bulletDelay;
                }
            }

        }

        //Finding direction to player
        this.dirX = 5 * Math.cos(this.angle) + this.x;
        this.dirY = 5 * Math.sin(this.angle) + this.y

        this.dirX = this.dirX - this.x;
        this.dirY = this.dirY - this.y;

        var length = Math.sqrt(this.dirX * this.dirX + this.dirY * this.dirY);
        this.dirX /= length;
        this.dirY /= length;

        //Updating speed to player
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;

        this.draw();
    }

    draw() {

        //tank image
        // ctx.beginPath();
        // if (this.player == 1) ctx.fillStyle = "blue";
        // else if (this.player == 2) ctx.fillStyle = "red";

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        let imageStart;
        if (this.player == 1) imageStart = 0;
        else imageStart = tankImage.width / 2;

        ctx.drawImage(tankImage, imageStart,
            0, tankImage.width / 2, tankImage.height, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();

        // ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.fill();
    }
}

class Npc {
    constructor() {

    }
}

class Bullet {
    constructor(x, y, dirX, dirY, team) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = this.width;
        this.team = team; //1 - P1, 2 - P2, 3 - NPC

        this.speed = 3;
        this.dirX = dirX;
        this.dirY = dirY;

    }

    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
        this.draw();
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = "black";
        ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.fill();
    }
}

class Handler {
    constructor() {
    }

    update() {
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].update();

            if (outsideCanvas(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height)) {
                bullets.splice(i, 1);
                i--;
                console.log("removed bullet");
                continue;
            }

            //bullets overlaps players
            if (overlaps(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, player1.x, player1.y, player1.width, player1.height)) {
                if (bullets[i].team != 1) {
                    randomSpawn(player1);
                    if (bullets[i].team == 2) hud.p2Points++;
                    bullets.splice(i, 1);
                    i--;
                    continue;
                }
            } else if (overlaps(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, player2.x, player2.y, player2.width, player2.height)) {
                if (bullets[i].team != 2) {
                    randomSpawn(player2);
                    if (bullets[i].team == 1) hud.p1Points++;
                    bullets.splice(i, 1);
                    i--;
                    continue;
                }
            }

            //if overlaps walls
            for (let w = 0; w < walls.length; w++) {
                if (overlaps(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, walls[w].x, walls[w].y, walls[w].width, walls[w].height)) {
                    bullets.splice(i, 1);
                    i--;
                    break;
                }
            }

        }

        //if players


        for (let w = 0; w < walls.length; w++) {
            walls[w].draw(); //updates walls
            let ls = walls[w];

            // let collision = checkCollision(player1.x, player1.y, player1.width, player1.height, walls[w].x, walls[w].y, walls[w].width, walls[w].height);
            // if (collision == 1) player1.x = (walls[w].x - player1.width)//right
            // else if (collision == 2) player1.x = (walls[w].x + walls[w].width)//right

            // if (overlaps(player1.x, player1.y, player1.width, player1.height, walls[w].x, walls[w].y, walls[w].width, walls[w].height)) {
            //     let xDis = player1.x + player1.width / 2 - walls[w].x + walls[w].width / 2;
            //     let yDis = player1.y + player1.height / 2 - walls[w].y + walls[w].height / 2;
            //     console.log("ovelaps");

            //     if (Math.abs(xDis) < Math.abs(yDis)) {
            //         if (xDis > 0) player1.y = walls[w].y + walls[w].height;//left collision //top

            //         else if (xDis < 0) player1.x = walls[w].x - player1.width;//right collision
            //     } else if (Math.abs(xDis) > Math.abs(yDis)) {
            //         if (yDis > 0); //top collision
            //         else if (yDis < 0) player1.y = walls[w].y - player1.width;//bottom collision

            //         player1.x = walls[w].x + walls[w].width;//left collision
            //     }
            // }

            if (player1.x + player1.width < ls.x + 5) {//on the left (player)
                if (player1.x > ls.x - player1.width && //player width is touching
                    player1.y > ls.y - player1.height && player1.y < ls.y + ls.height) {
                    console.log("left");
                    player1.x = ls.x - player1.width;

                }
            }
            else if (player1.x > ls.x + ls.width - 5) {//on the right (player)
                if (player1.x < ls.x + ls.width && //player width is touching
                    player1.y > ls.y - player1.height && player1.y < ls.y + ls.height) {
                    console.log("right");
                    player1.x = ls.x + ls.width + 1;
                    if (player1.x == ls.x + ls.width) console.log("true");
                }
            }


            if (player1.y + player1.height < ls.y + 5) { //top (player)
                if (player1.y > ls.y - player1.height &&
                    player1.x > ls.x - player1.width && player1.x < ls.x + ls.height) {
                    console.log("top");
                    player1.y = ls.y - player1.height;
                }
            }

            else if (player1.y > ls.y + ls.height - 5) { //bottom (player)
                if (player1.y < ls.y + ls.height && //player width is touching
                    player1.x > ls.x - player1.width && player1.x < ls.x + ls.width) {
                    console.log("Bottom");
                    player1.y = ls.y + ls.height;
                }
            }

            // if (player1.x >= ls.x && player1.x + player1.width <= ls.x + ls.width) {//width matches (bigger)
            //     if (player1.y + player1.height >= ls.y && player1.y + player1.height < ls.y + ls.height) {
            //         //bottom collision
            //         console.log("bottom");

            //     } else if (player1.y <= ls.y + ls.height && player1.y > ls.y) {
            //         //top collision
            //         console.log("top");

            //     }
            // }
        }

    }

    draw() {

    }
}

class Hud {
    constructor() {
        this.p1Points = 0;
        this.p2Points = 0;

    }

    update() {

        this.draw();
    }

    draw() {
        ctx.beginPath();
        let localX = 100,
            localY = 100;

        ctx.fillStyle = "Blue";
        ctx.fillText("Blue: " + this.p1Points, localX, localY);

        ctx.beginPath()
        ctx.fillStyle = "Red";
        ctx.fillText("Red: " + this.p2Points, localX + 400, localY);
    }
}

setTimeout(function () {
    // canvas.style.cursor = "none"
    init();
    animate();

}, 2000);


//animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //testing purposes
    // frames++;
    // if (reset == true) {
    // 	start = Date.now();
    // 	reset = false;
    // }

    if (state.menu) {
        menu.update();
    } else if (state.game) {
        if (state.gamemode == "2player") {
            map.update();

            if (player1) player1.update();
            if (player2) player2.update();
        }

        handler.update();
        hud.update();
    }

    //Testing purposes
    // if ((Date.now() - start)/1000 >= 1) {
    // 	console.log("Frames " + frames);
    // 	frames = 0;
    // 	reset = true;
    // }
    tick++;
    requestAnimationFrame(animate);

}

function init() {
    menu = new Menu();
    map = new Map();
    handler = new Handler();
    hud = new Hud();
    player1 = new Player(1);
    player2 = new Player(2);

    // sound = new Sound();
    // player = new Player(canvas.width / 2, canvas.height - 130, 100, 100);
    // hud = new HUD();
    // shop = new Shop(hud);
    // spawner = new Spawn();
    // endGame = new EndGame();
}

function reset() {

}

let tankImage = new Image();
tankImage.src = "tanks.png";

function outsideCanvas(x, y, w, h) {
    if (x + w < 0 || x > canvas.width || y + h < 0 || y > canvas.height) return true;
    else return false;
}

function overlaps(x, y, w, h, rX, rY, rW, rH) {
    if ((x >= rX && x <= rX + rW) || (x + w >= rX && x + w <= rX + rW)) {
        if ((y >= rY && y <= rY + rH) || (y + h >= rY && y + h <= rY + rH)) {
            return true;
        } else return false;
    } else return false;
}

// add colision for sidesssssssssssssssssssssssssssssssssssss

//checks one side only for collision (in case of diffrent size obsticles)
function checkCollision(x, y, w, h, x1, y1, w1, h1) {

    // if (x + w > rx && x + w < rx + rw) {//collision on the left (right for colider)
    //     if (y + rh - Math.abs(y - ry) > y || y < ry && y + h > ry + rh) {
    //         console.log("collision on right");
    //     }

    // }
    // if (x < rx + rw && x > rx) {//collision on the right (left for colider)
    //     if (y + rh - Math.abs(y - ry) > y || y < ry && y + h > ry + rh) {
    //         console.log("collision on Left");
    //     }
    // }

    // if (y + rh - Math.abs(y - ry) > y || y < ry && y + h > ry + rh) { //if height is matched
    //     if (x + w > rx && x + w < rx + rw) {//collision on the left (right for colider)
    //         console.log("collision on right");
    //         return 1;
    //     } else if (x < rx + rw && x > rx) {//collision on the right (left for colider)
    //         console.log("collision on Left");
    //         return 2;
    //     }
    // }

    if ((y <= y1 && y + h >= y1 + h1) || (y > y1 && y + h < y1 + h1) || (y > y1 && y + h > y1 + h1 && y <= y1 + h1) || y < y1 && y + h < y1 + h1 && y + h >= y1) { //if height is matched
        if ((x >= x1 && x + w <= x1 + w1) ||
            (x < x1 && x + w > x1 + w1)) { //collision at the top (bottom for colider)
            console.log("collision on Bottom");
        }

        else if (x + w > x1 && x + w < x1 + w1) {//collision on the left (right for colider)
            console.log("collision on right");
            return 1;
        } else if (x < x1 + w1 && x > x1) {//collision on the right (left for colider)
            console.log("collision on Left");
            return 2;
        }
    }



    // if (y < ry + rh && y > ry) {//collision on buttom (top for colider)
    //     if (x + rx - Math.abs(x - rx) > x || x < rx && x + w > rx + rx) {
    //         console.log("collision on Top");
    //     }
    // }
    // if (y+h > ry && y+h < ry+rh) { //collision on top (bottom for colider)

    // }
}



function randomSpawn(player) {
    player.x = Math.floor(Math.random() * canvas.width - player.width);
    player.y = Math.floor(Math.random() * canvas.height - player.height);
}
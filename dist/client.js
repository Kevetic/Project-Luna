"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let x = 100;
let y = 100;
let x2 = 500;
let y2 = 500;
const speed = 3;
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
function update() {
    if (keys["ArrowLeft"])
        x2 -= speed;
    if (keys["ArrowRight"])
        x2 += speed;
    if (keys["ArrowUp"])
        y2 -= speed;
    if (keys["ArrowDown"])
        y2 += speed;
    if (keys["a"])
        x -= speed;
    if (keys["d"])
        x += speed;
    if (keys["w"])
        y -= speed;
    if (keys["s"])
        y += speed;
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 50, 50);
    ctx.fillRect(x2, y2, 50, 50);
}
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
//# sourceMappingURL=client.js.map
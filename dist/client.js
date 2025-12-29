"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let x = 100;
let y = 100;
let x2 = 500;
let y2 = 500;
const speed = 3;
let flashUntil = 0; // timestamp (ms) when flash ends
const flashDurationMs = 120; // tweak 80–200ms to taste
let fWasDown = false; // edge detection so holding F doesn’t spam
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
function update() {
    // Detect F press (down-edge)
    function flashin() {
        const fIsDown = !!keys["f"];
        if (fIsDown && !fWasDown) {
            flashUntil = performance.now() + flashDurationMs;
        }
        fWasDown = fIsDown;
    }
    //Player One Controls
    if (keys["a"])
        x -= speed;
    if (keys["d"])
        x += speed;
    if (keys["w"])
        y -= speed;
    if (keys["s"])
        y += speed;
    // Player Two Controls
    if (keys["ArrowLeft"])
        x2 -= speed;
    if (keys["ArrowRight"])
        x2 += speed;
    if (keys["ArrowUp"])
        y2 -= speed;
    if (keys["ArrowDown"])
        y2 += speed;
    flashin();
}
function draw() {
    const now = performance.now();
    // Background
    ctx.fillStyle = now < flashUntil ? "red" : "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Player 1
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 50, 50);
    // Player 2 (example)
    ctx.fillStyle = "black";
    ctx.fillRect(x2, y2, 50, 50);
}
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
//# sourceMappingURL=client.js.map
"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const playerSize = 50;
const speed = 3;
// Player positions
let x = 100;
let y = 100;
let x2 = 500;
let y2 = 500;
// Player turn
let player = 0;
// Attack flash state
let flashUntil = 0;
const flashDurationMs = 120;
let fWasDown = false;
// Attack window: store timestamp "attack is active until this time"
let attackUntil = 0;
let hasHitThisAttack = false;
// Facing: 1 = right, -1 = left
let facing = 1;
//Player One HP
let maxHP = 100;
let currentHP = 100;
//Player Two HP
let maxHPTwo = 100;
let currentHPTwo = 100;
//Health Bar
const fullBarWidth = 200;
// Input
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
function rectsOverlap(a, b) {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}
function update() {
    const now = performance.now();
    // --- ATTACK INPUT (edge-triggered) ---
    const fIsDown = !!keys["f"];
    if (fIsDown && !fWasDown) {
        flashUntil = now + flashDurationMs;
        // attack is active for the same duration for now
        attackUntil = now + flashDurationMs;
        // allow 1 hit per attack
        hasHitThisAttack = false;
    }
    fWasDown = fIsDown;
    // --- PLAYER ONE MOVEMENT (also sets facing) ---
    if (keys["a"]) {
        x -= speed;
        if (player === 0) {
            facing = -1;
        }
    }
    if (keys["d"]) {
        x += speed;
        if (player === 0) {
            facing = 1;
        }
    }
    if (keys["w"])
        y -= speed;
    if (keys["s"])
        y += speed;
    // --- PLAYER TWO MOVEMENT ---
    if (keys["ArrowLeft"]) {
        x2 -= speed;
        if (player === 1)
            facing = -1;
    }
    if (keys["ArrowRight"]) {
        x2 += speed;
        if (player === 1)
            facing = 1;
    }
    if (keys["ArrowUp"])
        y2 -= speed;
    if (keys["ArrowDown"])
        y2 += speed;
    // --- HIT DETECTION (only while attack is active) ---
    const p1Box = { x, y, w: playerSize, h: playerSize };
    const p2Box = { x: x2, y: y2, w: playerSize, h: playerSize };
    const isAttacking = now < attackUntil;
    if (isAttacking && !hasHitThisAttack) {
        const attackW = 30;
        const attackH = playerSize;
        // pick attacker/target based on whose turn it is
        const attacker = player === 0 ? p1Box : p2Box;
        const target = player === 0 ? p2Box : p1Box;
        const attackX = facing === 1 ? attacker.x + playerSize : attacker.x - attackW;
        const attackY = attacker.y;
        const attackBox = { x: attackX, y: attackY, w: attackW, h: attackH };
        if (rectsOverlap(attackBox, target)) {
            hasHitThisAttack = true;
            flashUntil = now + 80;
            if (player === 0) {
                currentHPTwo -= 10;
                if (currentHPTwo < 0)
                    currentHPTwo = 0;
            }
            else {
                currentHP -= 10;
                if (currentHP < 0)
                    currentHP = 0;
            }
            if (currentHP <= 0) {
                alert("Player Two Wins");
            }
            else if (currentHPTwo <= 0) {
                alert("Player One Wins");
            }
            player = player === 0 ? 1 : 0;
        }
    }
}
function draw() {
    const now = performance.now();
    const isFlashing = now < flashUntil;
    const isAttacking = now < attackUntil;
    // Background
    ctx.fillStyle = isFlashing ? "red" : "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Player 1
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, playerSize, playerSize);
    // Player 2
    ctx.fillStyle = "black";
    ctx.fillRect(x2, y2, playerSize, playerSize);
    // Debug: outline hurtboxes
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, playerSize, playerSize);
    ctx.strokeRect(x2, y2, playerSize, playerSize);
    // Debug: draw attack box while attacking
    if (isAttacking) {
        const attackW = 30;
        const attackH = playerSize;
        const attackX = player === 0
            ? facing === 1
                ? x + playerSize
                : x - attackW
            : facing === 1
                ? x2 + playerSize
                : x2 - attackW;
        const attackY = player === 0 ? y : y2;
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.strokeRect(attackX, attackY, attackW, attackH);
    }
    // UI LAST (so it sits on top)
    ctx.fillStyle = "#bbb";
    ctx.font = "12px sans-serif";
    ctx.fillText(`Turn: Player ${player + 1}`, 10, 60);
    ctx.fillText("P1: WASD + F to attack", 10, 20);
    ctx.fillText("P2: Arrow keys", 10, 40);
    const ratio1 = currentHP / maxHP;
    const ratio2 = currentHPTwo / maxHPTwo;
    const barWidth1 = ratio1 * fullBarWidth;
    const barWidth2 = ratio2 * fullBarWidth;
    //player 1 health bar
    ctx.fillStyle = "purple";
    ctx.fillRect(200, 10, barWidth1, 20);
    ctx.strokeRect(200, 10, 200, 20);
    ctx.fillStyle = "yellow";
    ctx.fillText(`Player 1 ${currentHP} / ${maxHP}`, 200, 20);
    //player 2 health bar
    ctx.fillStyle = "yellow";
    ctx.fillRect(410, 10, barWidth2, 20);
    ctx.strokeRect(410, 10, 200, 20);
    ctx.fillStyle = "purple";
    ctx.fillText(`Player 2 ${currentHPTwo} / ${maxHPTwo}`, 415, 20);
}
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
//# sourceMappingURL=client.js.map
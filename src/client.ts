const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const playerSize = 50;
const speed = 3;

// Player positions
let x = 100;
let y = 100;
let x2 = 500;
let y2 = 500;

// Player turn
let player = 0; // 0 = P1, 1 = P2

// Attack flash state
let flashUntil = 0;
const flashDurationMs = 120;
let fWasDown = false;

// Attack window: store timestamp "attack is active until this time"
let attackUntil = 0;
let hasHitThisAttack = false;

// Facing per player: 1 = right, -1 = left
let facing1: -1 | 1 = 1;
let facing2: -1 | 1 = -1;

// Player One HP
const maxHP = 100;
let currentHP = 100;

// Player Two HP
const maxHPTwo = 100;
let currentHPTwo = 100;

// Health Bar
const fullBarWidth = 200;

// Winner state (null = game running)
let winner: 0 | 1 | null = null;

// Input
const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Optional: press R to reset after win
  if (e.key.toLowerCase() === "r") resetGame();
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function resetGame() {
  x = 100;
  y = 100;
  x2 = 500;
  y2 = 500;

  player = 0;

  flashUntil = 0;
  fWasDown = false;
  attackUntil = 0;
  hasHitThisAttack = false;

  facing1 = 1;
  facing2 = -1;

  currentHP = maxHP;
  currentHPTwo = maxHPTwo;

  winner = null;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function update() {
  const now = performance.now();

  // Freeze all gameplay once someone wins
  if (winner !== null) return;

  // --- ATTACK INPUT (edge-triggered) ---
  const fIsDown = !!keys["f"];

  if (fIsDown && !fWasDown) {
    flashUntil = now + flashDurationMs;
    attackUntil = now + flashDurationMs;
    hasHitThisAttack = false;
  }

  fWasDown = fIsDown;

  // --- TURN-BASED MOVEMENT ---
  // Only the active player can move (keeps turn-based reasoning clean)

  if (player === 0) {
    // Player One movement (also sets facing1)
    if (keys["a"]) {
      x -= speed;
      facing1 = -1;
    }
    if (keys["d"]) {
      x += speed;
      facing1 = 1;
    }
    if (keys["w"]) y -= speed;
    if (keys["s"]) y += speed;
  } else {
    // Player Two movement (also sets facing2)
    if (keys["ArrowLeft"]) {
      x2 -= speed;
      facing2 = -1;
    }
    if (keys["ArrowRight"]) {
      x2 += speed;
      facing2 = 1;
    }
    if (keys["ArrowUp"]) y2 -= speed;
    if (keys["ArrowDown"]) y2 += speed;
  }

  // --- HIT DETECTION (only while attack is active) ---
  const p1Box = { x, y, w: playerSize, h: playerSize };
  const p2Box = { x: x2, y: y2, w: playerSize, h: playerSize };

  const isAttacking = now < attackUntil;

  if (isAttacking && !hasHitThisAttack) {
    const attackW = 30;
    const attackH = playerSize;

    const attacker = player === 0 ? p1Box : p2Box;
    const target = player === 0 ? p2Box : p1Box;
    const attackerFacing = player === 0 ? facing1 : facing2;

    const attackX =
      attackerFacing === 1 ? attacker.x + playerSize : attacker.x - attackW;
    const attackY = attacker.y;

    const attackBox = { x: attackX, y: attackY, w: attackW, h: attackH };

    if (rectsOverlap(attackBox, target)) {
      hasHitThisAttack = true;
      flashUntil = now + 80;

      // Apply damage to the target only
      if (player === 0) {
        currentHPTwo -= 10;
        if (currentHPTwo < 0) currentHPTwo = 0;
      } else {
        currentHP -= 10;
        if (currentHP < 0) currentHP = 0;
      }

      // Decide winner and freeze the game
      if (currentHP <= 0) {
        winner = 1; // Player Two wins
      } else if (currentHPTwo <= 0) {
        winner = 0; // Player One wins
      } else {
        // Only swap turns if game is still going
        player = player === 0 ? 1 : 0;
      }
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

  // Players
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, playerSize, playerSize);

  ctx.fillStyle = "black";
  ctx.fillRect(x2, y2, playerSize, playerSize);

  // Debug: outline hurtboxes
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, playerSize, playerSize);
  ctx.strokeRect(x2, y2, playerSize, playerSize);

  // Debug: draw attack box while attacking
  if (isAttacking && winner === null) {
    const attackW = 30;
    const attackH = playerSize;

    const attackerX = player === 0 ? x : x2;
    const attackerY = player === 0 ? y : y2;
    const attackerFacing = player === 0 ? facing1 : facing2;

    const attackX =
      attackerFacing === 1 ? attackerX + playerSize : attackerX - attackW;
    const attackY = attackerY;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(attackX, attackY, attackW, attackH);
  }

  // UI
  ctx.fillStyle = "#bbb";
  ctx.font = "12px sans-serif";
  ctx.fillText("P1: WASD + F to attack", 10, 20);
  ctx.fillText("P2: Arrow keys + F to attack", 10, 40);
  ctx.fillText(`Turn: Player ${player + 1}`, 10, 60);

  // Derived bar widths
  const ratio1 = currentHP / maxHP;
  const ratio2 = currentHPTwo / maxHPTwo;
  const barWidth1 = ratio1 * fullBarWidth;
  const barWidth2 = ratio2 * fullBarWidth;

  // Player 1 health bar
  ctx.fillStyle = "purple";
  ctx.fillRect(200, 10, barWidth1, 20);
  ctx.strokeStyle = "#bbb";
  ctx.strokeRect(200, 10, fullBarWidth, 20);
  ctx.fillStyle = "yellow";
  ctx.fillText(`Player 1 ${currentHP} / ${maxHP}`, 200, 38);

  // Player 2 health bar
  ctx.fillStyle = "yellow";
  ctx.fillRect(410, 10, barWidth2, 20);
  ctx.strokeStyle = "#bbb";
  ctx.strokeRect(410, 10, fullBarWidth, 20);
  ctx.fillStyle = "purple";
  ctx.fillText(`Player 2 ${currentHPTwo} / ${maxHPTwo}`, 410, 38);

  // Winner overlay (no alerts)
  if (winner !== null) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "24px sans-serif";
    ctx.fillText(
      `Player ${winner + 1} Wins!`,
      canvas.width / 2 - 110,
      canvas.height / 2
    );

    ctx.font = "14px sans-serif";
    ctx.fillText(
      "Press R to reset",
      canvas.width / 2 - 60,
      canvas.height / 2 + 30
    );
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

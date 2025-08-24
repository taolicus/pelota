import { createEngine, createRunner } from "./core/engine.js";
import { setupKeyboardControls } from "./core/controls.js";
import { createRenderer } from "./core/renderer.js";
import { createWalls } from "./entities/walls.js";
import { Jugador } from "./entities/jugador.js";
import { Pelota } from "./entities/pelota.js";
import Matter from "matter-js";

const config = {
  width: 800,
  height: 600,
  ballRadius: 10,
  playerRadius: 20,
};

const gameState = {
  score: { red: 0, blue: 0 },
  isGamePaused: false,
  pauseTimer: 0,
};

const scoreDisplay = document.createElement("div");
scoreDisplay.style.position = "absolute";
scoreDisplay.style.top = "20px";
scoreDisplay.style.left = "50%";
scoreDisplay.style.transform = "translateX(-50%)";
scoreDisplay.style.color = "white";
scoreDisplay.style.fontFamily = "Arial, sans-serif";
scoreDisplay.style.fontSize = "24px";
document.body.appendChild(scoreDisplay);

function updateScoreDisplay() {
  scoreDisplay.textContent = `${gameState.score.red} - ${gameState.score.blue}`;
}

const engine = createEngine();
const render = createRenderer(document.body, engine);
const runner = createRunner();

const centerX = render.options.width / 2;
const centerY = render.options.height / 2;

const walls = createWalls(render.options.width, render.options.height);

const pelota = new Pelota(centerX, centerY, config.ballRadius);

const redTeam = [
  new Jugador(centerX - 100, centerY - 50, config.playerRadius, 0, "#f00"),
  new Jugador(centerX - 100, centerY + 50, config.playerRadius, 0, "#f00"),
];

const blueTeam = [
  new Jugador(
    centerX + 100,
    centerY - 50,
    config.playerRadius,
    Math.PI,
    "#00f"
  ),
  new Jugador(
    centerX + 100,
    centerY + 50,
    config.playerRadius,
    Math.PI,
    "#00f"
  ),
];

const jugadores = redTeam.concat(blueTeam);

jugadores.forEach((jugador) => {
  jugador.initAI(pelota);
});

Matter.Composite.add(engine.world, [
  ...walls,
  ...jugadores.map((jugador) => jugador.body),
  pelota.body,
]);

// setupKeyboardControls(engine, jugador);

updateScoreDisplay();

Matter.Render.run(render);
Matter.Runner.run(runner, engine);

Matter.Events.on(engine, "beforeUpdate", () => {
  if (gameState.isGamePaused) {
    gameState.pauseTimer--;
    if (gameState.pauseTimer <= 0) {
      gameState.isGamePaused = false;
      resetPositions();
    }
    return; // Pausar la actualización física
  }

  if (!gameState.isGamePaused) {
    jugadores.forEach((jugador) => jugador.updateAI());
  }

  pelota.limitVelocity();

  if (pelota.body.position.x > render.options.width + config.ballRadius) {
    // red team score
    gameState.score.red++;
    updateScoreDisplay();
    startGoalPause();
  }

  if (pelota.body.position.x < 0 - config.ballRadius) {
    // blue team score
    gameState.score.blue++;
    updateScoreDisplay();
    startGoalPause();
  }
});

function startGoalPause() {
  gameState.isGamePaused = true;
  gameState.pauseTimer = 60; // 1 segundo (60 frames)

  // Congelar todos los cuerpos
  Matter.Composite.allBodies(engine.world).forEach((body) => {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
  });
}

function resetPositions() {
  const centerX = render.options.width / 2;
  const centerY = render.options.height / 2;

  Matter.Body.setPosition(pelota.body, { x: centerX, y: centerY });
  Matter.Body.setVelocity(pelota.body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(pelota.body, 0);

  jugadores.forEach((jugador) => {
    Matter.Body.setPosition(jugador.body, {
      x: jugador.initialX,
      y: jugador.initialY,
    });
    Matter.Body.setVelocity(jugador.body, { x: 0, y: 0 });
    Matter.Body.setAngle(jugador.body, jugador.initialAngle);
    jugador.speed = 0;
  });
}

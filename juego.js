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
const jugador = new Jugador(
  centerX - 100,
  centerY,
  config.playerRadius,
  0,
  "#f00"
);
const oponente = new Jugador(
  centerX + 100,
  centerY,
  config.playerRadius,
  Math.PI,
  "#00f"
);
oponente.initAI(pelota);

Matter.Composite.add(engine.world, [
  ...walls,
  jugador.body,
  oponente.body,
  pelota.body,
]);

setupKeyboardControls(engine, jugador);

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
    oponente.updateAI();
  }

  pelota.limitVelocity();
  // console.log(pelota.body.position);
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
  // Posiciones iniciales
  const centerX = render.options.width / 2;
  const centerY = render.options.height / 2;

  // Reiniciar pelota
  Matter.Body.setPosition(pelota.body, { x: centerX, y: centerY });
  Matter.Body.setVelocity(pelota.body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(pelota.body, 0);

  // Reiniciar jugadores
  Matter.Body.setPosition(jugador.body, { x: centerX - 100, y: centerY });
  Matter.Body.setVelocity(jugador.body, { x: 0, y: 0 });
  Matter.Body.setAngle(jugador.body, 0);

  Matter.Body.setPosition(oponente.body, { x: centerX + 100, y: centerY });
  Matter.Body.setVelocity(oponente.body, { x: 0, y: 0 });
  Matter.Body.setAngle(oponente.body, Math.PI);

  // Resetear velocidad acumulada
  jugador.speed = 0;
  oponente.speed = 0;
}

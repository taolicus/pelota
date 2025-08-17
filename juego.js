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

Matter.Composite.add(engine.world, [
  ...walls,
  jugador.body,
  oponente.body,
  pelota.body,
]);

setupKeyboardControls(engine, jugador);

Matter.Render.run(render);
Matter.Runner.run(runner, engine);

Matter.Events.on(engine, "beforeUpdate", () => {
  pelota.limitVelocity();
});

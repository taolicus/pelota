import Matter from "matter-js";

export const createEngine = () => {
  const engine = Matter.Engine.create();
  engine.gravity.y = 0;
  return engine;
};

export const createRunner = () => {
  return Matter.Runner.create();
};

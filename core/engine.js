import Matter from "matter-js";

export const createEngine = () => {
  const engine = Matter.Engine.create();
  engine.gravity.y = 0;
  return engine;
};

export const createRunner = () => {
  return Matter.Runner.create();
};

export function distanceBetween(bodyA, bodyB) {
  const centerDistance = Matter.Vector.magnitude(
    Matter.Vector.sub(bodyB.position, bodyA.position)
  );

  if (bodyA.circleRadius && bodyB.circleRadius) {
    return centerDistance - bodyA.circleRadius - bodyB.circleRadius;
  }

  return centerDistance;
}

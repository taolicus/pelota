import Matter from "matter-js";

export class Pelota {
  constructor(x, y, radius) {
    this.body = Matter.Bodies.circle(x, y, radius, {
      angle: 0,
      density: 0.0001,
      restitution: 1,
      friction: 0.01,
      frictionAir: 0.01,
      frictionStatic: 0.01,
      inertia: 1000,
      render: {
        fillStyle: "#FFF",
      },
      collisionFilter: {
        category: 0x0002,
      },
    });
    this.maxSpeed = 15;
    this.isTrapped = false;
  }

  limitVelocity() {
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      Matter.Body.setVelocity(this.body, {
        x: velocity.x * ratio,
        y: velocity.y * ratio,
      });
    }
  }
}

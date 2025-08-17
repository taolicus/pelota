import Matter from "matter-js";

export class Jugador {
  constructor(x, y, radius, angle, color) {
    this.speed = 0;
    this.maxSpeed = 8;
    this.acceleration = 0.1;
    this.rotationSpeed = 0.08;
    this.brakingPower = 0.15;

    this.markerX = x + Math.cos(angle) * radius * 0.7;
    this.markerY = y + Math.sin(angle) * radius * 0.7;

    const cuerpo = Matter.Bodies.circle(x, y, radius, {
      angle: angle,
      density: 1,
      frictionAir: 0.01,
      restitution: 0.01,
      friction: 0.1,
      frictionStatic: 0.01,
      inertia: 1000,
      render: {
        fillStyle: color,
      },
    });

    const direccion = Matter.Bodies.circle(
      this.markerX,
      this.markerY,
      radius * 0.3,
      {
        isSensor: true,
        render: { fillStyle: "#FFF" },
      }
    );

    this.body = Matter.Body.create({
      parts: [cuerpo, direccion],
      angle: angle,
    });
  }

  accelerate() {
    this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
    this.applyMovement();
  }

  reverse() {
    this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed / 2); // Mitad de velocidad máxima hacia atrás
    this.applyMovement();
  }

  brake() {
    this.speed = Math.max(this.speed - this.brakingPower, 0);
    this.applyMovement();
  }

  turnLeft() {
    Matter.Body.setAngularVelocity(this.body, -this.rotationSpeed);
  }

  turnRight() {
    Matter.Body.setAngularVelocity(this.body, this.rotationSpeed);
  }

  stopRotation() {
    Matter.Body.setAngularVelocity(this.body, 0);
  }

  applyMovement() {
    const velocity = {
      x: Math.cos(this.body.angle) * this.speed,
      y: Math.sin(this.body.angle) * this.speed,
    };
    Matter.Body.setVelocity(this.body, velocity);
  }

  applyFriction() {
    if (this.speed > 0) {
      this.speed = Math.max(this.speed - 0.005, 0);
      this.applyMovement();
    }
  }
}

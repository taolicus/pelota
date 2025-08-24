import Matter from "matter-js";
import { FSM } from "../core/fsm.js";
import { distanceBetween } from "../core/engine.js";

export class Jugador {
  constructor(x, y, radius, angle, color, teamSide) {
    this.initialX = x;
    this.initialY = y;
    this.initialAngle = angle;
    this.speed = 0;
    this.maxSpeed = 8;
    this.acceleration = 0.04;
    this.rotationSpeed = 0.06;
    this.brakingPower = 0.15;
    this.teamSide = teamSide;
    this.sidewaysSpeed = 0;
    this.maxSidewaysSpeed = 2;
    this.sidewaysAcceleration = 0.02;

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
      collisionFilter: {
        category: 0x0001,
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

  moveLeft() {
    this.sidewaysSpeed = Math.max(
      this.sidewaysSpeed - this.sidewaysAcceleration,
      -this.maxSidewaysSpeed
    );
    this.applyMovement();
  }

  moveRight() {
    this.sidewaysSpeed = Math.min(
      this.sidewaysSpeed + this.sidewaysAcceleration,
      this.maxSidewaysSpeed
    );
    this.applyMovement();
  }

  stopRotation() {
    Matter.Body.setAngularVelocity(this.body, 0);
  }

  applyMovement() {
    const forwardVelocity = {
      x: Math.cos(this.body.angle) * this.speed,
      y: Math.sin(this.body.angle) * this.speed,
    };

    const sidewaysVelocity = {
      x: Math.cos(this.body.angle + Math.PI / 2) * this.sidewaysSpeed,
      y: Math.sin(this.body.angle + Math.PI / 2) * this.sidewaysSpeed,
    };

    Matter.Body.setVelocity(this.body, {
      x: forwardVelocity.x + sidewaysVelocity.x,
      y: forwardVelocity.y + sidewaysVelocity.y,
    });
  }

  applyFriction() {
    if (this.speed > 0) {
      this.speed = Math.max(this.speed - 0.005, 0);
    }
    if (Math.abs(this.sidewaysSpeed) > 0) {
      this.sidewaysSpeed *= 0.95; // Reduce sideways speed gradually
      if (Math.abs(this.sidewaysSpeed) < 0.1) this.sidewaysSpeed = 0;
    }
    this.applyMovement();
  }

  kick(pelota) {
    const direction = this.body.angle;
    const kickForce = {
      x: Math.cos(direction) * 0.05,
      y: Math.sin(direction) * 0.05,
    };

    Matter.Body.applyForce(pelota.body, pelota.body.position, kickForce);
  }

  // Good angle check (simplified)
  hasGoodKickingAngle(pelota) {
    const ballDirection = Math.atan2(
      pelota.body.position.y - this.body.position.y,
      pelota.body.position.x - this.body.position.x
    );

    const goalPos = this.getOpponentGoalPosition();
    const goalDirection = Math.atan2(
      goalPos.y - this.body.position.y,
      goalPos.x - this.body.position.x
    );

    const angleDiff = this.normalizeAngle(ballDirection - goalDirection);
    return Math.abs(angleDiff) < 0.2;
  }

  getOpponentGoalPosition() {
    const fieldHeight = 600;

    if (this.teamSide === "left") {
      return { x: 900, y: 300 };
    } else {
      return { x: -900, y: 300 };
    }
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  // Comportamiento
  initAI(pelota) {
    this.fsm = new FSM("chase");

    this.fsm.addState("chase", () => {
      const ballDirection = Math.atan2(
        pelota.body.position.y - this.body.position.y,
        pelota.body.position.x - this.body.position.x
      );
      const angleDiff = this.normalizeAngle(ballDirection - this.body.angle);
      if (angleDiff > 0.02) this.turnRight();
      else if (angleDiff < -0.02) this.turnLeft();
      else if (distanceBetween(this.body, pelota.body) > 40) this.accelerate();
      else this.brake();
    });

    this.fsm.addState("get_kick_angle", () => {
      const ballPos = pelota.body.position;
      const goalPos = this.getOpponentGoalPosition();
      const playerPos = this.body.position;

      const toBall = { x: ballPos.x - playerPos.x, y: ballPos.y - playerPos.y };
      const toGoal = { x: goalPos.x - playerPos.x, y: goalPos.y - playerPos.y };

      const angleToBall = Math.atan2(toBall.y, toBall.x);
      const angleToGoal = Math.atan2(toGoal.y, toGoal.x);

      const goalRelativeToBall = this.normalizeAngle(angleToGoal - angleToBall);
      const surroundingDirection = goalRelativeToBall > 0 ? -1 : 1;

      const distToBall = distanceBetween(this.body, pelota.body);
      const idealDistance = 60;
      const distanceError = distToBall - idealDistance;

      if (distanceError > 20) {
        this.accelerate();
      } else if (distanceError < -20) {
        this.brake();
      } else {
        this.speed = Math.max(this.speed - 0.01, 2);
        this.applyMovement();
      }

      const sidewaysIntensity = Math.min(Math.abs(distanceError) / 10, 1);
      if (surroundingDirection > 0) {
        this.sidewaysSpeed = this.maxSidewaysSpeed * sidewaysIntensity;
      } else {
        this.sidewaysSpeed = -this.maxSidewaysSpeed * sidewaysIntensity;
      }
      this.applyMovement();

      const facingDiff = this.normalizeAngle(angleToBall - this.body.angle);
      if (facingDiff > 0.1) this.turnRight();
      else if (facingDiff < -0.1) this.turnLeft();
      else this.stopRotation();
    });

    this.fsm.addState("kick", () => {
      this.kick(pelota);
    });

    this.fsm.addTransition("chase", "get_kick_angle", () => {
      return (
        distanceBetween(this.body, pelota.body) < 100 &&
        !this.hasGoodKickingAngle(pelota)
      );
    });

    this.fsm.addTransition("get_kick_angle", "chase", () => {
      return distanceBetween(this.body, pelota.body) > 100;
    });

    this.fsm.addTransition("get_kick_angle", "kick", () => {
      return (
        distanceBetween(this.body, pelota.body) < 35 &&
        this.hasGoodKickingAngle(pelota)
      );
    });

    this.fsm.addTransition("kick", "chase", () => {
      return distanceBetween(this.body, pelota.body) > 35;
    });
  }

  update() {
    if (!this.fsm) return;
    this.fsm.update();
  }
}

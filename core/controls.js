import Matter from "matter-js";

const KeyControls = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

const keys = {};

export function setupKeyboardControls(engine, jugador) {
  document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
  });

  document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
  });

  Matter.Events.on(engine, "beforeUpdate", () => {
    if (keys[KeyControls.up]) jugador.accelerate();
    if (keys[KeyControls.down]) jugador.reverse();

    if (keys[KeyControls.left]) jugador.turnLeft();
    else if (keys[KeyControls.right]) jugador.turnRight();
    else jugador.stopRotation();

    if (!keys[KeyControls.up] && !keys[KeyControls.down]) {
      jugador.brake();
    }
  });
}

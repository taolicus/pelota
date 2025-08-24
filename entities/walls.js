import Matter from "matter-js";

export const createWalls = (width, height) => {
  return [
    // up
    Matter.Bodies.rectangle(width / 2, -40, width, 100, {
      isStatic: true,
      render: { fillStyle: "#fff", strokeStyle: "#000" },
    }),
    // down
    Matter.Bodies.rectangle(width / 2, height + 40, width, 100, {
      isStatic: true,
      render: { fillStyle: "#fff", strokeStyle: "#000" },
    }),
    // left
    Matter.Bodies.rectangle(-40, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: "#f00", strokeStyle: "#000" },
      collisionFilter: {
        mask: 0x0001,
      },
    }),
    Matter.Bodies.rectangle(-40, 0 + height / 3 / 2, 100, height / 3, {
      isStatic: true,
      render: { fillStyle: "#fff", strokeStyle: "#000" },
    }),
    Matter.Bodies.rectangle(-40, height - height / 3 / 2, 100, height / 3, {
      isStatic: true,
      render: { fillStyle: "#fff", strokeStyle: "#000" },
    }),
    // right
    Matter.Bodies.rectangle(width + 40, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: "#f00", strokeStyle: "#000" },
      collisionFilter: {
        mask: 0x0001,
      },
    }),
    Matter.Bodies.rectangle(width + 40, height / 3 / 2, 100, height / 3, {
      isStatic: true,
      render: { fillStyle: "#fff", strokeStyle: "#000" },
    }),
    Matter.Bodies.rectangle(
      width + 40,
      height - height / 3 / 2,
      100,
      height / 3,
      {
        isStatic: true,
        render: { fillStyle: "#fff", strokeStyle: "#000" },
      }
    ),
  ];
};

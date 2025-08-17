import Matter from "matter-js";

export const createRenderer = (element, engine, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    wireframes: false,
    background: "#090",
  };

  const render = Matter.Render.create({
    element,
    engine,
    options: { ...defaultOptions, ...options },
  });

  engine.world.bounds = {
    min: { x: 0, y: 0 },
    max: { x: render.options.width, y: render.options.height },
  };

  return render;
};

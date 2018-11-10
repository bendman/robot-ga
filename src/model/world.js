// Environment Definitions

const WIDTH = 12;
const HEIGHT = 12;

// Cell states
export const EMPTY = 0;
export const CAN = 1;
export const WALL = 2;

// Create a randomly littered world surrounded by walls
export const createWorld = () => {
  const world = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
        row.push(WALL);
      } else {
        row.push(Math.random() > 0.5 ? CAN : EMPTY);
      }
    }
    world.push(row);
  }
  return world;
};

// Deep copy a world
export const cloneWorld = world => world.slice().map(row => row.slice());

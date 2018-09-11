import {
  MoveNorth,
  MoveSouth,
  MoveEast,
  MoveWest,
  StayPut,
  BendOver,
  MoveRandom,
  randomMove,
} from './individual';
import {
  WALL,
  EMPTY,
  CAN,
  createWorld,
} from './world';

const TRIALS = 40;

const currentBase = 1;
const northBase   = 3;
const southBase   = 9;
const eastBase    = 27;
const westBase    = 81;

const getSensedState = (floorMap, x, y) => (
  northBase * floorMap[y - 1][x] +
  southBase * floorMap[y + 1][x] +
  eastBase * floorMap[y][x + 1] +
  westBase * floorMap[y][x - 1] +
  currentBase * floorMap[y][x]
);

export const fitnessStep = (floorMap, individual, x, y) => {
  const state = getSensedState(floorMap, x, y);
  let action = individual.genome[state];
  let fitness = 0;

  if (action === StayPut) {
    return [x, y, fitness];
  }
  if (action === BendOver) {
    if (floorMap[y][x] === CAN) {
      floorMap[y][x] = EMPTY;
      fitness += 10;
    } else {
      fitness--;
    }
    return [x, y, fitness];
  }
  if (action === MoveRandom) {
    action = randomMove();
  }

  if (action == MoveNorth && floorMap[y - 1][x] !== WALL) {
    y--;
  } else if (action == MoveSouth && floorMap[y + 1][x] != WALL) {
    y++;
  } else if (action == MoveEast && floorMap[y][x + 1] != WALL) {
    x++;
  } else if (action == MoveWest && floorMap[y][x - 1] != WALL) {
    x--;
  } else {
    // Ran into a wall
    fitness -= 5;
  }

  return [x, y, fitness]
};

const checkFitness = (individual, floorMap) => {
  let x = 1;
  let y = 1;
  let fitness = 0;

  for (let step = 0; step < 200; step++) {
    let fitDelta = 0;
    [x, y, fitDelta] = fitnessStep(floorMap, individual, x, y);
    fitness += fitDelta;
  }

  return fitness;
};

const avgFitness = (individual) => {
  let totalFitness = 0;

  for (let i = 0; i < TRIALS; i++) {
    totalFitness += checkFitness(individual, createWorld());
  }

  individual.fitness = totalFitness / TRIALS;
  return individual.fitness;
}

export const populationFitness = (population) => {
  const totalFitness = population.reduce((total, individual) => total + avgFitness(individual), 0);

  return totalFitness / population.length;
};
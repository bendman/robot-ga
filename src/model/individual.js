// Used symbols here but they can't be serialized for multithreading :(
export const MoveNorth = 'N';
export const MoveSouth = 'S';
export const MoveEast = 'E';
export const MoveWest = 'W';
export const StayPut = '-';
export const BendOver = 'X';
export const MoveRandom = 'R';

const Actions = [MoveNorth, MoveSouth, MoveEast, MoveWest, StayPut, BendOver, MoveRandom];
const Moves = [MoveNorth, MoveSouth, MoveEast, MoveWest];
export const randomAction = () => Actions[Math.floor(Math.random() * Actions.length)];
export const randomMove = () => Moves[Math.floor(Math.random() * Moves.length)];

export const compareFitness = (a, b) => ((a.fitness < b.fitness) ? 1 : -1);

export const createIndividual = (generation = 0, genome) => ({
  generation,
  fitness: 0,
  genome: genome || Array(243).fill().map(randomAction),
});

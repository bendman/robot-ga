//
// A Web Worker to calculate genetic algorithm generations
//
import {
  createIndividual,
  compareFitness,
} from './model/individual';
import {
  populationFitness,
} from './model/fitness';
import {
  breedGeneration,
} from './model/genetics';

const worker = self; // eslint-disable-line no-restricted-globals
let isRunning = false;
let overallBest = null;
let latestPopulation = null;

const randomPopulation = count => (Array(count)).fill().map(() => createIndividual(0));

const generationStep = (population) => {
  const popFitness = populationFitness(population);
  population.sort(compareFitness);
  const bestFitness = population[0].fitness;
  const genI = population[0].generation;

  if (!overallBest || bestFitness > overallBest.fitness) {
    [overallBest] = population;
  }

  worker.postMessage({
    generation: genI,
    meanFitness: popFitness,
    bestIndividual: population[0],
  });

  // Assign directly because we don't need to re-render for each generation
  return breedGeneration(population);
};

const loopEvolution = () => {
  if (!isRunning) return;

  if (!latestPopulation) {
    latestPopulation = randomPopulation(400);
  }

  latestPopulation = generationStep(latestPopulation);
  setTimeout(loopEvolution, 0);
};

const messageHandlers = {
  start() {
    console.info('starting GA background thread');
    isRunning = true;
    loopEvolution();
  },
  stop() {
    console.info('stopping GA background thread');
    isRunning = false;
  },
};

// Inbound message controller
worker.addEventListener('message', (event) => {
  messageHandlers[event.data.action](event.data.arguments);
});

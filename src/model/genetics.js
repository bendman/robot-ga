import {
  createIndividual,
  randomAction,
  compareFitness,
} from './individual';

export const breedGeneration = (oldPopulation) => {
  const parents = selection(oldPopulation);
  let children = reproduce(parents);
  children.forEach(child => mutate(child));
  return children
};

// Return a shuffled copy of an array
const shuffle = (list) => {
	list = list.slice();
	for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
	}
	return list;
}

// Return a random selection of items from an array
const choices = (list, count) => shuffle(list).slice(0, count);

const selection = (population) => {
  const selected = [];

  for (let i = 0; i < population.length; i += 2) {
    const tourney = choices(population, 11);
    tourney.sort(compareFitness);
    selected.push(tourney[0]);
    selected.push(tourney[1]);
  }

  return selected;
};

const reproduce = (population) => {
  const children = [];

  for (let i = 0; i < population.length; i += 2) {
    const parentA = population[i].genome;
    const parentB = population[i+1].genome;

    const split = Math.floor(Math.random() * 243);
    const genomeA = parentA.slice(0, split).concat(parentB.slice(split));
    const genomeB = parentB.slice(0, split).concat(parentA.slice(split));

    children.push(createIndividual(population[i].generation + 1, genomeA));
    children.push(createIndividual(population[i].generation + 1, genomeB));
  }

  return children;
};

const mutate = (individual) => {
  individual.genome = individual.genome.map(gene => (
    Math.random() < 0.015
      ? randomAction()
      : gene
  ))
};
import Simulation from './model/simulation';


class Model extends EventTarget {
  /**
   * Setup the Model, binding callbacks and setting parameters
   * @param {HTMLElement} tableElement output data table
   */
  constructor(tableElement) {
    super();
    this.onGenerationReceived = this.onGenerationReceived.bind(this);
    this._generations = [];

    this.tableElement = tableElement;
    this.worker = new Worker('./dist/worker.js');
  }

  getGeneration(genIndex) {
    return this._generations[genIndex];
  }

  start() {
    this.worker.addEventListener('message', this.onGenerationReceived);
    this.worker.postMessage({ action: 'start' });
    this.isRunning = true;
    this.dispatchEvent(new Event('start'));
  }

  stop() {
    this.worker.removeEventListener('message', this.onGenerationReceived);
    this.worker.postMessage({ action: 'stop' });
    this.isRunning = false;
    this.dispatchEvent(new Event('stop'));
  }

  onGenerationReceived(message) {
    const { bestIndividual, meanFitness: genMean } = message.data;
    const isRunningBest = !this.best || bestIndividual.fitness > this.best.fitness;

    this._generations.push({
      meanFitness: genMean,
      bestIndividual,
      isRunningBest,
    });

    this.dispatchEvent(new CustomEvent('generation', {
      detail: {
        isRunningBest,
        runningBest: this.best,
        best: bestIndividual,
        mean: genMean,
      },
    }));

    if (isRunningBest) {
      this.best = bestIndividual;
      this.dispatchEvent(new CustomEvent('best', {
        detail: { bestIndividual, genMean },
      }));
    }
  }
}

const model = new Model(document.getElementById('output-table'));

//
// Simulation Preview
//
const previewTgt = document.getElementById('simulation-preview');
const simulation = new Simulation(previewTgt);

//
// Toggling GA
//
const toggler = document.getElementById('toggle-button');

toggler.addEventListener('click', () => {
  if (model.isRunning) {
    model.stop();
    toggler.innerHTML = 'Start Evolution';
  } else {
    model.start();
    toggler.innerHTML = 'Stop Evolution';
  }
});

//
// GA Results
//
const output = document.getElementById('output-table');

model.addEventListener('generation', (event) => {
  const { best, mean, isRunningBest } = event.detail;
  if (isRunningBest) {
    simulation.set(best);
  }
  output.insertAdjacentHTML('afterbegin', `
    <tr class="${isRunningBest ? 'new-best' : ''}" data-gen="${best.generation}">
      <td>${best.generation}</td>
      <td>${mean.toFixed(2)}</td>
      <td>${best.fitness.toFixed(2)}</td>
    </tr>
  `);
});

output.addEventListener('click', (event) => {
  const row = event.target.closest('tr');
  if (!row || !row.dataset.gen) { return; }

  const generation = model.getGeneration(Number.parseInt(row.dataset.gen, 10));
  simulation.set(generation.bestIndividual);
});

window.model = model;

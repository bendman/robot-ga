class Model extends EventTarget {

  /**
   * Setup the Model, binding callbacks and setting parameters
   * @param {HTMLElement} tableElement output data table
   */
  constructor(tableElement) {
    super();
    this.onGenerationReceived = this.onGenerationReceived.bind(this);

    this.tableElement = tableElement;
    this.worker = new Worker('./dist/worker.js');
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
    const individual = message.data.bestIndividual;
    const genMean = message.data.meanFitness;

    this.dispatchEvent(new CustomEvent('generation', { detail: {
      newBest: !this.best || individual.fitness > this.best.fitness,
      runningBest: this.best,
      best: individual,
      mean: genMean,
    }}));

    if (!this.best || individual.fitness > this.best.fitness) {
      this.best = individual;
      this.dispatchEvent(new CustomEvent('best', { detail: {
        individual,
        genMean,
      }}));
    }
  }

}

const model = new Model(document.getElementById('output_table'));

//
// Toggling GA
//
const toggler = document.getElementById('toggle_button');

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
const output = document.getElementById('output_table');

model.addEventListener('generation', (event) => {
  const { best, mean, newBest } = event.detail;
  console.log('new best!', best, best.fitness, mean);
  const newRow = document.createElement('tr');
  if (newBest) {
    newRow.classList.add('new-best');
  }
  newRow.innerHTML = `
    <td>${best.generation}</td>
    <td>${mean.toFixed(2)}</td>
    <td>${best.fitness.toFixed(2)}</td>
  `;

  output.appendChild(newRow);
});

window.model = model;
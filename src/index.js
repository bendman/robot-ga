class Model {

  constructor() {
    this.onGenerationReceived = this.onGenerationReceived.bind(this);

    this.worker = new Worker('./dist/worker.js');
  }

  start() {
    this.worker.addEventListener('message', this.onGenerationReceived);
    this.worker.postMessage({ action: 'start' });
    this.isRunning = true;
  }

  stop() {
    this.worker.removeEventListener('message', this.onGenerationReceived);
    this.worker.postMessage({ action: 'stop' });
    this.isRunning = false;
  }

  onGenerationReceived(message) {
    const incomingBest = event.data.bestIndividual;

    if (!this.best || incomingBest.fitness > this.best.fitness) {
      this.best = incomingBest;
    }
  }

}

const model = new Model();
window.model = model;
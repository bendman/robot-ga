import {
  createWorld,
  cloneWorld,
  CAN,
  WALL,
} from './world';
import { fitnessStep } from './fitness';
import { createIndividual } from './individual';

const PREVIEW_WORLD = createWorld();

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if a point is within the Von Neumann neighborhood of another
 * @param {Number} x center x
 * @param {Number} y center y
 * @param {Number} tgtX target x
 * @param {Number} tgtY target y
 */
const isNeighbor = (x, y, tgtX, tgtY) => (
  (Math.abs(x - tgtX) <= 1 && y === tgtY)
  || (Math.abs(y - tgtY) <= 1 && x === tgtX)
);

class Simulation {
  /**
   * Construct a Simulation instance
   * @param {HTMLElement} simulationTgt The element in which the preview is drawn
   */
  constructor(simulationTgt, genome = createIndividual()) {
    // Setup
    this._genome = genome;
    this._element = simulationTgt;
    this._stepNum = 0;
    this.isPlaying = false;
    this._fitness = 0;
    this._frameTime = 200;
    this.pause = this.pause.bind(this);
    this.step = this.step.bind(this);
    this.play = this.play.bind(this);
    this._handleSpeedChange = this._handleSpeedChange.bind(this);

    // Create internal DOM
    this._element.innerHTML = `
      <header>
        Showing best of generation <span class="sim__gen"></span>.
      </header>
      <div class="sim__render"></div>
      <footer>
        <section class="sim__stats">
          <section><output class="sim__step-num"></output>/200 Steps</section>
          <section><output class="sim__fit-points"></output> Points</section>
        </section>
        <section class="sim__controls">
          <button class="sim__pause"><i class="material-icons">pause</i></button>
          <button class="sim__step"><i class="material-icons">skip_next</i></button>
          <button class="sim__play"><i class="material-icons">play_arrow</i></button>
          <select class="sim__speed">
            <option value="1000">Slow</option>
            <option value="200">Normal</option>
            <option value="0">Fast</option>
          </select>
        </section>
      </footer>
    `;
    this._genDisplay = this._element.querySelector('.sim__gen');
    this._renderView = this._element.querySelector('.sim__render');
    this._pauseButton = this._element.querySelector('.sim__pause');
    this._stepButton = this._element.querySelector('.sim__step');
    this._playButton = this._element.querySelector('.sim__play');
    this._simSpeed = this._element.querySelector('.sim__speed');
    this._stepOutput = this._element.querySelector('.sim__step-num');
    this._fitnessOutput = this._element.querySelector('.sim__fit-points');
    this._simSpeed.value = this._frameTime;
    this._setup();
    this._updateButtons();

    // Bind events
    this._pauseButton.addEventListener('click', this.pause);
    this._stepButton.addEventListener('click', this.step);
    this._playButton.addEventListener('click', this.play);
    this._simSpeed.addEventListener('change', this._handleSpeedChange);
  }

  _updateButtons() {
    this._playButton.disabled = this.isPlaying;
    this._pauseButton.disabled = !this.isPlaying;
  }

  _handleSpeedChange(event) {
    this._frameTime = Number.parseInt(event.currentTarget.value, 10);
  }

  _setup() {
    this._stepNum = 0;
    this._world = cloneWorld(PREVIEW_WORLD);
    this._position = [1, 1];
    this._fitness = 0;
    this._genDisplay.innerHTML = this._genome.generation;
    this._renderFrame();
  }

  /**
   * Render the current state as a frame
   */
  _renderFrame() {
    const [xPos, yPos] = this._position;

    const worldRender = `
      <table class="sim__render__map">
        ${this._world.map((row, y) => `
          <tr>
            ${row.map((cell, x) => `
              <td class="cell
                ${x === xPos && y === yPos ? 'cell--robot' : ''}
                ${isNeighbor(xPos, yPos, x, y) ? 'cell--visible' : ''}
                ${cell === WALL ? 'cell--wall' : ''}
                ${cell === CAN ? 'cell--can' : ''}
              "></td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
    `;
    this._renderView.innerHTML = worldRender;
    this._stepOutput.innerHTML = this._stepNum;
    this._fitnessOutput.innerHTML = this._fitness;
  }

  /**
   * Set the simulation to run a new individual
   * @param {Individual} individual
   */
  set(genome) {
    this.pause();
    this._genome = genome;
    this._setup();
  }

  /**
   * Start the animation loop
   */
  async play() {
    if (this._stepNum === 200) {
      this._setup();
    }

    this.isPlaying = true;
    this._updateButtons();

    while (this.isPlaying && this._stepNum < 200) {
      this.step();
      // eslint-disable-next-line no-await-in-loop
      await sleep(this._frameTime);
    }

    this.pause();
  }

  /**
   * Pause the current animation
   */
  pause() {
    this.isPlaying = false;
    this._updateButtons();
  }

  /**
   * Perform one frame of animation
   */
  step() {
    if (this._stepNum === 0) {
      this._setup();
    }
    this._stepNum += 1;

    const [xPos, yPos, fitnessDelta] = fitnessStep(this._world, this._genome, ...this._position);
    this._position = [xPos, yPos];
    this._fitness += fitnessDelta;

    this._renderFrame();
  }
}

export default Simulation;

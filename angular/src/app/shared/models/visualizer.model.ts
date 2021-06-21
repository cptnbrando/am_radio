import Sketch from "./sketch.model"
import Sync from "./sync.model"


export default class Visualizer {

    sync: Sync;
    sketch: Sketch;

    constructor (volumeSmoothing = 100, hidpi = true)
    {
        /** Initialize Sync class. */
        this.sync = new Sync(volumeSmoothing, hidpi);

        /** Initialize Sketch class. Assign `this.paint` as the main animation loop. */
        this.sketch = new Sketch(this.paint.bind(this), hidpi = hidpi);

        this.watch();
        this.hooks();
    }

  /**
   * @method watch - Watch for changes in state.
   */
  watch() {
    this.sync.watch('active', val => {
      /** Start and stop sketch according to the `active` property on our Sync class. */
      if (val === true) {
        this.sketch.start();
      } else {
        this.sketch.stop();
      }
    })
  }

  /**
   * @method hooks - Attach hooks to interval change events. 
   */
  hooks() {

  }

  /**
   * @method paint - Paint a single frame of the main animation loop.
   */
  paint() {

  }
}

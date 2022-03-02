import { EventDispatcher } from "./EventDispatcher.js";
import { Stitcher } from "./Stitcher.js";

class Loader extends EventDispatcher {
  constructor() {
    super();
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.stitcher = new Stitcher(this.canvas);
    this.stitcher.addEventListener("finished", () => {
      this.dispatchEvent({ type: "load", message: "Panorama loaded" });
    });

    this.stitcher.addEventListener("progress", (e) => {
      this.dispatchEvent({ type: "progress", message: e.message });
    });
  }

  async load() {}

  onProgress(cb) {
    this.stitcher.onProgress = cb;
  }
}

export { Loader };

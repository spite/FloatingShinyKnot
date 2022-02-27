import "./map.js";
import "./progress.js";
import "./snackbar.js";
import { GoogleStreetViewLoader, getIdByLocation } from "./src/PanomNom.js";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  CanvasTexture,
  RepeatWrapping,
  TorusKnotBufferGeometry,
  DirectionalLight,
} from "./third_party/three.module.js";
import { OrbitControls } from "./third_party/OrbitControls.js";
import { EquirectangularToCubemap } from "./EquirectangularToCubemap.js";
import { material } from "./material.js";
import { twixt } from "./twixt.js";

const speed = twixt.create("speed", 1);

const map = document.querySelector("#map-browser");
const progress = document.querySelector("progress-bar");
const snackbar = document.querySelector("snack-bar");

async function load(lat, lng) {
  // progress.textContent = "Loading...";
  progress.reset();
  progress.show();

  const loader = new GoogleStreetViewLoader();
  loader.onProgress((p) => {
    progress.progress = p;
  });

  const zoom = 3;
  let metadata;

  try {
    metadata = await getIdByLocation(lat, lng);
  } catch (e) {
    progress.hide();
    console.log(e);
    if (e.code === "ZERO_RESULTS") {
      snackbar.error(
        "There are no panoramas available in the selected location."
      );
    }
    // progress.textContent = e;
    return;
  }

  map.moveTo(
    metadata.data.location.latLng.lat(),
    metadata.data.location.latLng.lng()
  );
  window.location.hash = `${metadata.data.location.latLng.lat()},${metadata.data.location.latLng.lng()}`;
  const res = await loader.load(metadata.data.location.pano, zoom);

  // progress.textContent = "Loaded.";
  progress.hide();

  const texture = new CanvasTexture(loader.canvas);
  const cubemap = equiToCube.convert(texture, 1024);
  scene.background = cubemap;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  cubemap.wrapS = cubemap.wrapT = RepeatWrapping;
  cubemap.offset.set(0.5, 0);

  torus.material.uniforms.envMap.value = cubemap;
}

window.addEventListener("map-selection", async (e) => {
  const lat = e.detail.latLng.lat;
  const lng = e.detail.latLng.lng;
  await load(lat, lng);
});

const renderer = new WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const equiToCube = new EquirectangularToCubemap(renderer);

const scene = new Scene();
const camera = new PerspectiveCamera(75, 1, 0.001, 10);
camera.position.set(0.1, 0.1, 0.1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ff00ff";
ctx.fillRect(0, 0, 512, 512);

const texture = new CanvasTexture(canvas);
texture.needsUpdate = true;

const directLight = new DirectionalLight(0xffffff);
scene.add(directLight);

const torus = new Mesh(
  // new TorusKnotBufferGeometry(0.05, 0.015, 200, 36),
  new TorusKnotBufferGeometry(0.05, 0.015, 400, 36, 3, 2),
  // new IcosahedronBufferGeometry(0.05, 10),
  material
);
scene.add(torus);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);

let running = true;

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    running = !running;
    if (running) {
      speed.to(1, 500, "OutQuint");
    } else {
      speed.to(0, 500, "OutQuint");
    }
  }
});

let time = 0;
let prevTime = performance.now();

function render() {
  controls.update();
  const now = performance.now();
  time += (now - prevTime) * speed.value;
  prevTime = now;

  // if (running) {
  const t = time / 10000;
  torus.rotation.x = 0.49 * t;
  torus.rotation.y = 0.5 * t;
  torus.rotation.z = 0.51 * t;
  material.uniforms.time.value = t;
  // }

  renderer.render(scene, camera);
  renderer.setAnimationLoop(render);
}

async function init() {
  await map.ready;
  const [lat, lng] = window.location.hash.substring(1).split(",");
  if (lat && lng) {
    await load(parseFloat(lat), parseFloat(lng));
  } else {
    map.randomLocation();
  }
  render();
}

resize();
init();

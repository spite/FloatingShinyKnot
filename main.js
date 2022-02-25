import "./map.js";
import "./progress.js";
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

const map = document.querySelector("#map-browser");
const progress = document.querySelector("progress-bar");

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
    console.log(e);
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
  }
});

function render() {
  controls.update();
  const t = performance.now() / 10000;
  if (running) {
    torus.rotation.x = 0.49 * t;
    torus.rotation.y = 0.5 * t;
    torus.rotation.z = 0.51 * t;
    material.uniforms.time.value = t;
  }
  renderer.render(scene, camera);
  renderer.setAnimationLoop(render);
}

const locations = [
  { lat: 51.50700703827454, lng: -0.12791916931155356 },
  { lat: 32.6144404, lng: -108.9852017 },
  { lat: 39.36382677360614, lng: 8.431220278759724 },
  { lat: 59.30571937680209, lng: 4.879402148657164 },
  { lat: 28.240385123352873, lng: -16.629988706884774 },
  { lat: 50.09072314148827, lng: 14.393133454556278 },
  { lat: 41.413416092316275, lng: 2.1531126527786455 },
  { lat: 35.69143938066447, lng: 139.695139627539 },
  { lat: 35.67120372775569, lng: 139.77167914398797 },
  { lat: 54.552083679428065, lng: -3.297380963134742 },
];

function randomLocation() {
  const location = locations[Math.floor(Math.random() * locations.length)];
  return location;
}

document.querySelector("#randomBtn").addEventListener("click", async (e) => {
  const location = randomLocation();
  await load(location.lat, location.lng);
});

async function init() {
  await map.ready;
  const [lat, lng] = window.location.hash.substring(1).split(",");
  if (lat && lng) {
    await load(parseFloat(lat), parseFloat(lng));
  } else {
    const location = randomLocation();
    await load(location.lat, location.lng);
  }
  render();
}

resize();
init();

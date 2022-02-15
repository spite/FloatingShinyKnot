import "./map.js";
import { GoogleStreetViewLoader } from "./src/PanomNom.js";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  MeshNormalMaterial,
  Mesh,
  IcosahedronBufferGeometry,
  MeshBasicMaterial,
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
  TorusKnotBufferGeometry,
  EquirectangularReflectionMapping,
  DirectionalLight,
  MeshPhongMaterial,
  MeshStandardMaterial,
  EquirectangularRefractionMapping,
  BackSide,
  FrontSide,
  TextureLoader,
} from "./third_party/three.module.js";
import { OrbitControls } from "./third_party/OrbitControls.js";
import { EquirectangularToCubemap } from "./EquirectangularToCubemap.js";

const pano = document.querySelector("#pano");

window.addEventListener("map-selection", async (e) => {
  const loader = new GoogleStreetViewLoader();
  const res = await loader.loadFromLocation(
    e.detail.latLng.lat,
    e.detail.latLng.lng,
    3
  );
  // const res = await loader.load("NXt68MqxYRfZuEm2R-OQoA", 3);
  while (pano.firstChild) {
    pano.firstChild.remove();
  }

  // const canvas = document.createElement("canvas");
  // canvas.width = 512;
  // canvas.height = 512;
  // const ctx = canvas.getContext("2d");
  // ctx.fillStyle = "#00ff00";
  // ctx.fillRect(0, 0, 512, 512);

  const texture = new CanvasTexture(loader.canvas);
  const cubemap = equiToCube.convert(texture, 1024);
  scene.background = cubemap;
  // texture.mapping = EquirectangularReflectionMapping;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  cubemap.wrapS = cubemap.wrapT = RepeatWrapping;
  cubemap.offset.set(0.5, 0);
  mesh.material.map = texture;
  mesh.material.needsUpdate = true;

  torus.material.envMap = cubemap;
  // torus.material.refractionRatio = 0.9;
  torus.material.needsUpdate = true;
  // mesh.material.map.needsUpdate = true;
  // pano.append(loader.canvas);
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

const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ff00ff";
ctx.fillRect(0, 0, 512, 512);

const texture = new CanvasTexture(canvas);
texture.needsUpdate = true;

const mesh = new Mesh(
  new IcosahedronBufferGeometry(1, 7),
  new MeshBasicMaterial({ side: FrontSide, map: texture })
);
// mesh.scale.x = -1;
mesh.geometry.scale(-1, 1, 1);
// scene.add(mesh);

const directLight = new DirectionalLight(0xffffff);
scene.add(directLight);

const loader = new TextureLoader();
const roughnessMap = loader.load("./assets/Metal038_1K_Roughness.jpg");
roughnessMap.repeat.set(10, 1);
roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping;
const normalMap = loader.load("./assets/Metal038_1K_NormalGL.jpg");
normalMap.repeat.set(10, 1);
normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
const metalnessMap = loader.load("./assets/Metal038_1K_Metalness.jpg");
metalnessMap.repeat.set(10, 1);
metalnessMap.wrapS = metalnessMap.wrapT = RepeatWrapping;
const colorMap = loader.load("./assets/Metal038_1K_Color.jpg");
colorMap.repeat.set(10, 1);
colorMap.wrapS = colorMap.wrapT = RepeatWrapping;

const torus = new Mesh(
  new TorusKnotBufferGeometry(0.05, 0.015, 200, 36),
  // new IcosahedronBufferGeometry(0.05, 10),
  new MeshStandardMaterial({
    color: 0xffffff,
    map: colorMap,
    // emissive: 0xffffff,
    roughness: 0, //0.25,
    metalness: 0,
    refractionRatio: 0.9,
    roughnessMap,
    normalMap,
    metalnessMap,
    side: BackSide,
    refractionRatio: 0.9,
    envMap: texture,
  })
);
torus.rotation.x = Math.PI / 2;
torus.geometry.scale(-1, 1, 1);
scene.add(torus);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);

function render() {
  renderer.render(scene, camera);
  renderer.setAnimationLoop(render);
}

resize();
render();

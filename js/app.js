import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { ArcballControls } from 'three/addons/controls/ArcballControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass';
import {OutlinePass} from 'three/addons/postprocessing/OutlinePass';

import { Planet } from "./planets";
import {
  setupFocus,
  calculateTargetValues,
  setFollowTarget,
  isTargetInvalid,
  updateFocusTarget,
  stopFollowing,
} from "./focus";
import {addBlackHole, setupAccretionDisk} from "./blackhole";
import {FocusCircle} from "./projectinfo";

// Scene
const scene = new THREE.Scene();

// TODO credit https://esahubble.org/copyright/ very clearly!
// Background (made with https://jaxry.github.io/panorama-to-cubemap/ and https://www.deviantart.com/kirriaa/art/Free-star-sky-HDRI-spherical-map-719281328)
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("img/cubemap_images/");
const textureCube = await cubeTextureLoader.loadAsync( [
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
] );
scene.background = textureCube;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15)
const arcballControls = new OrbitControls(camera, renderer.domElement)//new ArcballControls(camera, renderer.domElement);
arcballControls.update();
setupFocus(camera, arcballControls);

// Post-processing
export let composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Bloom
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
    .1,
  0.1,
  0.5
);
composer.addPass(bloomPass);

export const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor = new THREE.Color( 0xffffff );
outlinePass.hiddenEdgeColor = new THREE.Color( 0xffffff );
composer.addPass(outlinePass);

// Lighting
const light = new THREE.PointLight( 0xffffff, 4, 0, 0);
light.position.set( 0, 0, 0 );
scene.add( light );

// TEMP PLANET todo remove
new Planet("models/test.glb", scene,
  50,
  0,
  10,
  new THREE.Euler(360, 0, 0),
  new THREE.Euler(0, 0, 0),
  new THREE.Vector3(0, 5, 0)
);
addBlackHole(scene, composer);


// Pointer setup (for focussing on planets)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersects = [];
window.onpointermove = ( event ) => {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( pointer, camera );
  intersects = raycaster.intersectObjects( scene.children );
}

const focusCircle = new FocusCircle(scene, camera);
// Focussing
document.onmouseup = () => {
  if (intersects.length > 0) {
    const obj = intersects[0].object
    if (isTargetInvalid(obj)) return;
    setFollowTarget(obj);
    focusCircle.makeRing();
  }
}
// Handle unfocusing
document.addEventListener("keydown", (key) => {
  if (key.code !== "Escape") return;
  stopFollowing()
  focusCircle.destroyRing();
})

// Handle window resizing
window.addEventListener( 'resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  composer.setSize( width, height );

  bloomPass.resolution = new THREE.Vector2(width, height);
  outlinePass.resolution = new THREE.Vector2(width, height);
});

// For particles
const batchedRenderer = await setupAccretionDisk( scene );

// Add antialiasing last
const antialiasing = new SMAAPass();
composer.addPass(antialiasing);
// Main loop
function animate() {
  // Update focus
  calculateTargetValues();
  updateFocusTarget();
  focusCircle.update();

  // Update planets
  Planet.updateAllPlanets();

  // Update black hole
  batchedRenderer.update(0.016);

  composer.render();

}

renderer.setAnimationLoop(animate);



/*window.onresize = function (event) {
  let visible_height = 2 * Math.tan( ( Math.PI / 180 ) * camera.fov / 2 ) * distance_from_camera;
}*/

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
  updateFocusTarget,
  stopFollowing,
} from "./focus";
import {setupParticles} from "./blackhole";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0)

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
    .7,
  0.1,
  0
);
//composer.addPass(bloomPass);

export const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor = new THREE.Color( 0xffffff );
outlinePass.hiddenEdgeColor = new THREE.Color( 0xffffff );
composer.addPass(outlinePass);

// TEMP LIGHT
const light = new THREE.DirectionalLight( 0xffffff, 1);
light.position.set( 3, -5, 3 );
scene.add( light );

// TEMP PLANET
new Planet("models/test.glb", scene,
  10,
  0,
  10,
  new THREE.Euler(360, 0, 0),
  new THREE.Euler(0, 0, 0),
  new THREE.Vector3(0, 0, 0)
);


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
document.onmouseup = () => {
  if (intersects.length > 0) {
    setFollowTarget(intersects[0].object);
  }
}
// Handle unfocusing
document.addEventListener("keydown", stopFollowing)

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

const geometry = new THREE.SphereGeometry( 3, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
const sphere = new THREE.Mesh( geometry, material );
sphere.position.y = 1;
scene.add(sphere);
const blackHoleOutline = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
blackHoleOutline.edgeStrength = 1;
blackHoleOutline.edgeGlow = 10;
blackHoleOutline.edgeThickness = 1;
blackHoleOutline.visibleEdgeColor = new THREE.Color( 0xffffff );
//blackHoleOutline.hiddenEdgeColor = new THREE.Color( 0xffffff );
blackHoleOutline.selectedObjects = [sphere];
composer.addPass(blackHoleOutline);


// Add antialiasing last
const antialiasing = new SMAAPass();
composer.addPass(antialiasing);

const batchedRenderer = await setupParticles( scene );

// Main loop
function animate() {
  // Update focus
  calculateTargetValues();
  updateFocusTarget();

  // Update planets
  Planet.updateAllPlanets();

  // Update black hole
  let x = (Math.random() * (0.017 - 0.013)) + 0.013;
  batchedRenderer.update(0.016);

  composer.render();

}

renderer.setAnimationLoop(animate);



/*window.onresize = function (event) {
  let visible_height = 2 * Math.tan( ( Math.PI / 180 ) * camera.fov / 2 ) * distance_from_camera;
}*/

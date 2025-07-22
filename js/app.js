import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { ArcballControls } from 'three/addons/controls/ArcballControls';

import { Planet } from "./planets";
import {
  isTargetInvalid, setFollowTarget,
  setupFocusing,
  updateFocus,
} from "./focus";
import {addBlackHole, setupAccretionDisk} from "./blackhole";
import {loadPlanets} from "./loadPlanets";
import {addPostProcessing} from "./postProcessing";
import {addSidebar} from "./sidebar";

const scene = new THREE.Scene();

// Background (made with https://jaxry.github.io/panorama-to-cubemap/ and https://www.spacespheremaps.com/silver-and-gold-nebulae-spheremaps/)
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("img/cubemap_images/");
const textureCube = await cubeTextureLoader.loadAsync( [
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
] );
textureCube.intensity = 1.5;
scene.background = textureCube;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Handle window resizing
window.addEventListener( 'resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
});

// Camera and controls
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15)
// const controls = new OrbitControls(camera, renderer.domElement)
const controls = new ArcballControls(camera, renderer.domElement, scene);
controls.cursorZoom = true;
controls.adjustNearFar = true;
controls.setGizmosVisible(false);
controls.enableFocus = false;
controls.update();

// Lighting
const light = new THREE.PointLight( 0xffffff, 4, 0, 0);
light.position.set( 0, 0, 0 );
scene.add( light );

// Pointer setup (for detecting clicked objects etc)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
export let intersects = [];
window.onmousemove = window.ontouchmove = ( event ) => {
  // Get touch position, or mouse position
  const clientX = (event.touches && event.touches[0].clientX) || event.clientX;
  const clientY = (event.touches && event.touches[0].clientY) || event.clientY;

  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
}
document.onmouseup = document.ontouchend = () => {
  // If an object was clicked
  for (const intersection of intersects) {
    const obj = intersects[0].object
    if (!isTargetInvalid(obj)) { // If valid (not invalid)
      setFollowTarget(obj);
      return; // Return after the first valid object was found (which will be closest, ie the one the user clicked)
    }
  }
}
const updateRaycaster = () => {
  raycaster.setFromCamera( pointer, camera );
  intersects = raycaster.intersectObjects( scene.children );
}

// Do post-processing last
export const composer = addPostProcessing(scene, camera, renderer);

// Other setup
setupFocusing(camera, controls);
addBlackHole(scene, composer, camera);
const batchedRenderer = await setupAccretionDisk( scene ); // For particles
loadPlanets(scene);
addSidebar();


// Main loop
function animate() {
  updateRaycaster();
  Planet.updateAllPlanets();
  updateFocus();
  batchedRenderer.update(0.016); // Update black hole particles
  composer.render(); // Render with post processing
}

renderer.setAnimationLoop(animate);

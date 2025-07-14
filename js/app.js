import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls';

import { Planet } from "./planets";
import {
  setupFocusing,
  updateFocus,
} from "./focus";
import {addBlackHole, setupAccretionDisk} from "./blackhole";
import {loadPlanets} from "./loadPlanets";
import {addPostProcessing} from "./postProcessing";

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
const controls = new OrbitControls(camera, renderer.domElement)//new ArcballControls(camera, renderer.domElement);
controls.update();

// Lighting
const light = new THREE.PointLight( 0xffffff, 4, 0, 0);
light.position.set( 0, 0, 0 );
scene.add( light );

// Pointer setup (for detecting clicked objects etc)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
export let intersects = [];
window.onpointermove = ( event ) => {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( pointer, camera );
  intersects = raycaster.intersectObjects( scene.children );
}

// Do post-processing last
export const composer = addPostProcessing(scene, camera, renderer);

// Other setup
setupFocusing(camera, controls);
addBlackHole(scene, composer);
const batchedRenderer = await setupAccretionDisk( scene ); // For particles
loadPlanets(scene);


// Main loop
function animate() {
  Planet.updateAllPlanets();
  updateFocus();
  batchedRenderer.update(0.016); // Update black hole particles
  composer.render(); // Render with post processing
}

renderer.setAnimationLoop(animate);

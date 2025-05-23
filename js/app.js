import * as THREE from "three";
import { ArcballControls } from 'three/addons/controls/ArcballControls';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass';

import { Planet, r } from "./planets";
import {
  setupFocus,
  calculateCenterAndCamPos,
  setFollowTarget,
  updateFocusTarget,
  stopFollowing,
  changeZoom,
  smoothFocusOnObject,
} from "./focus";

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

// Post processing
export let composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Bloom
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  0.4,
  0
);
composer.addPass(bloomPass);
const antialiasing = new SMAAPass();
composer.addPass(antialiasing);

// TEMP LIGHT
const light = new THREE.DirectionalLight( 0xffffff, 1);
light.position.set( 3, -5, 3 );
scene.add( light );

// TEMP PLANET
const planet = new Planet("models/test.glb", scene,
  10,
  0,
  10,
  new THREE.Euler(r(0), r(0), r(0)),
  new THREE.Euler(r(0), r(0), r(0)),
  //new THREE.Vector3(0, 0, 0)
);

// TEMP CENTRE MODEL
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader';
const loader = new GLTFLoader();
loader.load("models/test.glb",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);


// Pointer setup (for clicking planets)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
window.onpointermove = ( event ) => {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
document.onmousedown = () => {
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( scene.children );

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    setFollowTarget(clickedObject);
    smoothFocusOnObject()
  }
}

//document.addEventListener("mousewheel", changeZoom, {capture: false, passive: false});
document.addEventListener("keydown", stopFollowing)


// Main loop
function animate() {
  calculateCenterAndCamPos();
  updateFocusTarget();
  Planet.updateAllOrbits();
  composer.render();
  console.log(arcballControls.rotateSpeed);
}

renderer.setAnimationLoop(animate);



/*window.onresize = function (event) {
  let visible_height = 2 * Math.tan( ( Math.PI / 180 ) * camera.fov / 2 ) * distance_from_camera;
}*/

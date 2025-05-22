import * as THREE from "three";
import { ArcballControls } from 'three/addons/controls/ArcballControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass';

import { Planet, r } from "./planets";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 15)

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Post-processing
let composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Bloom
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  0.4,
  0
);
composer.addPass( bloomPass );
const antialiasing = new SMAAPass();
composer.addPass(antialiasing);

// TEMP LIGHT
const light = new THREE.DirectionalLight( 0xffffff, 1);
light.position.set( 3, -5, 3 );
scene.add( light );

const planet = new Planet("models/test.glb", scene,
  10,
  0,
  100,
  new THREE.Euler(r(300), r(3), r(5)),
  new THREE.Euler(r(0), r(0), r(45)),
  //new THREE.Vector3(0, 0, 0)
);


const arcballControls = new ArcballControls(camera, renderer.domElement);
arcballControls.update();

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


// Pointer setup (for clicking planets
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'pointermove', onPointerMove );

document.onmousedown = () => {
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( scene.children );

  if (intersects.length > 0) {
    console.log("test");
  }
}

// Main loop
function animate() {

  planet.updateOrbit();
  composer.render()
}

renderer.setAnimationLoop(animate);



/*window.onresize = function (event) {
  let visible_height = 2 * Math.tan( ( Math.PI / 180 ) * camera.fov / 2 ) * distance_from_camera;
}*/

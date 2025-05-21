import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { ArcballControls } from 'three/addons/controls/ArcballControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";

import { Planet } from "./planets";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 3, 15)

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
  1.5,
  0.4,
  0
);
composer.addPass( bloomPass );

// TEMP LIGHT
const light = new THREE.DirectionalLight( 0xffffff, 1);
light.position.set( 3, -5, 3 );
scene.add( light );

const planet = new Planet("models/test.glb",
  10,
  0,
  null,
  100,
  new THREE.Vector3(0, 0, 0),
  scene
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


const clock = new THREE.Clock();
const rotationMatrix = new THREE.Matrix4();
const targetQuaternion = new THREE.Quaternion();
const speed = 2;
document.onkeydown = (event) => {
  if (event.key === "a") {
    const delta = clock.getDelta();

    rotationMatrix.lookAt( camera.position, planet.model.position, planet.model.up );
    targetQuaternion.setFromRotationMatrix( rotationMatrix );

    if ( ! camera.quaternion.equals(targetQuaternion) ) {
      const step = speed * delta;
      camera.quaternion.rotateTowards( targetQuaternion, step );
    }


    camera.position.addVectors(planet.model.position, new THREE.Vector3(5, 1, 0));
    arcballControls.update()
  }
}

function animate() {
  planet.updateOrbit();

  composer.render()
}

renderer.setAnimationLoop(animate);



/*window.onresize = function (event) {
  let visible_height = 2 * Math.tan( ( Math.PI / 180 ) * camera.fov / 2 ) * distance_from_camera;
}*/

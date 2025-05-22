import {GLTFLoader} from 'three/addons/loaders/GLTFLoader';
import * as THREE from "three";

const loader = new GLTFLoader();


const timePageLoaded = performance.now();
function getElapsedTime() {
  // Get current time, subtract from the time the page loaded to get the time since page loaded in milliseconds.
  // Divide by 1000 to get seconds.
  return (performance.now() - timePageLoaded) / 1000
}
function radians(degrees) {
  return (degrees * Math.PI) / 180.0;
}

export const r = radians;

export class Planet {
  static count = 0;

  constructor(modelPath, scene, orbitRadius, orbitInitialAngle, orbitSpeed,
              planetRotationSpeed = new THREE.Euler(0, 0.1, 0),
              orbitOrientation = new THREE.Euler(0, 0, 0),
              orbitCentre = new THREE.Vector3(0, 0, 0)) {
    this.modelPath = modelPath;
    this.orbitDistance = orbitRadius;
    this.initialAngle = orbitInitialAngle;
    this.orbitSpeed = orbitSpeed;
    this.planetRotationSpeed = planetRotationSpeed;
    this.orbitOrientation = orbitOrientation;
    this.centre = orbitCentre;

    this.model = null;

    // Load model
    loader.load("models/test.glb",
      (gltf) => {
        this.model = gltf.scene;

        // Placeholder parent to store, position, and orient both the planet and its orbit
        this.parent = new THREE.Object3D();
        this.parent.position.set(...this.centre);
        this.parent.rotation.set(...this.orbitOrientation);
        this.parent.add(this.model);

        // Add orbit line
        this.parent.add(this.makeOrbitLine());

        // Update orbit and add to scene
        this.updateOrbit();
        scene.add(this.parent);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    Planet.count++;
  }

  updateOrbit() {
    if (this.model == null) return

    const time = getElapsedTime();

    let angle = radians(this.initialAngle + this.orbitSpeed * time);
    this.model.position.x = this.orbitDistance * Math.cos(angle) + this.centre.x;
    this.model.position.z = this.orbitDistance * Math.sin(angle) + this.centre.z;

    this.model.rotation.x = this.planetRotationSpeed.x * time;
    this.model.rotation.y = this.planetRotationSpeed.y * time;
    this.model.rotation.z = this.planetRotationSpeed.z * time;
  }

  static orbitLineWidth = 0.02;
  makeOrbitLine() {
    const geometry = new THREE.RingGeometry( this.orbitDistance, this.orbitDistance + Planet.orbitLineWidth, 50 );
    const material = new THREE.MeshBasicMaterial( { color: 0x555555, side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
}

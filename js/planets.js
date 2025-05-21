import {GLTFLoader} from 'three/addons/loaders/GLTFLoader';

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

export class Planet {
  static count = 0;

  constructor(modelPath, orbitDistance, initialAngle, orbitOrientation, orbitSpeed, centre, scene) {
    this.modelPath = modelPath;
    this.orbitDistance = orbitDistance;
    this.initialAngle = initialAngle;
    this.orbitOrientation = orbitOrientation;
    this.orbitSpeed = orbitSpeed;
    this.centre = centre;

    this.model = null;

    // Load model
    loader.load("models/test.glb",
      (gltf) => {
        this.model = gltf.scene;
        this.updateOrbit();
        scene.add(this.model);
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

    let angle = radians(this.initialAngle + this.orbitSpeed * getElapsedTime());

    this.model.position.x = this.orbitDistance * Math.cos(angle) + this.centre.x;
    this.model.position.z = this.orbitDistance * Math.sin(angle) + this.centre.z;
  }
}

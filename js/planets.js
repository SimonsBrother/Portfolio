import {GLTFLoader} from 'three/addons/loaders/GLTFLoader';
import * as THREE from "three";

const loader = new GLTFLoader();

// For calculating orbit positions
const timePageLoaded = performance.now();
function getElapsedTime() {
  // Get current time, subtract from the time the page loaded to get the time since page loaded in milliseconds.
  // Divide by 1000 to get seconds.
  return (performance.now() - timePageLoaded) / 1000
}

// Convert degrees to radians
function radians(degrees) {
  return (degrees * Math.PI) / 180.0;
}
export const r = radians; // Shortcut

// Degrees to radians for Euler angles
function radiansEuler(euler) {
  return new THREE.Euler(radians(euler.x), radians(euler.y), radians(euler.z));
}


/**
 * Handles loading the model of the planet and orbit calculations
 */
export class Planet {
  /**
   * The number of planets that have been created.
   * @type {number}
   */
  static count = 0;

  /**
   * List of the planet objects created.
   * @type {[Planet]}
   */
  static planets = [];

  /**
   *
   * @param modelPath path to the model of the planet.
   * @param scene the scene to add the planet to.
   * @param orbitRadius the radius of the orbit.
   * @param orbitInitialAngle the starting angle of the orbit in degrees.
   * @param orbitSpeed the speed of the orbit in degrees per second.
   * @param planetRotationSpeed the speed that the planet rotates, as an Euler in degrees.
   * @param orbitOrientation the orientation of the orbit, as an Euler in degrees.
   * @param orbitCentre the point that the orbit moves around, as a Vector3.
   */
  constructor(modelPath, scene, orbitRadius, orbitInitialAngle, orbitSpeed,
              planetRotationSpeed = new THREE.Euler(0, 0.1, 0),
              orbitOrientation = new THREE.Euler(0, 0, 0),
              orbitCentre = new THREE.Vector3(0, 0, 0)) {
    this.modelPath = modelPath;
    this.orbitDistance = orbitRadius;
    this.initialAngle = orbitInitialAngle;
    this.orbitSpeed = orbitSpeed;
    this.planetRotationSpeed = radiansEuler(planetRotationSpeed);
    this.orbitOrientation = radiansEuler(orbitOrientation);
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
        this.updatePlanet();
        scene.add(this.parent);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    Planet.count++;
    Planet.planets.push(this);
  }

  // Updates the orbit position and rotation
  updatePlanet() {
    // In case model is not yet loaded
    if (this.model == null) return

    const time = getElapsedTime();

    // Update orbit
    let angle = radians(this.initialAngle + this.orbitSpeed * time);
    this.model.position.x = this.orbitDistance * Math.cos(angle) + this.centre.x;
    this.model.position.z = this.orbitDistance * Math.sin(angle) + this.centre.z;

    // Update rotation
    this.model.rotation.x = this.planetRotationSpeed.x * time;
    this.model.rotation.y = this.planetRotationSpeed.y * time;
    this.model.rotation.z = this.planetRotationSpeed.z * time;
  }

  // Construct orbit line
  static orbitLineWidth = 0.02;
  makeOrbitLine() {
    const geometry = new THREE.RingGeometry( this.orbitDistance, this.orbitDistance + Planet.orbitLineWidth, 50 );
    const material = new THREE.MeshBasicMaterial( { color: 0x555555, side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  // Calls the update method of all planets
  static updateAllPlanets() {
    for (const planet of Planet.planets) {
      planet.updatePlanet();
    }
  }
}

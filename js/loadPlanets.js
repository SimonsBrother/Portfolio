import * as THREE from "three";
import {Planet} from "./planets";

// All planet data is defined here
export const planetJsons = [
  {
    name: "Test planet 1",
    iconPath: "img/test.svg",
    modelPath: "models/test.glb",
    planetSize: 1.6,

    orbitRadius: 50,
    orbitStartingAngle: 0,
    orbitSpeed: 5,

    planetRotationSpeed: new THREE.Euler(50, 0, 0),
    orbitOrientation: new THREE.Euler(0, 0, 0),
    orbitCentre: new THREE.Vector3(0, 5, 0),
  },

  {
    name: "Monkey",
    iconPath: "img/test.svg",
    modelPath: "models/monkey.glb",
    planetSize: 10,

    orbitRadius: 100,
    orbitStartingAngle: 180,
    orbitSpeed: 4,

    planetRotationSpeed: new THREE.Euler(20, 50, 10),
    orbitOrientation: new THREE.Euler(0, 0, 0),
    orbitCentre: new THREE.Vector3(0, 5, 0)
  }
]

/**
 * Creates planet objects from the planet JSONs.
 * @param scene the scene to add the planets to.
 */
export function loadPlanets(scene) {
  for (const planetJson of planetJsons) {
    new Planet(
      planetJson.modelPath, scene,
      planetJson.orbitRadius,
      planetJson.orbitStartingAngle,
      planetJson.orbitSpeed,
      planetJson.planetSize,
      planetJson.planetRotationSpeed,
      planetJson.orbitOrientation,
      planetJson.orbitCentre,
      planetJson
    );
  }
}

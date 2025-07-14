import * as THREE from "three";
import {Planet} from "./planets";

export function loadPlanets(scene) {
  new Planet("models/test.glb", scene,
    50,
    0,
    5,
    1.6,
    new THREE.Euler(50, 0, 0),
    new THREE.Euler(0, 0, 0),
    new THREE.Vector3(0, 5, 0)
  );
  new Planet("models/monkey.glb", scene,
    100,
    180,
    4,
    10,
    new THREE.Euler(20, 50, 10),
    new THREE.Euler(0, 0, 0),
    new THREE.Vector3(0, 5, 0)
  );
}

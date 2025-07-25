import * as THREE from "three";
import {Planet} from "./planets";

function runValidationTests(scene) {
  try {
    testValidationCaseThrowsError("models/test.glb", null, 1, 1, 1, 1);
    testValidationCaseThrowsError("models/test.glb", scene, 0, 1, 1, 1)
    testValidationCaseThrowsError("models/test.glb", scene, -0.1, 1, 1, 1)
    testValidationCaseThrowsError("models/test.glb", scene, 1, 1, 1, 0)
    testValidationCaseThrowsError("models/test.glb", scene, 1, 1, 1, -0.1)

    // Test optional args
    testValidationCaseThrowsError("models/test.glb", scene, 1, 1, 1, 1, new THREE.Vector3())
    testValidationCaseThrowsError("models/test.glb", scene, 1, 1, 1, 1, new THREE.Euler(), new THREE.Vector3())
    testValidationCaseThrowsError("models/test.glb", scene, 1, 1, 1, 1, new THREE.Euler(), new THREE.Euler(), new THREE.Euler())
    console.log("Tests passed.")
  }
  catch (error) {
    console.error(error);
  }
}

function testValidationCaseThrowsError(...args) {
  try {
    new Planet(...args);
  }
  catch(e) {
    return;
  }
  throw "Validation tests failed.";
}

export function loadPlanets(scene) {
  // runValidationTests(scene);
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

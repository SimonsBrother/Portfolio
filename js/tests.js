/**
 * Tests for any simple units of code.
 */
import {Planet} from "./planets";
import * as THREE from "three";

function runValidationTests(scene) {
  // Define function that creates a planet expecting an error
  function testValidationCaseThrowsError(...args) {
    try { new Planet(...args); } // Try to create planet
    catch(e) { return; } // If an error was raised as expected, return
    throw "Validation tests failed."; // No error, so throw an error
  }

  // Test errors are thrown where expected
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

runValidationTests();

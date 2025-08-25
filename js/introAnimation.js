import * as THREE from "three";
import {Vector3} from "three";
import {smoothlyMoveCamera} from "./focus";


const initialCameraPos = new Vector3(0, 40, 80);
const initialTarget = new Vector3(0, 10, 0);

const introCameraStartPos = new Vector3(50, -100, -100);
const introStartTarget = initialTarget.clone();

function rad(degrees){
  return (degrees * Math.PI) / 180.0;
}

/**
 * From https://discourse.threejs.org/t/camera-rotation-with-arcballcontrols/50024/7
 */
function rollCamera(camera, controls, axis, radians) {
  //check the axis and set the vector
  let vector;
  if (axis === "Z") {
    vector = new THREE.Vector3(0, 0, 1);
  } else if (axis === "Y") {
    vector = new THREE.Vector3(0, 1, 0);
  } else if (axis === "X") {
    vector = new THREE.Vector3(1, 0, 0);
  } else {
    vector = new THREE.Vector3(0, 0, 1);
  }

  // Get the vector from the camera to the target (controls.target)
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();

  // Create a quaternion representing the rotation around the Z axis
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(vector, radians);

  // Rotate the direction vector
  direction.applyQuaternion(quaternion);

  // Calculate the new position of the camera
  const distance = camera.position.distanceTo(controls.target);
  const newPosition = new THREE.Vector3().addVectors(controls.target, direction.multiplyScalar(distance));

  // Apply the new position and up vector to the camera
  camera.position.copy(newPosition);
  camera.up.applyQuaternion(quaternion);

  // Look at the target
  camera.lookAt(controls.target);

  // Update the camera's matrix and the controls
  camera.updateMatrixWorld();
  controls.update();
}

export function setupCameraInitialState(camera, controls) {
  camera.position.copy(initialCameraPos); // Set position first
  rollCamera(camera, controls, 'X', rad(-30));
  rollCamera(camera, controls, 'Z', rad(70));
  controls.target.copy(initialTarget);
  camera.updateProjectionMatrix();
  controls.update();
}

let cameraAnimationRan = false;
export function animateCamera() {
  if (cameraAnimationRan) return;
  cameraAnimationRan = true;
  smoothlyMoveCamera(introCameraStartPos, introStartTarget, initialCameraPos, initialTarget, true, 5000, true)
}

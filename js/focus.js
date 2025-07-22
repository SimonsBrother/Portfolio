import * as THREE from "three";
import {outlinePass} from "./postProcessing";
import {dimParticles, undimParticles} from "./blackhole";


/**
 * Sets up focussing for the camera.
 * @param camera_ the camera in the scene that will be focussing on objects.
 * @param controls_ the controls (ideally orbit control, arcball may work)
 */
export function setupFocusing(camera_, controls_) {
  camera = camera_;
  controls = controls_;
  unfocussedFov = camera.fov;
}
// For ease of access, rather than having params for them in every function
let camera = null;
let controls = null;
let unfocussedFov = -1;

let followTarget = null; // The object that the camera will attempt to follow.
let targetPos = null; // The global position of the target object
let targetFov = -1; // The target FOV of the camera; the camera may not yet be at that FOV

// For updating UI
export let setNavStateFunction = {setFollowing: null};

/**
 * Returns true if the object selected is invalid, and so should NOT be focussed on
 * @param object the object to check.
 * @returns {boolean} true if the object passed is invalid.
 */
export function isTargetInvalid(object) {
  return (!object.parent || // If there is no parent, or
    (!object.parent.userData.isSelectable || // (a parent therefore exists) the parent is not selectable, or
      (followTarget && object.parent.uuid === followTarget.uuid))) // if there is currently a followed target and that target is the same as the new target
  // Then the target is invalid
}

/**
 * Dims quasar, configures controls, and smoothly focuses on the object.
 * @param object the object to focus on.
 */
export function setFollowTarget(object) {
  dimParticles();
  setNavStateFunction.setFollowing(); // 2 is following state
  followTarget = object.parent;
  controls.enablePan = false;
  controls.enableZoom = false;
  // controls.update();

  outlinePass.selectedObjects = [object.parent];
  smoothFocusOnObject();
}

/**
 * Unfocuses and stops following the object that was currently being followed.
 */
export function stopFollowing() {
  followTarget = null;
  controls.enablePan = true;
  controls.enableZoom = true;

  outlinePass.selectedObjects = [];
  smoothlyUnfocus();
  camera.fov = unfocussedFov
  controls.update()
  undimParticles();
}


/**
 * Updates the position that the control should point to (its target) and the FOV the camera should point to, and applies the changes.
 * This should be part of the animation loop.
 * @param fovMarginFactor the percentage of extra space that should be put around the followed object, based on its size.
 * A fovMarginFactor 1.1 would mean there would be empty space at the sides of the object of 10% the object's size.
 */
export function updateFocus(fovMarginFactor = 2) {
  if (followTarget === null) return; // Nothing being followed, return

  if (targetPos === null) targetPos = new THREE.Vector3();
  followTarget.getWorldPosition(targetPos);

  targetPos = getTranslatedTargetPos();

  // Use trigonometry to work out the FOV needed; increasing fovMarginFactor increases the margin,
  const distance = camera.position.distanceTo(targetPos);
  // which is multiplied by the target size to avoid achieve a similar size for all planets
  targetFov = Math.atan((followTarget.userData.planetSize * fovMarginFactor) / (distance))
    * (180 / Math.PI) // Convert to degrees
    * 2 // Trigonometry only gets half of the FOV via a right angled triangle

  // Update controls and camera, then update the values to be used, in that order - I don't know why, but it doesn't smoothly focus otherwise.
  controls.update();
  camera.updateProjectionMatrix();

  // Update target values
  controls.target.copy(targetPos); // Must not be updated or else the camera snaps
  camera.fov = targetFov;
}

/**
 * Calculates the position the controls should point to as a target,
 * such that the camera points just to the left of the planet.
 * @return {THREE.Vector3} the position the controls should point to.
 */
function getTranslatedTargetPos() {
  // Only translate if the aspect ratio is wide enough; 1.2 was the point at which I found planets got cut off
  // So if the aspect ratio is too small, return untranslated target pos
  if (camera.aspect < 1.2) return targetPos;

  // The vector work is by Claude, so beware (structure was tweaked a little); it makes sense, but I'm not vector savvy
  const dir = new THREE.Vector3();
  dir.subVectors(targetPos, camera.position).normalize();
  const up = camera.up.clone().normalize(); // Get camera's up vector
  const right = new THREE.Vector3().crossVectors(dir, up).normalize(); // Calc right vector via cross product
  const left = right.clone().negate(); // Left is opposite of right
  // Calculate new target position
  return new THREE.Vector3().addVectors(targetPos, left.multiplyScalar(
    followTarget.userData.planetSize // How much to go left by
  ))
}


/**
 * Smoothly focuses on an object, by changing the FOV and control target
 * @param duration how long to take in milliseconds.
 */
export function smoothFocusOnObject(duration = 1000) {
  if (!followTarget) return;
  if (!targetPos) targetPos = new THREE.Vector3();
  // The real world position is the target end position
  let targetPosition = targetPos.clone();

  // The start position is where the camera is currently looking; get the direction of the camera, normalise, and multiply
  const startTarget = camera.getWorldDirection(new THREE.Vector3())
    .normalize()
    .multiplyScalar(1000);
  const originalCameraPos = camera.position.clone();
  const startFov = camera.fov;
  const startTime = performance.now();

  function animate() {
    if (followTarget === null) return;
    // Get expected progress and updated position of the follow target
    targetPosition = targetPos.clone();
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease in

    // Updates camera and controls
    // Move target to smoothly look at planet
    controls.target.lerpVectors(startTarget, targetPosition, easeProgress);
    // Move camera for better depth and to help avoid FOV limit
    const targetDistance = followTarget.userData.planetSize + 20; // Stay 15 units from the edge of the object (assuming the planetSize indicates the edge)
    const alpha = targetDistance / targetPosition.distanceTo(originalCameraPos)
    camera.position.lerpVectors(originalCameraPos,
      targetPosition.lerp(originalCameraPos, alpha), // Only go a certain proportion via lerp, or else the camera will go inside the planet
      easeProgress);
    camera.fov = lerp(startFov, targetFov, easeProgress);
    camera.updateProjectionMatrix();
    controls.update();

    // Loop via recursion, updating the frame
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

/**
 * Smoothly unfocuses by changing the FOV
 * @param duration how long to take in milliseconds.
 */
function smoothlyUnfocus(duration = 1000) {
  const startFov = camera.fov;
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out

    // Update camera
    camera.fov = lerp(startFov, unfocussedFov, easeProgress);
    camera.updateProjectionMatrix();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// Linear interpolation function for smoothly changing FOV
function lerp(start, end, t) {
  return start + (end - start) * t;
}

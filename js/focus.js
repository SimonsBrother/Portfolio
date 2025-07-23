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


  // When the user looks around when focussed, without letting go, it gradually becomes less stable,
  // this code forces the user to let go
  let timeLastLetGo = 0;
  const rotateDurationLimitWhenFocussed = 3000; //ms
  controls.addEventListener("change", () => {
    updateFocus(); // Minimise changes, think it helps
    // If a target is being followed and sufficient time has passed, disable rotation
    if (followTarget && performance.now() - timeLastLetGo > rotateDurationLimitWhenFocussed) {
      controls.enableRotate = false;
    }
  });
  // Re-enable rotation and reset the timer when the user lets go or grabs
  const enableRotation = () => {
    timeLastLetGo = performance.now();
    controls.enableRotate = true;
  }
  controls.addEventListener("start", enableRotation);
  controls.addEventListener("end", enableRotation);
}
// For ease of access, rather than having params for them in every function
let camera = null;
let controls = null;
let unfocussedFov = -1;

let followTarget = null; // The object that the camera will attempt to follow.
let targetPos = null; // The global position of the target object
let cameraPos = null;
const focusMarginFactor = 3; // Increase to increase the space around the planet.
let animating = false;

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
 * Updates the position that the control should point to (its target), and applies it.
 * This should be part of the animation loop.
 */
export function updateFocus() {
  if (followTarget === null) return; // Nothing being followed, return

  if (targetPos === null) targetPos = new THREE.Vector3();
  followTarget.getWorldPosition(targetPos);
  targetPos = getTranslatedTargetPos();

  const targetDistance = followTarget.userData.planetSize * focusMarginFactor;
  const currentDirection = new THREE.Vector3();
  camera.getWorldDirection(currentDirection);

  // Position camera at distance away from target, opposite to viewing direction
  cameraPos = targetPos.clone().add(currentDirection.multiplyScalar(-targetDistance));

  // Update
  if (animating) return; // ...unless there's an animation running
  controls.target.copy(targetPos);
  camera.position.copy(cameraPos);
  controls.update();
  camera.updateProjectionMatrix();
}

/**
 * Calculates the position the controls should point to as a target,
 * such that the camera points just to the left of the planet.
 * Assumes that targetPos has been set to the world pos of target object.
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
  if (!followTarget || !cameraPos) return;
  if (!targetPos) targetPos = new THREE.Vector3(); // todo make targetPos = new vector from start?

  animating = true;
  controls.enableRotate = false;

  // The start position is where the camera is currently looking; get the direction of the camera, normalise, and multiply
  const startTarget = camera.getWorldDirection(new THREE.Vector3())
    .normalize()
    .multiplyScalar(1000);
  const originalCameraPos = camera.position.clone();
  const startTime = performance.now();

  function animate() {
    if (followTarget === null) return;
    // Get expected progress and updated position of the follow target
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease in
    console.log(progress);

    // Updates camera and controls
    // Change target to smoothly look at planet
    controls.target.lerpVectors(startTarget, targetPos, easeProgress);
    // Move camera
    camera.position.lerpVectors(originalCameraPos, cameraPos, easeProgress);

    camera.updateProjectionMatrix();
    controls.update();

    // Loop via recursion, updating the frame
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animating = false;
  controls.enableRotate = true;

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

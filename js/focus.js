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
    if (animating) return; // Animating disables rotating; prioritise that
    controls.enableRotate = true;
  }
  controls.addEventListener("start", enableRotation);
  controls.addEventListener("end", enableRotation);
}
// For ease of access, rather than having params for them in every function
let camera = null;
let controls = null;

let followTarget = null; // The object that the camera will attempt to follow.
let targetPos = null; // The global position of the target object todo maybe make this default vector?
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

  // Save these for animation
  const cameraStartPos = camera.position.clone();
  const cameraStartDir = camera.getWorldDirection(new THREE.Vector3())

  outlinePass.selectedObjects = [object.parent];
  updateFocus(false); // Get target values for animation, but don't apply them because it will snap to them
  smoothFocusOnObject(cameraStartPos, cameraStartDir);
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
  undimParticles();
}


/**
 * Updates the position that the control should point to (its target), and applies it.
 * This should be part of the animation loop.
 */
export function updateFocus(applyNewValues = true) {
  if (followTarget === null) return; // Nothing being followed, return
  if (targetPos === null) targetPos = new THREE.Vector3();
  // Calculate "target"
  followTarget.getWorldPosition(targetPos);
  targetPos = getTranslatedTargetPos();

  // Calculate camera position
  const targetDistance = followTarget.userData.planetSize * focusMarginFactor;
  const currentDirection = new THREE.Vector3();
  camera.getWorldDirection(currentDirection);
  // Position camera at distance away from target, opposite to viewing direction
  cameraPos = targetPos.clone().add(currentDirection.multiplyScalar(-targetDistance));

  // Update, unless there's an animation running, or was specifically told not to update (such as if this was called before animation)
  if (applyNewValues && !animating) {
    controls.target.copy(targetPos);
    camera.position.copy(cameraPos);
    controls.update();
    camera.updateProjectionMatrix();
  }
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
 * Smoothly focuses on an object, by changing the camera position control target
 * @param cameraStartPos the camera position to animate from.
 * @param cameraStartDir the camera direction to animate from.
 * @param duration how long to take in milliseconds.
 */
function smoothFocusOnObject(cameraStartPos, cameraStartDir, duration = 1000) {
  animating = true;
  controls.enableRotate = false;

  // The start position is where the camera is currently looking; get the direction of the camera,
  // process it so that it's looking somewhere in the distance
  const targetStartPos = cameraStartDir
    .normalize()
    .multiplyScalar(100);
  const startTime = performance.now();

  function animate() {
    if (followTarget === null) return; // Can sometimes occur, maybe when following is stopped mid-animation
    // Get expected progress and updated position of the follow target
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOut(progress);

    // Updates camera and controls; change target control to look at planet, change camera position to zoom in
    console.log(targetStartPos, targetPos, controls.target)
    controls.target.lerpVectors(targetStartPos, targetPos, easeProgress);
    camera.position.lerpVectors(cameraStartPos, cameraPos, easeProgress);

    camera.updateProjectionMatrix();
    // Do NOT update controls, or else the camera direction snaps

    // Loop via recursion, updating the frame
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
    // When the animation ends
    else {
      animating = false;
      controls.enableRotate = true;
    }
  }

  animate();
}

/**
 * Copied from https://stackoverflow.com/questions/30007853/simple-easing-function-in-javascript
 * @param t progress, from 0 to 1 inclusive.
 * @return {number} a different value from 0 to 1 inclusive that follows the pattern of easing in and out.
 */
function easeInOut(t){
  return t > 0.5 ? 4*Math.pow((t-1),3)+1 : 4*Math.pow(t,3);
}

/** TODO REDO
 * Smoothly unfocuses by changing the FOV
 * @param duration how long to take in milliseconds.
 */
function smoothlyUnfocus(duration = 1000) {
  // const startFov = camera.fov;
  // const startTime = performance.now();
  //
  // function animate() {
  //   const elapsed = performance.now() - startTime;
  //   const progress = Math.min(elapsed / duration, 1);
  //   const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out
  //
  //   // Update camera
  //   camera.fov = lerp(startFov, unfocussedFov, easeProgress);
  //   camera.updateProjectionMatrix();
  //
  //   if (progress < 1) {
  //     requestAnimationFrame(animate);
  //   }
  // }
  //
  // animate();
}

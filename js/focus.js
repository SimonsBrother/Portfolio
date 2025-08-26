import * as THREE from "three";
import {outlinePass} from "./postProcessing";
import {dimParticles, undimParticles} from "./blackhole";


/**
 * Sets up focussing for the camera.
 * @param camera_ the camera in the scene that will be focussing on objects.
 * @param controls_ the controls (ideally orbit control, arcball may work)
 */
export function setupFocusing(camera_, controls_) {
  if (!camera_) throw `Bad camera: ${camera_}`;
  if (!controls_) throw `Bad control: ${controls_}`;
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

export let followTarget = null; // The object that the camera will attempt to follow.
const targetPos = new THREE.Vector3(); // The global position of the target object
const cameraPos = new THREE.Vector3();
const focusMarginFactor = 2.5; // Increase to increase the space around the planet.
let animating = false; // Flag that helps process and work around animations
let cameraStartPos = null; // On focus, this is set to the current camera position
let targetStartPos = null; // On focus, this is set to a position the camera is currently pointing at

// For updating UI
export let setNavStateFunction = {setFollowing: null, setDefault: null};
export let setTitleFunction = {setTitle: null};

/**
 * Checks if the object or its parent is valid, and starts following it if it is.
 * @param object the object to check.
 * @returns {boolean} false if a focus target was found, true if the object or its parents are valid..
 */
export function handlePossibleFocusTarget(object) {
  if (isObjectValidFocusTarget(object)) {
    setFollowTarget(object);
    return true;
  }
  if (object.parent && isObjectValidFocusTarget(object.parent)) {
    setFollowTarget(object.parent);
    return true;
  }
  return false;
}

/**
 * Returns true if the object can be followed.
 * @param object the object to check.
 * @return {boolean} true if the object can be followed.
 */
function isObjectValidFocusTarget(object) {
  // If selectable and if either there isn't a followTarget or it isn't already being followed, it's valid
  try {
    return object.userData && object.userData.isSelectable && (!followTarget || followTarget && object.uuid !== followTarget.uuid)
  }
  // Probably never happen
  catch (e) {
    return false;
  }
}

/**
 * Dims quasar, configures controls, and smoothly focuses on the object.
 * @param object the object to focus on.
 */
export function setFollowTarget(object) {
  if (!object) throw `Bad object ${object}`;
  dimParticles();
  followTarget = object;
  if (setNavStateFunction.setFollowing) setNavStateFunction.setFollowing(); // 2 is following state
  if (setTitleFunction.setTitle) setTitleFunction.setTitle(followTarget.userData.planetJson.name);
  controls.enablePan = false;
  controls.enableZoom = false;

  // Save these for animation
  cameraStartPos = camera.position.clone();
  targetStartPos = getCameraDirectionAsPos();

  outlinePass.selectedObjects = [object];
  updateFocus(false); // Get target values for animation, but don't apply them because it will snap to them
  smoothlyMoveCamera(cameraStartPos, targetStartPos, cameraPos, targetPos, false);
}

/**
 * Unfocuses and stops following the object that was currently being followed.
 */
export function stopFollowing() {
  followTarget = null;
  if (setTitleFunction.setTitle) setTitleFunction.setTitle("");

  outlinePass.selectedObjects = [];
  undimParticles();
  smoothlyUnfocus();
  setTimeout(() => {
    controls.enablePan = true;
    controls.enableZoom = true;
  }, 1000);
}


/**
 * Updates the position that the control should point to (its target), and applies it.
 * This should be part of the animation loop.
 */
export function updateFocus(applyNewValues = true) {
  if (followTarget === null) return; // Nothing being followed, return
  // Calculate "target"
  followTarget.getWorldPosition(targetPos);
  targetPos.copy(getTranslatedTargetPos());

  // Calculate camera position
  const targetDistance = followTarget.userData.planetSize * focusMarginFactor;
  const currentDirection = new THREE.Vector3();
  camera.getWorldDirection(currentDirection);
  // Position camera at distance away from target, opposite to viewing direction
  cameraPos.copy(targetPos.clone().add(currentDirection.multiplyScalar(-targetDistance)));

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
    -followTarget.userData.planetSize // How much to go left by
  ))
}

function allowUserToControlCamera(state) {
  controls.enablePan = controls.enableRotate = controls.enableZoom = state;
}

/**
 * Smoothly focuses on an object, by changing the camera position control target
 * @param cameraStartPos the camera position to animate from.
 * @param targetStartPos the position the camera is looking at.
 * @param cameraEndPos the camera position to animate to.
 * @param targetEndPos the position the camera should look to.
 * @param updateControls if true, the controls will be updated throughout the animation,
 * otherwise they wll only be updated at the end of the animation - this also levels the camera.
 * @param disableControls if true, completely prevents the user from controlling the camera during the animation,
 * otherwise just disables rotating.
 * @param duration how long to take in milliseconds.
 */
export function smoothlyMoveCamera(cameraStartPos, targetStartPos, cameraEndPos, targetEndPos, updateControls,
                                   duration = 1000, disableControls = false) {
  if (!cameraStartPos) throw `Bad cameraStartPos: ${cameraStartPos}`;
  if (!targetStartPos) throw `Bad targetStartPos: ${targetStartPos}`;
  if (!cameraEndPos) throw `Bad cameraEndPos: ${cameraEndPos}`;
  if (!targetEndPos) throw `Bad targetEndPos: ${targetEndPos}`;

  // If an animation is already playing, delay this one and return
  if (animating) {
    setTimeout(() => {
      smoothlyMoveCamera(cameraStartPos, targetStartPos, cameraEndPos, targetEndPos, updateControls, duration);
    }, 100);
    return;
  }
  animating = true;
  if (disableControls) allowUserToControlCamera(false)
  controls.enableRotate = false;
  const startTime = performance.now();

  function animate() {
    // Get expected progress and updated position of the follow target
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOut(progress);

    // Updates camera and controls; change target control to look at planet, change camera position to zoom in
    camera.position.lerpVectors(cameraStartPos, cameraEndPos, easeProgress);
    controls.target.lerpVectors(targetStartPos, targetEndPos, easeProgress);

    camera.updateProjectionMatrix();
    if (updateControls) {
      camera.up.lerp(new THREE.Vector3(0, 1, 0), easeProgress);
      controls.update();
    }

    // Loop via recursion, updating the frame
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
    // When the animation ends
    else {
      animating = false;
      controls.update();
      if (disableControls) allowUserToControlCamera(true) // Re-enable
      controls.enableRotate = true;
    }
  }

  animate();
}

/**
 * Gets a position in the direction the camera is looking.
 * @return {*}
 */
function getCameraDirectionAsPos(distance = 100) {
  return camera.getWorldDirection(new THREE.Vector3())
    .normalize()
    .multiplyScalar(distance)
    .add(camera.position);
}

/**
 * Copied from https://stackoverflow.com/questions/30007853/simple-easing-function-in-javascript
 * @param t progress, from 0 to 1 inclusive.
 * @return {number} a different value from 0 to 1 inclusive that follows the pattern of easing in and out.
 */
function easeInOut(t) {
  return t > 0.5 ? 4*Math.pow((t-1),3)+1 : 4*Math.pow(t,3);
}

/**
 * Smoothly unfocuses to look at the quasar.
 */
function smoothlyUnfocus() {
  const centreToCamera = camera.position.clone();
  centreToCamera.multiplyScalar(1.5);

  smoothlyMoveCamera(camera.position.clone(), controls.target.clone(), centreToCamera, origin, true);
}


const overviewPosition = new THREE.Vector3(0, 20, 60)
const origin = new THREE.Vector3(0.01, 0.01, 0.01)
// NOTE: Pinching or panning when the target is 0, 0, 0 breaks things (replaced with NaN values eventually, potential div by 0)
/**
 * Moves the camera from the current position to a defined overview position.
 */
export function moveToOverviewPos() {
  if (setNavStateFunction.setDefault) setNavStateFunction.setDefault();
  const camPos = camera.position.clone();
  const target = getCameraDirectionAsPos();

  controls.enablePan = false;
  controls.enableZoom = false;

  smoothlyMoveCamera(camPos, target, overviewPosition, origin, true, 2000, true);

  setTimeout(() => {
    controls.enablePan = true;
    controls.enableZoom = true;
  }, 1000);
}

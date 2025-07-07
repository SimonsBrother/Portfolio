import * as THREE from "three";
import { outlinePass } from "./app";
import {dimParticles, undimParticles} from "./blackhole";

// For ease of access, rather than having params for them in every function
let camera = null;
let controls = null;
export function setupFocus(camera_, controls_) {
  camera = camera_;
  controls = controls_;
}

// The object that the camera will attempt to follow.
export let followTarget = null; // TODO make it so only planets can be followed

let targetPos = null; // The global position of the target object
let targetFov = -1; // The target FOV of the camera
export let targetMaxSize = 0; // The largest size the bounding box of the target has been; important for rotating objects

const fovMargin = 3; // The margin of the field of view during focussing
const unfocussedFov = 75;


export function isTargetInvalid(object) {
  /**
   * Returns true if the object selected should be focussed on
   */
  return (!object.parent || // If there is no parent, or
    (!object.parent.userData.isSelectable || // (a parent therefore exists) the parent is not selectable, or
      (followTarget && object.parent.uuid === followTarget.uuid))) // if there is currently a followed target and that target is the same as the new target
  // Then the target is invalid
}

export function setFollowTarget(object) {
  dimParticles();
  followTarget = object.parent;
  controls.enablePan = false;
  controls.enableZoom = false;
  targetMaxSize = -1;

  outlinePass.selectedObjects = [object.parent];
  smoothFocusOnObject();
  showRing();
}


export function stopFollowing() {
  followTarget = null;
  controls.enablePan = true;
  controls.enableZoom = true;

  outlinePass.selectedObjects = [];
  smoothlyUnfocus();
  undimParticles();
  hideRing();
}


// Calculates the intended control target position and FOV
export function calculateTargetValues() {
  if (followTarget === null) {
    return;
  }
  // Update target's position
  if (targetPos === null) {
    targetPos = new THREE.Vector3();
  }
  followTarget.getWorldPosition(targetPos);

  // Get bounding box, which gets centre and size of object (zoom out more if object is bigger)
  const box = new THREE.Box3().setFromObject(followTarget);
  const size = box.getSize(new THREE.Vector3());

  // Calculate appropriate distance (zoom out more if object is bigger)
  const maxDimension = Math.max(size.x, size.y, size.z);
  // Keep track of the max size; this is because the size of the box changes shape with rotation, causing the fov to change rapidly.
  if (maxDimension > targetMaxSize) targetMaxSize = maxDimension;
  const distance = camera.position.distanceTo(targetPos);

  targetFov = 2 * Math.atan((targetMaxSize * fovMargin) / (2 * distance)) * (180 / Math.PI); // Formula by Claude

  // This updates the changes to the camera made in updateFocusTarget; this must be done here else it will jump instead of lerp
  controls.update();
  camera.updateProjectionMatrix();
}


// Updates the target of the control, as well as the camera.
export function updateFocusTarget() {
  if (targetPos === null || followTarget === null) {
    return;
  }
  controls.target.copy(targetPos); // Must not be updated or else the camera snaps
  camera.fov = targetFov;
}


// Linear interpolation function for smoothly changing FOV
function lerp(start, end, t) {
  return start + (end - start) * t;
}


// Smoothly focuses on an object, by changing the FOV and control target
export function smoothFocusOnObject(duration = 1000) {
  const worldPosition = new THREE.Vector3();
  followTarget.getWorldPosition(worldPosition);

  const startTarget = controls.target.clone();
  let endTarget = worldPosition.clone();
  const startFov = camera.fov;

  const startTime = performance.now();

  function animate() {
    if (followTarget === null) {
      return;
    }
    const worldPosition = new THREE.Vector3();
    followTarget.getWorldPosition(worldPosition);
    endTarget = worldPosition;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing function
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    controls.target.lerpVectors(startTarget, endTarget, easeProgress);
    camera.fov = lerp(startFov, targetFov, easeProgress);
    camera.updateProjectionMatrix();

    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}


// Smoothly unfocuses by changing the FOV
function smoothlyUnfocus(duration = 1000) {
  const startFov = camera.fov;

  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing function
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    camera.fov = lerp(startFov, unfocussedFov, easeProgress);
    camera.updateProjectionMatrix();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}


const htmlFocusRing = document.getElementById("focus-circle"); // todo wait until load
function showRing() {
  htmlFocusRing.style.animationName = "fade-in"
  htmlFocusRing.style.opacity = "1";
}

function hideRing() {
  htmlFocusRing.style.animationName = "fade-out"
  htmlFocusRing.style.opacity = "0";
}

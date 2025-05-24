import * as THREE from "three";

// For ease of access, rather than having params for them in every function
let camera = null;
let controls = null;
export function setupFocus(camera_, controls_) {
  camera = camera_;
  controls = controls_;
}


// The object that the camera will attempt to follow.
let followTarget = null; // TODO make it so only planets can be followed

let targetPos = null; // The global position of the target object
let targetFov = -1; // The target FOV of the camera


export function setFollowTarget(object) {
  followTarget = object;
  controls.enablePan = false;
  controls.enableZoom = false;

  smoothFocusOnObject();
}


export function stopFollowing() {
  followTarget = null;
  controls.enablePan = true;
  controls.enableZoom = true;

  smoothlyUnfocus();
}


// Calculates the intended control target position and FOV
export function calculateTargetValues() {
  if (followTarget === null) {
    return;
  }

  // Get bounding box, which gets centre and size of object (zoom out more if object is bigger)
  const box = new THREE.Box3().setFromObject(followTarget);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Calculate appropriate distance (zoom out more if object is bigger)
  const maxDimension = Math.max(size.x, size.y, size.z);
  //const distance = maxDimension * distanceMultiplier; // Adjust multiplier as needed
  const distance = camera.position.distanceTo(center);
  const margin = 5;

  targetPos = center;
  targetFov = 2 * Math.atan((maxDimension * margin) / (2 * distance)) * (180 / Math.PI);

  controls.update(); // This updates the target update in updateFocusTarget
}


// Updates the target of the control, as well as the camera.
export function updateFocusTarget() {
  if (targetPos === null || followTarget === null) {
    return;
  }
  controls.target.copy(targetPos); // Must not be updated or else the camera locks on instead. Not sure why.
  camera.updateProjectionMatrix();
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

    camera.fov = lerp(startFov, 75, easeProgress);
    camera.updateProjectionMatrix();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

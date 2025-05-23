import * as THREE from "three";


// TODO make it so only planets can be followed
let followTarget = null;
const defaultMultiplier = 5
let distanceMultiplier = defaultMultiplier; // distance from the object when focussing
const distMultLimits = {min: 4, max: 8};

let focusStartTime = null;
let preFocusPos = null;
let atTarget = false;
let targetPos = null;
let intendedCameraPosition = null;

function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function setFollowTarget(object, controls, camera) {
  followTarget = object;
  controls.enablePan = false;
  focusStartTime = performance.now();
  preFocusPos = camera.position;
  atTarget = false;
}

export function stopFollowing(controls) {
  followTarget = null;
  controls.enablePan = true;
}

export function changeZoom(event) {
  // deltaY is negative when zooming in
  if (event.deltaY < 0 && distanceMultiplier >= distMultLimits.min) {
    distanceMultiplier -= 1
  }
  else if (event.deltaY > 0 && distanceMultiplier <= distMultLimits.max) {
    distanceMultiplier += 1
  }
}

export function calculateCenterAndCamPos(controls, camera) {
  if (followTarget === null) {
    return;
  }

  // Get bounding box, which gets centre and size of object (zoom out more if object is bigger)
  const box = new THREE.Box3().setFromObject(followTarget);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Calculate appropriate distance (zoom out more if object is bigger)
  const maxDimension = Math.max(size.x, size.y, size.z);
  const distance = maxDimension * distanceMultiplier; // Adjust multiplier as needed

  // Get target position
  const direction = camera.position.clone().sub(center).normalize();
  intendedCameraPosition = center.clone().add(direction.multiplyScalar(distance));
  targetPos = center;

  //controls.target.copy(center);
  //camera.position.copy(intend)
  console.log(intendedCameraPosition);

  controls.update();
}


export function updateFocusTarget(controls, camera) {
  if (targetPos === null || intendedCameraPosition === null) {
    return;
  }
  controls.target.copy(targetPos);
  if (atTarget) {
    //camera.fov = 20;
    camera.updateProjectionMatrix();
    camera.position.copy(intendedCameraPosition);
  }
}


export function smoothFocusOnObject(object, controls, camera, duration = 1000) {
  const worldPosition = new THREE.Vector3();
  object.getWorldPosition(worldPosition);

  const startTarget = controls.target.clone();
  const cameraStartPos = camera.position.clone();
  let endTarget = worldPosition.clone();

  const startTime = performance.now();

  function animate() {
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);
    endTarget = worldPosition;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing function
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    controls.target.lerpVectors(startTarget, endTarget, easeProgress);
    if (intendedCameraPosition) {
      //camera.position.lerpVectors(cameraStartPos, intendedCameraPosition, easeProgress);
    }
    distanceMultiplier = lerp(distanceMultiplier, defaultMultiplier, easeProgress);

    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
    else {
      atTarget = true;
    }
  }

  animate();
}

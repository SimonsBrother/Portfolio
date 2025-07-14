import * as THREE from "three";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer";
import {RenderPass} from "three/addons/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass";
import {SMAAPass} from "three/addons/postprocessing/SMAAPass";

// Expose outline pass for focus
export let outlinePass = null;
let composer = null;
let bloomPass = null;
/**
 * Adds post-processing to the camera and scene.
 * @param scene
 * @param camera
 * @param renderer
 * @return {EffectComposer} the composer, so that it can be updated in the main animation loop.
 */
export function addPostProcessing(scene, camera, renderer) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Bloom
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    .1,
    0.1,
    0.5
  );
  composer.addPass(bloomPass);

  // Outline for selected objects
  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  outlinePass.edgeStrength = 3;
  outlinePass.edgeGlow = 1;
  outlinePass.edgeThickness = 2;
  outlinePass.visibleEdgeColor = new THREE.Color(0xffffff);
  outlinePass.hiddenEdgeColor = new THREE.Color(0xffffff);
  composer.addPass(outlinePass);

  // Anti aliasing
  const antialiasing = new SMAAPass();
  composer.addPass(antialiasing);

  return composer;
}

window.addEventListener( 'resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  composer.setSize( width, height );
  bloomPass.resolution = new THREE.Vector2(width, height);
  outlinePass.resolution = new THREE.Vector2(width, height);
})

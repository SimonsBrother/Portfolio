import * as THREE from "three";
import * as QUARKS from "three.quarks";
import {CircleEmitter, ConstantValue, EmitterMode, Gradient, RenderMode} from "three.quarks";
import {Vector3} from "three";


export async function setupParticles(scene) {
  const texture = await new THREE.TextureLoader().loadAsync("/img/img.png");

  console.log(texture);
  // Create a particle system
  const particleSystem = new QUARKS.ParticleSystem({
    looping: true,
    duration: 10,
    emissionOverTime: new ConstantValue(50),
    emissionOverDistance: new ConstantValue(1),

    shape: new CircleEmitter({
      radius: 8,
      arc: Math.PI * 2, // 360 deg
      thickness: 1,
      mode: EmitterMode.Random,
      spread: 5,
      speed: new ConstantValue(0),
    }),

    // Initial particle properties
    startLife: new ConstantValue(2),
    startSize: new ConstantValue(1),
    startSpeed: new ConstantValue(0),
    /*startColor: new QUARKS.RandomColorBetweenGradient(
      new Gradient(
        [
          [new Vector3(0.125, 0.371, 0.178), 0],
          [new Vector3(0.047, 0.000, 0.522), 1],
        ],
        [
          [1, 0], // Alpha 1 at position 0
          [1, 1], // Alpha 1 at position 1
        ],
      ),
      new Gradient(
        [
          [new Vector3(0.125, 0.357, 0.133), 0],
          [new Vector3(0.216, 0.992, 0.871), 1],
        ],
        [
          [1, 0], // Alpha 1 at position 0
          [1, 1], // Alpha 1 at position 1
        ],
      )
    ),*/


    renderMode: RenderMode.Trail,
    //startLength: new ConstantValue(70),
    worldSpace: true,

    // Material for particles
    material: new THREE.MeshBasicMaterial({
      map: texture,
      color: 0x09C405,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    }),
    blendTiles: true,

    // Behaviors controlling particle evolution over time
    behaviors: [
      new QUARKS.OrbitOverLife(new ConstantValue(1), new Vector3(0, 35, 0)),
      new QUARKS.ColorOverLife(
        new Gradient(
          [
            [new Vector3(0.0, 0.0, 1), 0],
            [new Vector3(0.1, 0.5, 0.0), 0.2],
            [new Vector3(0.2, 0.7, 0.0), 0.7],
            [new Vector3(1, 0.5, 0.5), 1],
          ],
          [
            [0.4, 0],
            [0.6, 0.2],
            [0.8, 0.7],
            [0, 1],
          ],
        ),
      ),

    ],
  });

  particleSystem.rendererEmitterSettings.startLength = new ConstantValue(190);

  // Create a batched renderer for efficient particle rendering
  const batchedRenderer = new QUARKS.BatchedRenderer();

  // Add the particle system to the batched renderer
  batchedRenderer.addSystem(particleSystem);

  // Add the particle system to the scene
  scene.add(batchedRenderer);
  scene.add(particleSystem.emitter);

  return batchedRenderer;
}

/*
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update the batched renderer
  batchedRenderer.update(0.016); // Pass delta time in seconds

  renderer.render(scene, camera);
}
animate();*/

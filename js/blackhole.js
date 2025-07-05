import * as THREE from "three";
import * as QUARKS from "three.quarks";
import {
  ColorRange,
  ConstantValue,
  DonutEmitter,
  EmitterMode,
  Gradient,
  GridEmitter, IntervalValue,
  RenderMode
} from "three.quarks";
import {Vector3, Vector4} from "three";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass";
import {camera} from "./app";

const accretionTexture = await new THREE.TextureLoader().loadAsync("/img/img.png");
const particleSystems = []

const defaultSettings = {
  looping: true,
  duration: 4,
  emissionOverTime: new ConstantValue(10),
  emissionOverDistance: new ConstantValue(0),
  prewarm: true,

  shape: new DonutEmitter({
    radius: 20,
    arc: Math.PI * 0.1, // 360 deg
    thickness: 2,
    donutRadius: 3,
    mode: EmitterMode.Random,
    spread: 0,
    speed: new ConstantValue(1),
  }),

  // Initial particle properties
  startLife: new ConstantValue(5),
  startSize: new ConstantValue(2),
  startSpeed: new ConstantValue(0),

  renderMode: RenderMode.Trail,
  //startLength: new ConstantValue(70),
  worldSpace: true,

  // Material for particles
  material: new THREE.MeshBasicMaterial({
    map: accretionTexture,
    color: 0x09C405,
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
  }),
  blendTiles: true,

  // Behaviors controlling particle evolution over time
  behaviors: [
    new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 2, 0)),
  ],
};
const accretionDiskBaseY = 0;

function makeSystem(overwrittenSettings, length, batchedRenderer, scene, y=0) {
  const particleSystem = new QUARKS.ParticleSystem({
    ...defaultSettings,
    ...overwrittenSettings,
  });
  particleSystem.rendererEmitterSettings.startLength = new ConstantValue(50);
  particleSystems.push(particleSystem);

  // Add the particle system to the batched renderer
  batchedRenderer.addSystem(particleSystem);

  // Add the particle system to the scene
  const emitter = particleSystem.emitter;
  emitter.position.y = y + accretionDiskBaseY
  scene.add(emitter);
  return emitter;
}


export async function setupAccretionDisk(scene) {
  const batchedRenderer = new QUARKS.BatchedRenderer();

  // Accretion disk
  // 1
  makeSystem({
    shape: new DonutEmitter({
      radius: 50,
      arc: Math.PI * 0.005,
      thickness: 1,
      donutRadius: 10,
      mode: EmitterMode.Random,
      spread: 0,
      speed: new ConstantValue(1),
    }),

    emissionOverTime: new ConstantValue(10),
    // startColor: new QUARKS.ConstantColor(new Vector4(0.13, 0.1, 0.1, 1)),
    // startColor: new QUARKS.ConstantColor(new Vector4(0.0, 0.0, 0.0, 1)),
    // startSize: new ConstantValue(1),

    behaviors: [
      new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 1.5, 0)),
      new QUARKS.ColorOverLife(
        new ColorRange(
          // new Vector4(0.15, 0.05, 0.05, 1),
          new Vector4(0.1, 0.1, 0.1, 1),
          new Vector4(0.5, 0.5, 0.5, 1)
        )
      ),
    ],
  }, 50, batchedRenderer, scene, -0.5);

  // 2
  makeSystem({
      shape: new DonutEmitter({
        radius: 40,
        arc: Math.PI * 0.008, // Decrease factor to make narrower from side
        thickness: 1,
        donutRadius: 10, // Decrease to make narrower from top
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      emissionOverTime: new ConstantValue(6),
      startColor: new QUARKS.ConstantColor(new Vector4(0.2, 0.2, 0.2, 1)),
      startSize: new ConstantValue(2),

    },
    50, batchedRenderer, scene,-0.8
  );

  // 3
  makeSystem({
      shape: new DonutEmitter({
        radius: 35,
        arc: Math.PI * 0.01,
        thickness: 1,
        donutRadius: 5,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      emissionOverTime: new ConstantValue(4),
      startColor: new QUARKS.ConstantColor(new Vector4(0.3, 0.33, 0.40, 1)),
      startSize: new ConstantValue(2),

      behaviors: [
        new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 1.5, 0)),
        new QUARKS.ColorOverLife(
          new ColorRange(
            // new Vector4(0.15, 0.05, 0.05, 1),
            new Vector4(0.2, 0.3, 0.2, 1),
            new Vector4(0.3, 0.2, 0.2, 1)
          )
        ),
      ],
    },
    50, batchedRenderer, scene, -1
  );

  // 4
  makeSystem({
      shape: new DonutEmitter({
        radius: 29,
        arc: Math.PI * 0.013,
        thickness: 1,
        donutRadius: 10,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      emissionOverTime: new ConstantValue(10),
      startColor: new QUARKS.ConstantColor(new Vector4(0.4, 0.8, 0.6, 1)),
      startSize: new ConstantValue(3),

      behaviors: [
        new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 1.5, 0)),
        new QUARKS.ColorOverLife(
          new ColorRange(
            // new Vector4(0.15, 0.05, 0.05, 1),
            new Vector4(0.2, 0.3, 0.2, 1),
            new Vector4(0.4, 0.5, 0.2, 1)
          )
        ),
      ],
    },
    50, batchedRenderer, scene, -.6
  );

  // 5
  makeSystem({
      shape: new DonutEmitter({
        radius: 17,
        arc: Math.PI * 0.015,
        thickness: 1,
        donutRadius: 10,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      emissionOverTime: new ConstantValue(10),
      startColor: new QUARKS.ConstantColor(new Vector4(0.4, 1, 0.3, 1)),
      startSize: new ConstantValue(2),

      behaviors: [
        new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 1.5, 0)),
        new QUARKS.ColorOverLife(
          new ColorRange(
            // new Vector4(0.15, 0.05, 0.05, 1),
            new Vector4(0.4, 0.8, 0.55, 1),
            new Vector4(0.4, 0.7, 0.35, 1)
          )
        ),
      ],
    },
    50, batchedRenderer, scene, -0.4
  );

  // 6
  makeSystem({
      shape: new DonutEmitter({
        radius: 7,
        arc: Math.PI * 0.02,
        thickness: 1,
        donutRadius: 7,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      emissionOverTime: new ConstantValue(15),
      startColor: new QUARKS.ConstantColor(new Vector4(0.4, 1, 0.3, 1)),

      behaviors: [
        new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 2, 0)),
        new QUARKS.ColorOverLife(
          new ColorRange(
            // new Vector4(0.15, 0.05, 0.05, 1),
            new Vector4(0.9, 0.8, 0.1, 1),
            new Vector4(0.9, 0.8, 0.2, 1)
          )
        ),
      ],
    },
    50, batchedRenderer, scene
  );

  // Jets
  const jetConfig = {
    shape: new GridEmitter({
      speed: new ConstantValue(1),
    }),
    emissionOverTime: new ConstantValue(15),
    startColor: new QUARKS.ConstantColor(new Vector4(0.4, 1, 0.3, 1)),
    startSpeed: new ConstantValue(100),
    startLife: new ConstantValue(0.8),

    behaviors: [
      new QUARKS.OrbitOverLife(new IntervalValue(-0.2, 0.2), new Vector3(1, 1, 1)),
      new QUARKS.ColorOverLife(
        new Gradient(
          [
            [new Vector3(0, 1, 0), 0],
            [new Vector3(0.5, 0.2, 1), 0.5],
          ],
          [
            [1, 0], // Alpha 1 at position 0
            [1, 0.5], // Alpha 1 at position 1
          ],
        ),
      ),
    ],
  };
  const topJet = makeSystem(jetConfig, 100, batchedRenderer, scene);
  topJet.rotation.set(-1.5708, 0, 0);
  const bottomJet = makeSystem(jetConfig, 100, batchedRenderer, scene);
  bottomJet.rotation.set(1.5708, 0, 0);

  await setupTextDebris(scene, batchedRenderer)
  scene.add(batchedRenderer);
  return batchedRenderer;
}


export async function setupTextDebris(scene, batchedRenderer) {
  const zeroMaterial = new THREE.MeshBasicMaterial({
    map: await new THREE.TextureLoader().loadAsync("/img/zero.png"),
    color: 0x09C405,
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
  });
  const oneMaterial = new THREE.MeshBasicMaterial({
    map: await new THREE.TextureLoader().loadAsync("/img/one.png"),
    color: 0x09C405,
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
  });

  const baseConfig = {
    shape: new DonutEmitter({
      radius: 50,
      arc: Math.PI * 0.005,
      thickness: 1,
      donutRadius: 10,
      mode: EmitterMode.Random,
      spread: 0,
      speed: new ConstantValue(1),
    }),

    emissionOverTime: new ConstantValue(5),
    renderMode: RenderMode.BillBoard,

    startColor: new QUARKS.ConstantColor(new Vector4(0.3, 0.3, 0.3, 1)),
    // startSize: new ConstantValue(1),

    behaviors: [
      new QUARKS.OrbitOverLife(new ConstantValue(5), new Vector3(0, 1, 0)),
    ],
  }

  const configurations = [
    {
      shape: new DonutEmitter({
        radius: 50,
        arc: Math.PI * 0.005,
        thickness: 1,
        donutRadius: 10,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      startColor: new QUARKS.ConstantColor(new Vector4(0.3, 0.3, 0.3, 1)),
    },
    {
      shape: new DonutEmitter({
        radius: 30,
        arc: Math.PI * 0.005,
        thickness: 1,
        donutRadius: 10,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      startColor: new QUARKS.ConstantColor(new Vector4(0.5, 0.7, 0.5, 1)),
    },
    {
      shape: new DonutEmitter({
        radius: 10,
        arc: Math.PI * 0.005,
        thickness: 1,
        donutRadius: 10,
        mode: EmitterMode.Random,
        spread: 0,
        speed: new ConstantValue(1),
      }),
      startColor: new QUARKS.ConstantColor(new Vector4(0.3, 1, 0.5, 1)),
    }
  ]

  for (const configuration of configurations) {
    makeSystem({...baseConfig, ...configuration, material: zeroMaterial}, 0, batchedRenderer, scene);
    makeSystem({...baseConfig, ...configuration, material: oneMaterial}, 0, batchedRenderer, scene);
  }
}


export function addBlackHole(scene, composer) {
  const geometry = new THREE.SphereGeometry( 5, 32, 16 );
  const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
  const sphere = new THREE.Mesh( geometry, material );
  scene.add(sphere);

  const blackHoleOutline = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
  blackHoleOutline.edgeStrength = 5;
  blackHoleOutline.edgeGlow = 3;
  blackHoleOutline.edgeThickness = 5;
  blackHoleOutline.visibleEdgeColor = new THREE.Color( 0xeeff11 );
  blackHoleOutline.selectedObjects = [sphere];
  composer.addPass(blackHoleOutline);
}


export function dimParticles() {
  for (const system of particleSystems) {
    system.startColor.color.w = 0.1;
  }
}

export function undimParticles() {
  for (const system of particleSystems) {
    system.startColor.color.w = 1;
  }
}

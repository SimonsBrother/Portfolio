import * as THREE from "three";
import {targetMaxSize, followTarget} from "./focus";

export class FocusCircle {
  constructor(scene, camera) {
    this.scene = scene;
    this.mesh = null;
    this.camera = camera;
  }

  makeRing(ringWidth = 0.1) {
    return
    this.destroyRing();
    const focusSize = 2.5 * targetMaxSize
    const geometry = new THREE.RingGeometry(focusSize, focusSize + ringWidth, 50 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    this.mesh = new THREE.Mesh( geometry, material );

    this.scene.add(this.mesh);
  }

  update() {
    if (this.mesh && followTarget) {
      this.mesh.position.set(followTarget.position.x, 5, followTarget.position.z);
      this.mesh.lookAt(this.camera.position);
    }
  }

  destroyRing() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}

import * as THREE from 'three';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

export class DHFStreamManager {
  constructor(scene, stack) {
    this.scene = scene;
    this.stack = stack;
    this.isTransferring = false;
    
    this.initStreamParticles();
  }

  initStreamParticles() {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      scale[i] = Math.random() * 0.08 + 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.06,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    this.streamMesh = new THREE.Points(geo, mat);
    this.scene.add(this.streamMesh);
  }

  triggerTransfer(type = 'download', onProgress, onComplete) {
    if (this.isTransferring) return;
    this.isTransferring = true;

    // Pulse material emission
    const coreMat = this.stack.materials.coreBiolum;
    const threadMat = this.stack.materials.neuralThread;

    gsap.to(this.streamMesh.material, { opacity: 0.9, duration: 0.4 });

    let progressObj = { value: 0 };
    
    gsap.to(progressObj, {
      value: 100,
      duration: 3.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = Math.floor(progressObj.value);
        if (onProgress) onProgress(p);

        // Rapid glowing pulse during transfer
        const pulse = Math.sin(Date.now() * 0.02) * 2 + 3;
        coreMat.emissiveIntensity = pulse;
        threadMat.emissiveIntensity = pulse * 1.5;

        // Swirl stream particles towards or away from stack center
        const positions = this.streamMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          if (type === 'download') {
            positions[i + 1] -= 0.15;
            if (positions[i + 1] < -4) positions[i + 1] = 4;
          } else {
            positions[i + 1] += 0.15;
            if (positions[i + 1] > 4) positions[i + 1] = -4;
          }
        }
        this.streamMesh.geometry.attributes.position.needsUpdate = true;
      },
      onComplete: () => {
        gsap.to(this.streamMesh.material, { opacity: 0.0, duration: 0.5 });
        gsap.to(coreMat, { emissiveIntensity: 2.5, duration: 0.5 });
        gsap.to(threadMat, { emissiveIntensity: 3.0, duration: 0.5 });
        this.isTransferring = false;
        
        // Confetti burst on successful needle cast / sync!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#7000ff', '#ffffff', '#00ff88']
        });

        if (onComplete) onComplete();
      }
    });
  }
}

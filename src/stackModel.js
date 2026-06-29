import * as THREE from 'three';
import { gsap } from 'gsap';

export class CorticalStack {
  constructor(scene) {
    this.scene = scene;
    this.mainGroup = new THREE.Group();
    
    // Sub-groups for exploded view animation
    this.casingGroup = new THREE.Group();
    this.glassGroup = new THREE.Group();
    this.coreGroup = new THREE.Group();
    this.needleGroup = new THREE.Group();
    this.holoGroup = new THREE.Group();
    
    this.mainGroup.add(this.casingGroup);
    this.mainGroup.add(this.glassGroup);
    this.mainGroup.add(this.coreGroup);
    this.mainGroup.add(this.needleGroup);
    this.mainGroup.add(this.holoGroup);
    
    this.scene.add(this.mainGroup);

    this.isExploded = false;
    this.theme = 'envoy'; // envoy (cyan), meth (gold), psychasec (violet), alert (red)
    
    // Materials storage for dynamic theme color updates
    this.materials = {};
    
    this.initMaterials();
    this.buildStack();
    this.buildNeuralParticles();
    this.buildHoloRings();
  }

  initMaterials() {
    // Cyberpunk envoy palette defaults
    const primaryGlow = 0x00f0ff;
    const secondaryGlow = 0x7000ff;

    this.materials.metallicCasing = new THREE.MeshStandardMaterial({
      color: 0x1a1d24,
      metalness: 0.9,
      roughness: 0.25,
      envMapIntensity: 1.5
    });

    this.materials.darkAlloy = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      metalness: 0.95,
      roughness: 0.15
    });

    this.materials.chromeDetails = new THREE.MeshStandardMaterial({
      color: 0xe0e6ed,
      metalness: 1.0,
      roughness: 0.05
    });

    this.materials.glassCapsule = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.5,
      specularIntensity: 1.0
    });

    this.materials.coreBiolum = new THREE.MeshStandardMaterial({
      color: primaryGlow,
      emissive: primaryGlow,
      emissiveIntensity: 2.5,
      roughness: 0.2,
      metalness: 0.5
    });

    this.materials.neuralThread = new THREE.MeshStandardMaterial({
      color: 0x00e1ff,
      emissive: 0x00a2ff,
      emissiveIntensity: 3.0,
      roughness: 0.1
    });

    this.materials.needleMetal = new THREE.MeshStandardMaterial({
      color: 0xdcdfe5,
      metalness: 0.98,
      roughness: 0.1
    });

    this.materials.needleTipGlow = new THREE.MeshStandardMaterial({
      color: primaryGlow,
      emissive: primaryGlow,
      emissiveIntensity: 4.0
    });

    this.materials.holoRing = new THREE.MeshBasicMaterial({
      color: primaryGlow,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    this.materials.ledStatus = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 2.0
    });
  }

  buildStack() {
    // 1. MAIN CASING SHELL (Segmented titanium sleeve with cutout windows)
    const casingGeo = new THREE.CylinderGeometry(0.9, 0.9, 3.4, 32, 1, true);
    const casingMesh = new THREE.Mesh(casingGeo, this.materials.metallicCasing);
    this.casingGroup.add(casingMesh);

    // Top Cap (Psychasec logo cap)
    const topCapGeo = new THREE.CylinderGeometry(0.92, 0.9, 0.3, 32);
    const topCap = new THREE.Mesh(topCapGeo, this.materials.darkAlloy);
    topCap.position.y = 1.85;
    this.casingGroup.add(topCap);

    // Top Ring detail
    const topRingGeo = new THREE.TorusGeometry(0.91, 0.03, 16, 32);
    const topRing = new THREE.Mesh(topRingGeo, this.materials.chromeDetails);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 1.7;
    this.casingGroup.add(topRing);

    // Bottom Base Collar
    const bottomBaseGeo = new THREE.CylinderGeometry(0.9, 0.82, 0.4, 32);
    const bottomBase = new THREE.Mesh(bottomBaseGeo, this.materials.darkAlloy);
    bottomBase.position.y = -1.8;
    this.casingGroup.add(bottomBase);

    // Side Vents & Latches (4 around the cylinder)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const latchGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12);
      const latch = new THREE.Mesh(latchGeo, this.materials.chromeDetails);
      latch.position.set(Math.cos(angle) * 0.91, 0, Math.sin(angle) * 0.91);
      latch.rotation.y = -angle;
      this.casingGroup.add(latch);

      // Status LED bar on front
      if (i === 0) {
        const ledBarGeo = new THREE.BoxGeometry(0.08, 1.5, 0.04);
        const ledBar = new THREE.Mesh(ledBarGeo, this.materials.ledStatus);
        ledBar.position.set(0.92, 0, 0);
        this.casingGroup.add(ledBar);
      }
    }

    // 2. INNER GLASS CAPSULE
    const glassGeo = new THREE.CylinderGeometry(0.78, 0.78, 3.1, 32);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.glassCapsule);
    this.glassGroup.add(glassMesh);

    // 3. BIOLUMINESCENT DHF CORE & HELIX STORAGE
    const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.9, 24);
    const coreMesh = new THREE.Mesh(coreGeo, this.materials.coreBiolum);
    this.coreGroup.add(coreMesh);

    // Quantum Double Helix Thread Wrap
    const helixPoints1 = [];
    const helixPoints2 = [];
    const turns = 4;
    const height = 2.8;
    const radius = 0.52;
    const count = 150;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;
      helixPoints1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      helixPoints2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }

    const curve1 = new THREE.CatmullRomCurve3(helixPoints1);
    const curve2 = new THREE.CatmullRomCurve3(helixPoints2);

    const helixGeo1 = new THREE.TubeGeometry(curve1, 100, 0.035, 8, false);
    const helixGeo2 = new THREE.TubeGeometry(curve2, 100, 0.035, 8, false);

    const helixMesh1 = new THREE.Mesh(helixGeo1, this.materials.neuralThread);
    const helixMesh2 = new THREE.Mesh(helixGeo2, this.materials.neuralThread);

    this.coreGroup.add(helixMesh1);
    this.coreGroup.add(helixMesh2);

    // 4. SPINAL INTERFACE NEEDLES (4 Tapered Prongs at bottom)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const needleHolder = new THREE.Group();
      
      const needleShaftGeo = new THREE.ConeGeometry(0.06, 0.8, 16);
      const needleShaft = new THREE.Mesh(needleShaftGeo, this.materials.needleMetal);
      needleShaft.rotation.x = Math.PI; // Point downwards
      needleShaft.position.y = -0.4;
      needleHolder.add(needleShaft);

      const needleTipGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const needleTip = new THREE.Mesh(needleTipGeo, this.materials.needleTipGlow);
      needleTip.position.y = -0.8;
      needleHolder.add(needleTip);

      needleHolder.position.set(Math.cos(angle) * 0.5, -2.0, Math.sin(angle) * 0.5);
      this.needleGroup.add(needleHolder);
    }
  }

  buildNeuralParticles() {
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x7000ff);

    for (let i = 0; i < particleCount; i++) {
      const r = 0.2 + Math.random() * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.8;

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.neuralParticles = new THREE.Points(geometry, particleMaterial);
    this.coreGroup.add(this.neuralParticles);
  }

  buildHoloRings() {
    const ringGeos = [
      new THREE.RingGeometry(1.2, 1.25, 32),
      new THREE.RingGeometry(1.4, 1.43, 4),
      new THREE.RingGeometry(1.6, 1.62, 24)
    ];

    this.holoRingsMesh = [];
    ringGeos.forEach((geo, idx) => {
      const ring = new THREE.Mesh(geo, this.materials.holoRing);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (idx - 1) * 1.2;
      this.holoGroup.add(ring);
      this.holoRingsMesh.push(ring);
    });
  }

  toggleExplodedView() {
    this.isExploded = !this.isExploded;
    const duration = 1.2;
    const ease = 'power3.inOut';

    if (this.isExploded) {
      gsap.to(this.casingGroup.position, { y: 1.8, duration, ease });
      gsap.to(this.glassGroup.position, { y: 0.6, duration, ease });
      gsap.to(this.coreGroup.position, { y: -0.6, duration, ease });
      gsap.to(this.needleGroup.position, { y: -1.8, duration, ease });
      gsap.to(this.holoGroup.scale, { x: 1.4, y: 1.4, z: 1.4, duration, ease });
    } else {
      gsap.to(this.casingGroup.position, { y: 0, duration, ease });
      gsap.to(this.glassGroup.position, { y: 0, duration, ease });
      gsap.to(this.coreGroup.position, { y: 0, duration, ease });
      gsap.to(this.needleGroup.position, { y: 0, duration, ease });
      gsap.to(this.holoGroup.scale, { x: 1, y: 1, z: 1, duration, ease });
    }
    return this.isExploded;
  }

  setTheme(themeName) {
    this.theme = themeName;
    let primaryHex = 0x00f0ff;
    let secondaryHex = 0x7000ff;
    let ledHex = 0x00ff88;

    switch (themeName) {
      case 'meth': // Gold / Luxury Bancroft
        primaryHex = 0xffb700;
        secondaryHex = 0xff4500;
        ledHex = 0xffd700;
        break;
      case 'psychasec': // Platinum Violet Clean
        primaryHex = 0xb026ff;
        secondaryHex = 0x00dfff;
        ledHex = 0xe066ff;
        break;
      case 'alert': // Crimson Red Emergency
        primaryHex = 0xff0033;
        secondaryHex = 0xff6600;
        ledHex = 0xff0000;
        break;
      case 'envoy': // Standard Cyan Envoy
      default:
        primaryHex = 0x00f0ff;
        secondaryHex = 0x7000ff;
        ledHex = 0x00ff88;
        break;
    }

    gsap.to(this.materials.coreBiolum.color, { r: ((primaryHex >> 16) & 255) / 255, g: ((primaryHex >> 8) & 255) / 255, b: (primaryHex & 255) / 255, duration: 0.8 });
    gsap.to(this.materials.coreBiolum.emissive, { r: ((primaryHex >> 16) & 255) / 255, g: ((primaryHex >> 8) & 255) / 255, b: (primaryHex & 255) / 255, duration: 0.8 });
    
    gsap.to(this.materials.neuralThread.color, { r: ((secondaryHex >> 16) & 255) / 255, g: ((secondaryHex >> 8) & 255) / 255, b: (secondaryHex & 255) / 255, duration: 0.8 });
    gsap.to(this.materials.neuralThread.emissive, { r: ((secondaryHex >> 16) & 255) / 255, g: ((secondaryHex >> 8) & 255) / 255, b: (secondaryHex & 255) / 255, duration: 0.8 });

    this.materials.needleTipGlow.color.setHex(primaryHex);
    this.materials.needleTipGlow.emissive.setHex(primaryHex);
    this.materials.holoRing.color.setHex(primaryHex);
    this.materials.ledStatus.color.setHex(ledHex);
    this.materials.ledStatus.emissive.setHex(ledHex);
  }

  update(time) {
    // Continuous smooth rotations
    this.coreGroup.rotation.y = time * 0.4;
    
    if (this.holoRingsMesh) {
      this.holoRingsMesh[0].rotation.z = time * 0.3;
      this.holoRingsMesh[1].rotation.z = -time * 0.5;
      this.holoRingsMesh[2].rotation.z = time * 0.2;
    }

    // Neural particle swirl
    if (this.neuralParticles) {
      this.neuralParticles.rotation.y = -time * 0.6;
    }
  }
}

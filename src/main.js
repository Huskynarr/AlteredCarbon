import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { CorticalStack } from './stackModel.js';
import { DHFStreamManager } from './dhfStream.js';
import { audio } from './audio.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.loader = document.getElementById('loader-overlay');
    this.loaderText = document.getElementById('loader-text');
    
    try {
      this.initThree();
      this.initLighting();
      this.stack = new CorticalStack(this.scene);
      this.streamManager = new DHFStreamManager(this.scene, this.stack);
      
      this.initControls();
      this.initUIEvents();
      
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);

      // Hide loader safely
      this.hideLoader();
    } catch (err) {
      console.error('App Initialization Error:', err);
      if (this.loaderText) {
        this.loaderText.style.color = '#ff0033';
        this.loaderText.innerHTML = `SYSTEM INITIALIZATION ERROR:<br><span style="font-size: 0.8rem; color: #fff;">${err.message || err}</span><br><br><button id="btn-force-enter" style="margin-top:10px; padding:8px 16px; background:#00f0ff; border:none; cursor:pointer; font-weight:bold;">ENTER INTERFACE ANYWAY</button>`;
        const forceBtn = document.getElementById('btn-force-enter');
        if (forceBtn) {
          forceBtn.addEventListener('click', () => this.forceHideLoader());
        }
      }
    }
  }

  hideLoader() {
    if (!this.loader) return;
    setTimeout(() => {
      this.loader.style.opacity = '0';
      this.loader.style.pointerEvents = 'none';
      setTimeout(() => {
        this.loader.style.display = 'none';
      }, 800);
    }, 400);
  }

  forceHideLoader() {
    if (!this.loader) return;
    this.loader.style.opacity = '0';
    this.loader.style.pointerEvents = 'none';
    this.loader.style.display = 'none';
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05070a, 0.08);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(4, 2, 6);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 15;
    this.controls.minDistance = 2.5;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 5);
    this.scene.add(keyLight);

    this.rimLightCyan = new THREE.PointLight(0x00f0ff, 4, 10);
    this.rimLightCyan.position.set(-4, -2, -3);
    this.scene.add(this.rimLightCyan);

    this.rimLightViolet = new THREE.PointLight(0x7000ff, 4, 10);
    this.rimLightViolet.position.set(4, 3, -2);
    this.scene.add(this.rimLightViolet);
  }

  initControls() {
    this.clock = new THREE.Clock();
  }

  initUIEvents() {
    const btnExplode = document.getElementById('btn-explode');
    const txtExplodeState = document.getElementById('txt-explode-state');
    const btnCast = document.getElementById('btn-cast');
    const btnAudio = document.getElementById('btn-audio');
    const txtAudioState = document.getElementById('txt-audio-state');
    const consoleMsg = document.getElementById('console-msg');
    const valNeedles = document.getElementById('val-needles');

    if (btnExplode) {
      btnExplode.addEventListener('click', () => {
        audio.playLock();
        const isExploded = this.stack.toggleExplodedView();
        if (txtExplodeState) txtExplodeState.innerText = isExploded ? '[ON]' : '[OFF]';
        if (valNeedles) valNeedles.innerText = isExploded ? 'DECONNECTED / EXPANDED' : 'INSERTED / LOCKED';
        if (consoleMsg) {
          consoleMsg.innerText = isExploded 
            ? '[SYS_INFO]: Disassembled Stack structure into component array.'
            : '[SYS_INFO]: Stack components locked into operational capsule.';
        }
      });
    }

    if (btnCast) {
      btnCast.addEventListener('click', () => {
        if (this.streamManager.isTransferring) return;
        audio.playDHFTransfer();
        if (consoleMsg) consoleMsg.innerText = '[SYS_WARN]: Initiating high-speed DHF needle cast... Data stream engaged.';
        
        const synapseBar = document.getElementById('bar-synapse');
        const synapseTxt = document.getElementById('txt-synapse-load');
        
        this.streamManager.triggerTransfer(
          'download',
          (progress) => {
            if (consoleMsg) consoleMsg.innerText = `[DHF_CAST]: Synchronizing neural memories... ${progress}%`;
            const load = 42 + Math.floor((progress / 100) * 50);
            if (synapseBar) synapseBar.style.width = `${load}%`;
            if (synapseTxt) synapseTxt.innerText = `${load}%`;
          },
          () => {
            if (consoleMsg) consoleMsg.innerText = '[SYS_SUCCESS]: DHF Memory sync complete. Sleeve identity verified.';
            if (synapseBar) synapseBar.style.width = '42%';
            if (synapseTxt) synapseTxt.innerText = '42%';
          }
        );
      });
    }

    let humActive = false;
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        audio.playClick();
        humActive = !humActive;
        audio.playHumToggle(humActive);
        if (txtAudioState) txtAudioState.innerText = humActive ? '[ACTIVE]' : '[MUTED]';
      });
    }

    const chips = document.querySelectorAll('.theme-chip[data-theme]');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        audio.playClick();
        chips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const theme = e.target.getAttribute('data-theme');
        this.stack.setTheme(theme);

        if (theme === 'meth') {
          this.rimLightCyan.color.setHex(0xffb700);
          this.rimLightViolet.color.setHex(0xff4500);
        } else if (theme === 'psychasec') {
          this.rimLightCyan.color.setHex(0xb026ff);
          this.rimLightViolet.color.setHex(0x00dfff);
        } else if (theme === 'alert') {
          this.rimLightCyan.color.setHex(0xff0033);
          this.rimLightViolet.color.setHex(0xff6600);
        } else {
          this.rimLightCyan.color.setHex(0x00f0ff);
          this.rimLightViolet.color.setHex(0x7000ff);
        }

        if (consoleMsg) consoleMsg.innerText = `[SYS_THEME]: Switched visual interface palette to [${theme.toUpperCase()}].`;
      });
    });

    const camOrbit = document.getElementById('cam-orbit');
    const camCore = document.getElementById('cam-core');
    const camNeedles = document.getElementById('cam-needles');

    if (camOrbit) {
      camOrbit.addEventListener('click', () => {
        audio.playClick();
        gsap.to(this.camera.position, { x: 4, y: 2, z: 6, duration: 1.5, ease: 'power2.inOut' });
        gsap.to(this.controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power2.inOut' });
      });
    }

    if (camCore) {
      camCore.addEventListener('click', () => {
        audio.playClick();
        gsap.to(this.camera.position, { x: 0, y: 0.2, z: 2.8, duration: 1.5, ease: 'power2.inOut' });
        gsap.to(this.controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power2.inOut' });
      });
    }

    if (camNeedles) {
      camNeedles.addEventListener('click', () => {
        audio.playClick();
        gsap.to(this.camera.position, { x: 2, y: -2.5, z: 2, duration: 1.5, ease: 'power2.inOut' });
        gsap.to(this.controls.target, { x: 0, y: -1.8, z: 0, duration: 1.5, ease: 'power2.inOut' });
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const elapsedTime = this.clock.getElapsedTime();

    if (this.stack) this.stack.update(elapsedTime);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Ensure DOM is fully ready before instantiating App
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}

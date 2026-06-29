// Web Audio API Sound Synthesizer for Sci-Fi FX

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playLock() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playDHFTransfer() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 1.2);
    
    // Add vibrato filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 1.3);
  }

  playHumToggle(enable) {
    if (this.muted) return;
    this.init();
    if (enable) {
      if (this.humOsc) return;
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      this.humOsc.type = 'sine';
      this.humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz hum
      this.humGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      this.humOsc.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      this.humOsc.start();
    } else if (this.humOsc) {
      this.humGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if (this.humOsc) {
          this.humOsc.stop();
          this.humOsc.disconnect();
          this.humOsc = null;
        }
      }, 300);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.humOsc) {
      this.playHumToggle(false);
    }
    return this.muted;
  }
}

export const audio = new AudioEngine();

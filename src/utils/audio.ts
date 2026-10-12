// Web Audio API Procedural Holographic Sound Synthesizer (Stark Lab / JARVIS style)

class HolographicAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  // Grab drone oscillator state
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lastProximityBeepTime: number = 0;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // 1. Hover: Subtle high-tech radar chirp
  public playHover(freq = 1100) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, this.ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {}
  }

  // Backward compatibility alias for playHover
  public playSelect() {
    this.playHover(900);
  }

  // Backward compatibility alias for playLockSound
  public playSnap() {
    this.playLockSound();
  }

  // 2. Grab: Continuous harmonic drone hum that modulates with drag speed
  public startGrabDrone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.droneOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneFilter = this.ctx.createBiquadFilter();

      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(110, now);

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(320, now);

      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.linearRampToValueAtTime(0.035, now + 0.08);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc.start(now);
    } catch {}
  }

  public updateGrabDrone(speed: number) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.droneGain) return;
    try {
      const clampedSpeed = Math.min(speed, 5.0);
      const targetFreq = 110 + clampedSpeed * 35; // 110Hz to 285Hz
      const targetFilter = 320 + clampedSpeed * 120;
      const now = this.ctx.currentTime;

      this.droneOsc.frequency.setTargetAtTime(targetFreq, now, 0.04);
      this.droneFilter.frequency.setTargetAtTime(targetFilter, now, 0.04);
      this.droneGain.gain.setTargetAtTime(0.035 + clampedSpeed * 0.015, now, 0.04);
    } catch {}
  }

  public stopGrabDrone() {
    if (!this.ctx || !this.droneOsc || !this.droneGain) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        if (this.droneOsc) {
          try {
            this.droneOsc.stop();
            this.droneOsc.disconnect();
          } catch {}
          this.droneOsc = null;
          this.droneGain = null;
          this.droneFilter = null;
        }
      }, 90);
    } catch {
      this.droneOsc = null;
      this.droneGain = null;
      this.droneFilter = null;
    }
  }

  // 3. Snap Proximity: Intermittent beep whose cadence accelerates as distance approaches 0
  public playSnapProximity(ratio: number) {
    // ratio: 0 (at tolerance edge) to 1 (right on home position)
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    // Cadence: from 400ms down to 80ms interval
    const interval = 400 - ratio * 320;
    if (now - this.lastProximityBeepTime < interval) return;
    this.lastProximityBeepTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 950 + ratio * 450;
      osc.frequency.setValueAtTime(baseFreq, audioNow);

      gain.gain.setValueAtTime(0.04 + ratio * 0.03, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(audioNow);
      osc.stop(audioNow + 0.04);
    } catch {}
  }

  // 4. Lock / Ensamble: Heavy composite metallic thud + high-pitch resonant ping
  public playLockSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Part A: Deep solid mechanical thud
      const oscLow = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      oscLow.type = 'triangle';
      oscLow.frequency.setValueAtTime(140, now);
      oscLow.frequency.exponentialRampToValueAtTime(35, now + 0.16);
      gainLow.gain.setValueAtTime(0.35, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      oscLow.connect(gainLow);
      gainLow.connect(this.ctx.destination);
      oscLow.start(now);
      oscLow.stop(now + 0.16);

      // Part B: High metallic latch ping (1480Hz & 2200Hz harmonic)
      const oscHigh1 = this.ctx.createOscillator();
      const gainHigh1 = this.ctx.createGain();
      oscHigh1.type = 'sine';
      oscHigh1.frequency.setValueAtTime(1480, now + 0.01);
      gainHigh1.gain.setValueAtTime(0.18, now + 0.01);
      gainHigh1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      oscHigh1.connect(gainHigh1);
      gainHigh1.connect(this.ctx.destination);
      oscHigh1.start(now + 0.01);
      oscHigh1.stop(now + 0.32);

      const oscHigh2 = this.ctx.createOscillator();
      const gainHigh2 = this.ctx.createGain();
      oscHigh2.type = 'sine';
      oscHigh2.frequency.setValueAtTime(2217, now + 0.02);
      gainHigh2.gain.setValueAtTime(0.12, now + 0.02);
      gainHigh2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      oscHigh2.connect(gainHigh2);
      gainHigh2.connect(this.ctx.destination);
      oscHigh2.start(now + 0.02);
      oscHigh2.stop(now + 0.25);
    } catch {}
  }

  // Quick UI button click
  public playClick(freq = 880) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {}
  }

  // Whoosh for kinematic explosion
  public playWhoosh(upwards = true) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(upwards ? 120 : 450, now);
      osc.frequency.exponentialRampToValueAtTime(upwards ? 450 : 120, now + 0.25);

      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.25);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Success fanfare when 5/5 parts are fully assembled
  public playFullAssemblyFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6 (Stark chord)
      notes.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch {}
  }

  // Assembly completion chime / fanfare
  public playAssemblyComplete() {
    this.playFullAssemblyFanfare();
  }
}

export const sound = new HolographicAudioEngine();

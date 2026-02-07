/* =========================================================
   Tone Engine (Production)
   - Single AudioContext
   - Compressor (louder perceived volume)
   - Volume control
   - Mute toggle
   - Emergency siren loop
   - Predefined alerts
========================================================= */

export type ToneType = "beep" | "success" | "warning" | "danger" | "accident";

class ToneEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private compressor: DynamicsCompressorNode;

  private sirenOsc?: OscillatorNode;
  private sirenGain?: GainNode;
  private sirenInterval?: number;

  private volume = 1;
  private muted = false;

  constructor() {
    this.ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    /* ---------- master gain ---------- */
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;

    /* ---------- compressor (makes louder) ---------- */
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0;
    this.compressor.release.value = 0.25;

    /* pipeline */
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  /* ======================================================
     MUST call once after first click
  ====================================================== */
  unlock = async () => {
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  };

  /* ======================================================
     GLOBAL CONTROLS
  ====================================================== */

  setVolume = (v: number) => {
    this.volume = Math.min(Math.max(v, 0), 1);
    if (!this.muted) this.masterGain.gain.value = this.volume;
  };

  mute = () => {
    this.muted = true;
    this.masterGain.gain.value = 0;
  };

  unmute = () => {
    this.muted = false;
    this.masterGain.gain.value = this.volume;
  };

  toggleMute = () => {
    this.muted ? this.unmute() : this.mute();
  };

  /* ======================================================
     CORE TONE CREATOR
  ====================================================== */

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.4,
    delay = 0
  ) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const t = this.ctx.currentTime + delay;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /* ======================================================
     ALERT TYPES
  ====================================================== */

  beep = () => {
    this.tone(750, 0.12, "sine", 0.3);
  };

  success = () => {
    this.tone(600, 0.1, "triangle", 0.4);
    this.tone(1000, 0.15, "triangle", 0.4, 0.12);
  };

  warning = () => {
    this.tone(500, 0.18, "square", 0.45);
    this.tone(500, 0.18, "square", 0.45, 0.25);
  };

  danger = () => {
    for (let i = 0; i < 4; i++) {
      this.tone(1000, 0.1, "square", 0.6, i * 0.2);
    }
  };

  /* ======================================================
     FACTORY EMERGENCY SIREN (loop)
  ====================================================== */

  accidentStart = () => {
    if (this.sirenOsc) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth"; // loud industrial
    gain.gain.value = 0.8;

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();

    const sweep = () => {
      const t = this.ctx.currentTime;

      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.linearRampToValueAtTime(1600, t + 0.5);
      osc.frequency.linearRampToValueAtTime(500, t + 1);
    };

    sweep();
    this.sirenInterval = window.setInterval(sweep, 1000);

    this.sirenOsc = osc;
    this.sirenGain = gain;
  };

  accidentStop = () => {
    if (!this.sirenOsc) return;

    this.sirenOsc.stop();
    this.sirenOsc.disconnect();
    this.sirenGain?.disconnect();

    clearInterval(this.sirenInterval);

    this.sirenOsc = undefined;
    this.sirenGain = undefined;
  };

  /* ======================================================
     SIMPLE ENUM API
  ====================================================== */

  play = (type: ToneType) => {
    switch (type) {
      case "beep":
        this.beep();
        break;
      case "success":
        this.success();
        break;
      case "warning":
        this.warning();
        break;
      case "danger":
        this.danger();
        break;
      case "accident":
        this.accidentStart();
        break;
    }
  };
}

/* ======================================================
   Singleton export
====================================================== */

export const tone = new ToneEngine();

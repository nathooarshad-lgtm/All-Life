import type { Season } from '../modules/utils';

class SeasonAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noises: AudioBufferSourceNode[] = [];
  private longOscs: OscillatorNode[] = [];
  private seqTimer: ReturnType<typeof setTimeout> | null = null;
  private startTimer: ReturnType<typeof setTimeout> | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private reverb: ConvolverNode | null = null;
  private melodyBus: GainNode | null = null;
  private playing = false;
  private scheduleHead = 0;

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
  }

  private createBrownNoise(seconds = 8): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const buf = this.ctx!.createBuffer(2, sr * seconds, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
    }
    return buf;
  }

  private createReverb(duration = 4, decay = 2.2): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const len = sr * duration;
    const buf = this.ctx!.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  private clearAll() {
    this.playing = false;
    if (this.seqTimer) { clearTimeout(this.seqTimer); this.seqTimer = null; }
    if (this.startTimer) { clearTimeout(this.startTimer); this.startTimer = null; }
    if (this.stopTimer) { clearTimeout(this.stopTimer); this.stopTimer = null; }
    this.noises.forEach(n => { try { n.stop(); } catch { /* ignored */ } });
    this.longOscs.forEach(o => { try { o.stop(); } catch { /* ignored */ } });
    this.noises = [];
    this.longOscs = [];
    if (this.reverb) { try { this.reverb.disconnect(); } catch { /* ignored */ } this.reverb = null; }
    if (this.melodyBus) { try { this.melodyBus.disconnect(); } catch { /* ignored */ } this.melodyBus = null; }
  }

  private addNoiseBand(type: BiquadFilterType, freq: number, q: number, vol: number, lfoRate = 0, lfoDepth = 0) {
    if (!this.ctx || !this.master) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.createBrownNoise();
    src.loop = true;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type; filt.frequency.value = freq; filt.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    if (lfoRate > 0 && lfoDepth > 0) {
      const lfo = this.ctx.createOscillator();
      const lfoG = this.ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = lfoRate; lfoG.gain.value = lfoDepth;
      lfo.connect(lfoG).connect(gain.gain);
      lfo.start(); this.longOscs.push(lfo);
    }
    src.connect(filt).connect(gain).connect(this.master);
    src.start(); this.noises.push(src);
  }

  private addLeafRustle() {
    if (!this.ctx || !this.master) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.createBrownNoise(6); src.loop = true;
    const hi = this.ctx.createBiquadFilter(); hi.type = 'highpass'; hi.frequency.value = 1800; hi.Q.value = 0.2;
    const lo = this.ctx.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = 7000;
    const gain = this.ctx.createGain(); gain.gain.value = 0.26;
    const trem = this.ctx.createOscillator(); const tremG = this.ctx.createGain();
    trem.type = 'sawtooth'; trem.frequency.value = 1.1; tremG.gain.value = 0.20;
    trem.connect(tremG).connect(gain.gain); trem.start(); this.longOscs.push(trem);
    src.connect(hi).connect(lo).connect(gain).connect(this.master);
    src.start(); this.noises.push(src);
  }

  private addFireplace() {
    if (!this.ctx || !this.master) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.createBrownNoise(4); src.loop = true;
    const filt = this.ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 700; filt.Q.value = 1.2;
    const gain = this.ctx.createGain(); gain.gain.value = 0.22;
    const trem = this.ctx.createOscillator(); const tremG = this.ctx.createGain();
    trem.type = 'sawtooth'; trem.frequency.value = 16; tremG.gain.value = 0.13;
    trem.connect(tremG).connect(gain.gain); trem.start(); this.longOscs.push(trem);
    src.connect(filt).connect(gain).connect(this.master);
    src.start(); this.noises.push(src);
  }

  private setupMelody(vol: number) {
    if (!this.ctx || !this.master) return;
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.createReverb(4, 2.2);
    this.melodyBus = this.ctx.createGain();
    this.melodyBus.gain.value = vol;
    this.reverb.connect(this.melodyBus).connect(this.master);
  }

  private playNote(freq: number, startTime: number, duration: number, vol = 1.0) {
    if (!this.ctx || !this.reverb) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const atk = Math.min(0.06, duration * 0.12);
    const rel = Math.min(0.28, duration * 0.40);
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(vol, startTime + atk);
    env.gain.setValueAtTime(vol * 0.85, startTime + duration - rel);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(env).connect(this.reverb);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private scheduleMelody(notes: number[], noteDur: number, gap: number, vol: number) {
    if (!this.playing || !this.ctx) return;
    const now = this.ctx.currentTime;
    const start = Math.max(now + 0.05, this.scheduleHead);
    let t = start;
    for (const freq of notes) {
      if (freq > 0) this.playNote(freq, t, noteDur * 0.88, vol);
      t += noteDur + gap;
    }
    const step = noteDur + gap;
    this.scheduleHead = t - step * 0.8;
    const msToNext = (this.scheduleHead - now) * 1000;
    this.seqTimer = setTimeout(() => {
      if (this.playing) this.scheduleMelody(notes, noteDur, gap, vol);
    }, Math.max(50, msToNext));
  }

  async play(season: Season, enabled: boolean) {
    if (!enabled) { this.stop(); return; }
    this.ensureContext();
    if (!this.ctx || !this.master) return;
    await this.ctx.resume();

    if (this.stopTimer) { clearTimeout(this.stopTimer); this.stopTimer = null; }
    if (this.startTimer) { clearTimeout(this.startTimer); this.startTimer = null; }

    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

    this.startTimer = window.setTimeout(() => {
      if (!this.ctx || !this.master) return;
      this.startTimer = null;
      this.clearAll();
      this.playing = true;
      this.scheduleHead = this.ctx.currentTime + 2.2;

      if (season === 'spring') {
        this.addNoiseBand('highpass', 3000, 0.2, 0.26);
        this.addNoiseBand('bandpass', 1000, 0.5, 0.28, 0.07, 0.07);
        this.addNoiseBand('bandpass', 420, 0.8, 0.16, 0.04, 0.05);
        this.addNoiseBand('lowpass', 160, 0.5, 0.10);
        this.setupMelody(0.52);
        this.scheduleMelody([
          523.25, 659.25, 784.00, 880.00, 784.00, 659.25, 587.33, 523.25,
          659.25, 784.00, 880.00, 1046.50, 880.00, 784.00, 659.25, 523.25,
        ], 0.42, 0.03, 0.9);
      }

      if (season === 'summer') {
        this.addNoiseBand('bandpass', 650, 0.6, 0.34, 0.09, 0.14);
        this.addNoiseBand('bandpass', 1500, 0.4, 0.18, 0.07, 0.07);
        this.addNoiseBand('lowpass', 240, 0.9, 0.13, 0.05, 0.05);
        this.addNoiseBand('bandpass', 340, 0.5, 0.13, 0.04, 0.05);
        this.setupMelody(0.50);
        this.scheduleMelody([
          392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00, 392.00,
          493.88, 587.33, 659.25, 784.00, 659.25, 587.33, 493.88, 392.00,
        ], 0.52, 0.04, 0.9);
      }

      if (season === 'autumn') {
        this.addLeafRustle();
        this.addNoiseBand('highpass', 2800, 0.2, 0.20);
        this.addNoiseBand('bandpass', 900, 0.5, 0.22, 0.06, 0.07);
        this.addNoiseBand('bandpass', 290, 0.7, 0.26, 0.09, 0.18);
        this.setupMelody(0.48);
        this.scheduleMelody([
          440.00, 392.00, 329.63, 293.66, 261.63, 293.66, 329.63, 392.00,
          440.00, 392.00, 329.63, 293.66, 261.63, 220.00, 261.63, 329.63,
        ], 0.63, 0.06, 0.9);
      }

      if (season === 'winter') {
        this.addNoiseBand('highpass', 2200, 0.2, 0.30);
        this.addNoiseBand('bandpass', 800, 0.5, 0.26, 0.05, 0.07);
        this.addNoiseBand('bandpass', 340, 0.9, 0.20, 0.04, 0.05);
        this.addFireplace();
        this.addNoiseBand('bandpass', 200, 0.8, 0.14, 0.04, 0.10);
        this.setupMelody(0.58);
        this.scheduleMelody([
          349.23, 293.66, 261.63, 220.00, 196.00, 220.00, 261.63, 293.66,
          349.23, 261.63, 220.00, 196.00, 174.61, 196.00, 220.00, 261.63,
        ], 0.82, 0.08, 0.9);
      }

      this.master.gain.linearRampToValueAtTime(0.58, this.ctx.currentTime + 3.5);
    }, 400);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.playing = false;
    if (this.startTimer) { clearTimeout(this.startTimer); this.startTimer = null; }
    if (this.seqTimer) { clearTimeout(this.seqTimer); this.seqTimer = null; }
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => {
      this.stopTimer = null;
      this.clearAll();
    }, 2500);
  }
}

export const seasonAudio = new SeasonAudio();
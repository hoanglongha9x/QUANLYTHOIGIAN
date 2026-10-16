/**
 * Web Audio API synthesizer for gentle bells, notifications, and ambient focus noise
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a peaceful zen bell / chime when a study session or break completes
 */
export function playGentleBell(volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic frequencies for Tibetan singing bowl / gentle chime
    const baseFreq = 528; // 528Hz - Miracle tone / soothing frequency
    const harmonics = [1, 2.01, 3.01, 4.02];
    const gains = [0.6, 0.3, 0.15, 0.08];

    harmonics.forEach((mult, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);

      // Gentle attack and long decaying ring
      const peakGain = gains[index] * volume;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.5);
    });
  } catch (err) {
    console.warn('Web Audio Bell failed:', err);
  }
}

/**
 * Play a subtle click feedback
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Ambient noise generator (Rain, White Noise, Waves) using Web Audio nodes
 */
class AmbientSoundEngine {
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private currentType: string = 'none';

  start(type: 'none' | 'rain' | 'whitenoise' | 'waves', volume: number = 0.3) {
    this.stop();
    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    try {
      const ctx = getAudioContext();
      this.currentType = type;

      // Create 5 seconds buffer of white/pink noise and loop it
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brown noise accumulation for a warmer, soothing sound
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      this.filterNode = ctx.createBiquadFilter();
      this.gainNode = ctx.createGain();

      if (type === 'rain') {
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(1000, ctx.currentTime);
        this.gainNode.gain.setValueAtTime(volume * 0.45, ctx.currentTime);
      } else if (type === 'whitenoise') {
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setValueAtTime(1200, ctx.currentTime);
        this.filterNode.Q.setValueAtTime(0.5, ctx.currentTime);
        this.gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
      } else if (type === 'waves') {
        // Slow modulating filter to mimic ocean waves
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(500, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second wave cycle
        lfoGain.gain.setValueAtTime(350, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);
        lfo.start();
        this.lfoNode = lfo;

        this.gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      }

      whiteNoise.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);

      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } catch (err) {
      console.warn('Ambient noise error:', err);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && audioCtx) {
      this.gainNode.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // Ignore
      }
      this.noiseNode = null;
    }
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {
        // Ignore
      }
      this.lfoNode = null;
    }
    this.currentType = 'none';
  }

  getType() {
    return this.currentType;
  }
}

export const ambientPlayer = new AmbientSoundEngine();

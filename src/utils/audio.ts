// Pure Web Audio API synthesizers for focus soundscapes and completion chimes

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: { stop: () => void } | null = null;
  private ambientGain: GainNode | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a crystal futuristic chime on session completion
  playCompletionChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Primary crystalline harmonic chime chord (C6, E6, G6, B6)
      const freqs = [1046.5, 1318.5, 1567.98, 1975.53];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.5);
      });
    } catch {
      // AudioContext may be restricted before user gesture
    }
  }

  // Play subtle futuristic click/start blip
  playStartBlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore audio context error
    }
  }

  // Ambient focus soundscapes
  startAmbient(type: 'binaural' | 'cyber_rain' | 'deep_space', volume: number = 0.25) {
    this.stopAmbient();
    try {
      const ctx = this.getContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'binaural') {
        // 40Hz Gamma Focus beat (200Hz left, 240Hz right or 140Hz carrier)
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscLeft.type = 'sine';
        oscLeft.frequency.value = 210;
        oscRight.type = 'sine';
        oscRight.frequency.value = 224; // 14Hz alpha/beta bridge

        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.08;
        gainR.gain.value = 0.08;

        if (pannerLeft && pannerRight) {
          pannerLeft.pan.value = -0.8;
          pannerRight.pan.value = 0.8;
          oscLeft.connect(gainL).connect(pannerLeft).connect(masterGain);
          oscRight.connect(gainR).connect(pannerRight).connect(masterGain);
        } else {
          oscLeft.connect(gainL).connect(masterGain);
          oscRight.connect(gainR).connect(masterGain);
        }

        oscLeft.start();
        oscRight.start();

        this.ambientSource = {
          stop: () => {
            try {
              oscLeft.stop();
              oscRight.stop();
              oscLeft.disconnect();
              oscRight.disconnect();
            } catch {
              // ignore
            }
          },
        };
      } else if (type === 'cyber_rain') {
        // Synthesize pink/white noise through a resonant bandpass filter
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 850;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        this.ambientSource = {
          stop: () => {
            try {
              whiteNoise.stop();
              whiteNoise.disconnect();
            } catch {
              // ignore
            }
          },
        };
      } else if (type === 'deep_space') {
        // Warm low drone
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.value = 55; // A1
        filter.type = 'lowpass';
        filter.frequency.value = 120;

        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.15;

        osc.connect(filter).connect(droneGain).connect(masterGain);
        osc.start();

        this.ambientSource = {
          stop: () => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore
            }
          },
        };
      }
    } catch {
      // Audio error handled
    }
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
  }
}

export const sound = new SoundEngine();

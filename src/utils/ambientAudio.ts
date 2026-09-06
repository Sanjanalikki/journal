// Web Audio API pure synthesizer for ambient calm sounds
// Zero external assets or network dependencies, no autoplay, 100% reliable

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(type: "rain" | "breeze" | "ocean", volume: number = 0.5): void {
    this.stop();
    const ctx = this.getContext();

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    this.currentType = type;
    this.isPlaying = true;

    if (type === "rain") {
      this.startRain(ctx, this.gainNode);
    } else if (type === "breeze") {
      this.startBreeze(ctx, this.gainNode);
    } else if (type === "ocean") {
      this.startOcean(ctx, this.gainNode);
    }
  }

  public setVolume(volume: number): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop(): void {
    if (!this.ctx) return;
    this.isPlaying = false;
    this.currentType = null;

    // Clean up active sound generators
    for (const item of this.activeNodes) {
      if (typeof item === "number") {
        window.clearInterval(item);
      } else {
        try {
          if ("stop" in item && typeof (item as AudioScheduledSourceNode).stop === "function") {
            (item as AudioScheduledSourceNode).stop();
          }
          item.disconnect();
        } catch {
          // ignore disconnect errors on cleanup
        }
      }
    }
    this.activeNodes = [];

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
  }

  public getStatus(): { isPlaying: boolean; type: string | null } {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }

  // Pink noise generator buffer for soft natural rain
  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private startRain(ctx: AudioContext, masterGain: GainNode): void {
    const noiseBuffer = this.createNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to soft rain hiss
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.6, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, rainGain);
  }

  private startBreeze(ctx: AudioContext, masterGain: GainNode): void {
    const noiseBuffer = this.createNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter that slowly undulates
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    // LFO for slow wind gusts
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.8, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(breezeGain);
    breezeGain.connect(masterGain);

    noiseSource.start();
    lfo.start();
    this.activeNodes.push(noiseSource, filter, breezeGain, lfo, lfoGain);
  }

  private startOcean(ctx: AudioContext, masterGain: GainNode): void {
    const noiseBuffer = this.createNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    // Wave swell gain modulation (slow 0.08Hz swell)
    const swell = ctx.createGain();
    swell.gain.setValueAtTime(0.2, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12 second wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(swell.gain);

    // Sub bass hum for deep oceanic rumble
    const subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(55, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.15, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(masterGain);

    noiseSource.connect(filter);
    filter.connect(swell);
    swell.connect(masterGain);

    noiseSource.start();
    lfo.start();
    subOsc.start();
    this.activeNodes.push(noiseSource, filter, swell, lfo, lfoGain, subOsc, subGain);
  }
}

export const ambientAudio = new AmbientAudioEngine();

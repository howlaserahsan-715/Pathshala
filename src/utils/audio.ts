// High-Fidelity Audio Engine: Web Audio Synthesizer & Natural TTS Streamer

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentAmbientNodes: { stop: () => void } | null = null;
  private previewTimeout: any = null;

  // Speech Queue & Audio Playback State
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentSpeechId = 0;
  private isSpeakingActive = false;
  private isPaused = false;
  private currentRate = 1.0;
  private speechChunks: string[] = [];
  private currentChunkIndex = 0;
  private currentOnEndCallback: (() => void) | null = null;
  private currentOnErrorCallback: (() => void) | null = null;
  private currentOnProgressCallback: ((index: number, total: number, sentence: string) => void) | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();

  // Browser SpeechSynthesis Fallback
  private voices: SpeechSynthesisVoice[] = [];
  private hasInitializedVoices = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      // Listen for user gestures to automatically unlock AudioContext
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      if (!this.hasInitializedVoices) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.voices = window.speechSynthesis.getVoices();
          this.hasInitializedVoices = true;
        };
      }
    } catch {
      // Ignore in restricted environments
    }
  }

  getContext(): AudioContext {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx!;
  }

  // -------------------------------------------------------------
  // 1. Web Audio SFX & Acoustic Synthesizers (Bells, Chimes, Ticks)
  // -------------------------------------------------------------

  // Tibetan Singing Bowl (তিব্বতি বেল) with acoustic harmonics & warm gong resonance
  playSingingBowl() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const runSound = () => {
        const now = ctx.currentTime;
        // Fundamental 432 Hz healing pitch + acoustic overtone intervals
        const overtones = [
          { f: 432, gain: 0.35, decay: 3.5 },
          { f: 864, gain: 0.22, decay: 2.8 },
          { f: 1192, gain: 0.15, decay: 2.2 },
          { f: 1728, gain: 0.1, decay: 1.8 },
          { f: 2332, gain: 0.06, decay: 1.2 },
        ];

        // Soft striker impact transient
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
        }
        const strike = ctx.createBufferSource();
        strike.buffer = noiseBuffer;
        const strikeFilter = ctx.createBiquadFilter();
        strikeFilter.type = 'lowpass';
        strikeFilter.frequency.setValueAtTime(600, now);
        const strikeGain = ctx.createGain();
        strikeGain.gain.setValueAtTime(0.12, now);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        strike.connect(strikeFilter);
        strikeFilter.connect(strikeGain);
        strikeGain.connect(ctx.destination);
        strike.start(now);

        // Harmonic resonant ring
        overtones.forEach((tone) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(tone.f, now);

          // Subtle natural detuning / vibrato beat
          const detuneOsc = ctx.createOscillator();
          const detuneGain = ctx.createGain();
          detuneOsc.frequency.setValueAtTime(1.8, now);
          detuneGain.gain.setValueAtTime(1.5, now);
          detuneOsc.connect(osc.frequency);
          detuneOsc.start(now);
          detuneOsc.stop(now + tone.decay);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(tone.gain, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.decay);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + tone.decay);
        });
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(runSound).catch(runSound);
      } else {
        runSound();
      }
    } catch (e) {
      console.warn('Singing bowl audio error:', e);
    }
  }

  // Session Chime (সমাপ্তি ঘণ্টা) - Pentatonic celebration chime
  playChime(success = true) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const runSound = () => {
        const now = ctx.currentTime;
        // Pentatonic bright notes (C5, E5, G5, C6) or warm contemplative (G4, C5, E5)
        const notes = success ? [523.25, 659.25, 783.99, 1046.5] : [392.0, 523.25, 659.25];

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          const peakGain = 0.28 / (idx * 0.3 + 1);
          const noteStart = now + idx * 0.07;
          gain.gain.setValueAtTime(0.001, noteStart);
          gain.gain.linearRampToValueAtTime(peakGain, noteStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.0);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteStart);
          osc.stop(noteStart + 2.1);
        });
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(runSound).catch(runSound);
      } else {
        runSound();
      }
    } catch (e) {
      console.warn('Chime audio error:', e);
    }
  }

  // Tactile Mechanical Clock Tick
  playTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const runTick = () => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(runTick).catch(runTick);
      } else {
        runTick();
      }
    } catch {
      // Ignore
    }
  }

  // -------------------------------------------------------------
  // 2. Continuous Ambient Focus Soundscapes (Rain, Waves, Noise)
  // -------------------------------------------------------------

  startAmbient(type: 'rain' | 'waves' | 'whitenoise' | 'forest') {
    this.stopAmbient();
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const runAmbient = () => {
        const sampleRate = ctx.sampleRate || 44100;
        const bufferLength = sampleRate * 3; // 3 second loop
        const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
        const data = buffer.getChannelData(0);

        // Generate warm pink noise base
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.14;
          b6 = white * 0.115926;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const mainFilter = ctx.createBiquadFilter();
        const masterGain = ctx.createGain();

        const activeTimers: any[] = [];
        const activeNodes: any[] = [];

        if (type === 'rain') {
          // Soothing warm rainfall: Lowpass at 1800 Hz + randomized crisp droplets
          mainFilter.type = 'lowpass';
          mainFilter.frequency.setValueAtTime(1600, ctx.currentTime);
          masterGain.gain.setValueAtTime(0.24, ctx.currentTime);

          // Random droplet bursts
          const dropInterval = setInterval(() => {
            if (!this.currentAmbientNodes) return;
            try {
              const now = ctx.currentTime;
              const dropOsc = ctx.createOscillator();
              const dropGain = ctx.createGain();
              dropOsc.type = 'sine';
              dropOsc.frequency.setValueAtTime(1400 + Math.random() * 900, now);
              dropOsc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

              dropGain.gain.setValueAtTime(0.08, now);
              dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

              dropOsc.connect(dropGain);
              dropGain.connect(ctx.destination);
              dropOsc.start(now);
              dropOsc.stop(now + 0.04);
            } catch {}
          }, 140);
          activeTimers.push(dropInterval);

        } else if (type === 'waves') {
          // Ocean Waves: Rhythmic LFO sweep that washes back and forth
          mainFilter.type = 'lowpass';
          mainFilter.frequency.setValueAtTime(500, ctx.currentTime);
          masterGain.gain.setValueAtTime(0.26, ctx.currentTime);

          // Dynamic wave swell LFO
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5s wave cycle
          lfoGain.gain.setValueAtTime(420, ctx.currentTime);
          lfo.connect(mainFilter.frequency);
          lfo.start();
          activeNodes.push(lfo);

        } else if (type === 'forest') {
          // Forest wind & occasional gentle bird chime
          mainFilter.type = 'bandpass';
          mainFilter.frequency.setValueAtTime(800, ctx.currentTime);
          mainFilter.Q.setValueAtTime(1.2, ctx.currentTime);
          masterGain.gain.setValueAtTime(0.20, ctx.currentTime);

          const birdInterval = setInterval(() => {
            if (!this.currentAmbientNodes) return;
            try {
              const now = ctx.currentTime;
              const bird = ctx.createOscillator();
              const birdGain = ctx.createGain();
              bird.type = 'sine';
              bird.frequency.setValueAtTime(2400 + Math.random() * 400, now);
              bird.frequency.linearRampToValueAtTime(2900 + Math.random() * 300, now + 0.08);

              birdGain.gain.setValueAtTime(0.001, now);
              birdGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
              birdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

              bird.connect(birdGain);
              birdGain.connect(ctx.destination);
              bird.start(now);
              bird.stop(now + 0.13);
            } catch {}
          }, 2400);
          activeTimers.push(birdInterval);

        } else {
          // White / Pink Focus Noise
          mainFilter.type = 'lowpass';
          mainFilter.frequency.setValueAtTime(2000, ctx.currentTime);
          masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
        }

        noiseSource.connect(mainFilter);
        mainFilter.connect(masterGain);
        masterGain.connect(ctx.destination);

        noiseSource.start();

        this.currentAmbientNodes = {
          stop: () => {
            try {
              activeTimers.forEach((t) => clearInterval(t));
              activeNodes.forEach((n) => {
                try { n.stop(); } catch {}
              });
              noiseSource.stop();
              noiseSource.disconnect();
              mainFilter.disconnect();
              masterGain.disconnect();
            } catch {}
          },
        };
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(runAmbient).catch(runAmbient);
      } else {
        runAmbient();
      }
    } catch (e) {
      console.warn('Ambient focus sound error:', e);
    }
  }

  stopAmbient() {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
    if (this.currentAmbientNodes) {
      this.currentAmbientNodes.stop();
      this.currentAmbientNodes = null;
    }
  }

  // Preview ambient sound for a few seconds with explicit callback when finished
  previewSound(
    type: 'rain' | 'waves' | 'whitenoise' | 'forest' | 'bell' | 'chime',
    durationSeconds = 6,
    onEnd?: () => void
  ) {
    this.stopAmbient();

    if (type === 'bell') {
      this.playSingingBowl();
      this.previewTimeout = setTimeout(() => {
        if (onEnd) onEnd();
      }, 3500);
      return;
    }

    if (type === 'chime') {
      this.playChime(true);
      this.previewTimeout = setTimeout(() => {
        if (onEnd) onEnd();
      }, 2200);
      return;
    }

    this.startAmbient(type);
    this.previewTimeout = setTimeout(() => {
      this.stopAmbient();
      if (onEnd) onEnd();
    }, durationSeconds * 1000);
  }

  // -------------------------------------------------------------
  // 3. High-Fidelity Native Bengali & English TTS Engine
  // -------------------------------------------------------------

  speakBangla(
    text: string,
    rate = 1.0,
    onEnd?: () => void,
    onError?: () => void,
    onProgress?: (chunkIndex: number, totalChunks: number, sentence: string) => void
  ) {
    this.stopSpeaking();

    // Clean text: strip markdown symbols, citations, HTML tags
    const cleaned = text
      .replace(/[*#_~`>]/g, '')
      .replace(/\[cite:\s*\d+\]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      if (onEnd) onEnd();
      return;
    }

    this.currentSpeechId++;
    const speechId = this.currentSpeechId;
    this.isSpeakingActive = true;
    this.isPaused = false;
    this.currentRate = rate;
    this.currentOnEndCallback = onEnd || null;
    this.currentOnErrorCallback = onError || null;
    this.currentOnProgressCallback = onProgress || null;

    // Split text into natural sentence chunks
    const rawSentences = cleaned
      .split(/([।?!;\n]+)/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let buffer = '';

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i];
      if (/^[।?!;\n]+$/.test(part)) {
        buffer += part;
        if (buffer.trim()) {
          chunks.push(buffer.trim());
          buffer = '';
        }
      } else {
        if (buffer) {
          chunks.push(buffer.trim());
          buffer = '';
        }
        if (part.length > 110) {
          const subParts = part.split(/,\s*/);
          subParts.forEach((sp) => {
            if (sp.trim()) chunks.push(sp.trim());
          });
        } else {
          buffer = part;
        }
      }
    }
    if (buffer.trim()) {
      chunks.push(buffer.trim());
    }

    this.speechChunks = chunks.length > 0 ? chunks : [cleaned];
    this.currentChunkIndex = 0;

    // Start playing first chunk
    this.playChunk(0, speechId);
  }

  // Pre-fetch next chunk into AudioBuffer cache for zero-lag gapless speech
  private async prefetchChunk(index: number) {
    if (index >= this.speechChunks.length) return;
    const sentence = this.speechChunks[index];
    const hasBengali = /[\u0980-\u09FF]/.test(sentence);
    const lang = hasBengali ? 'bn' : 'en';
    const ttsUrl = `/api/tts?text=${encodeURIComponent(sentence)}&lang=${lang}`;

    if (this.audioBufferCache.has(ttsUrl)) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const res = await fetch(ttsUrl);
      if (!res.ok) return;
      const arrayBuffer = await res.arrayBuffer();
      ctx.decodeAudioData(
        arrayBuffer.slice(0),
        (decoded) => {
          if (this.audioBufferCache.size > 80) {
            const firstKey = this.audioBufferCache.keys().next().value;
            if (firstKey) this.audioBufferCache.delete(firstKey);
          }
          this.audioBufferCache.set(ttsUrl, decoded);
        },
        () => {}
      );
    } catch {
      // Ignore prefetch errors
    }
  }

  private async playChunk(index: number, speechId: number) {
    if (speechId !== this.currentSpeechId || !this.isSpeakingActive || this.isPaused) return;

    if (index >= this.speechChunks.length) {
      this.finishSpeech(speechId);
      return;
    }

    const sentence = this.speechChunks[index];
    this.currentChunkIndex = index;

    if (this.currentOnProgressCallback) {
      this.currentOnProgressCallback(index + 1, this.speechChunks.length, sentence);
    }

    // Pre-fetch next sentence in background
    this.prefetchChunk(index + 1);

    const hasBengali = /[\u0980-\u09FF]/.test(sentence);
    const lang = hasBengali ? 'bn' : 'en';
    const ttsUrl = `/api/tts?text=${encodeURIComponent(sentence)}&lang=${lang}`;

    // Clean up previous source node if any
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {}
      this.currentSourceNode = null;
    }

    // Method 1: Web Audio Buffer Source (Bypasses iframe autoplay restrictions entirely)
    try {
      const ctx = this.getContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        let audioBuffer = this.audioBufferCache.get(ttsUrl);
        if (!audioBuffer) {
          const res = await fetch(ttsUrl);
          if (!res.ok) throw new Error(`TTS server responded with ${res.status}`);
          const arrayBuffer = await res.arrayBuffer();
          audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
            ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
          });
          this.audioBufferCache.set(ttsUrl, audioBuffer);
        }

        if (speechId !== this.currentSpeechId || !this.isSpeakingActive || this.isPaused) return;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = Math.max(0.7, Math.min(2.0, this.currentRate));

        let nextFired = false;
        const triggerNext = () => {
          if (nextFired) return;
          nextFired = true;
          if (speechId === this.currentSpeechId && this.isSpeakingActive && !this.isPaused) {
            setTimeout(() => {
              this.playChunk(index + 1, speechId);
            }, 120);
          }
        };

        source.onended = triggerNext;
        source.connect(ctx.destination);
        this.currentSourceNode = source;
        source.start(0);
        return;
      }
    } catch (webAudioErr) {
      console.warn('Web Audio buffer playback failed, trying HTMLAudioElement fallback:', webAudioErr);
    }

    // Method 2: Reusable HTMLAudioElement Fallback
    try {
      if (!this.currentAudioElement) {
        this.currentAudioElement = new Audio();
      }
      const audio = this.currentAudioElement;
      audio.playbackRate = Math.max(0.7, Math.min(2.0, this.currentRate));

      let hasHandledEnd = false;
      const proceedToNext = () => {
        if (hasHandledEnd) return;
        hasHandledEnd = true;
        if (speechId === this.currentSpeechId && this.isSpeakingActive && !this.isPaused) {
          setTimeout(() => {
            this.playChunk(index + 1, speechId);
          }, 140);
        }
      };

      audio.onended = proceedToNext;
      audio.onerror = () => {
        console.warn('HTMLAudio error, falling back to Web Speech API');
        this.fallbackWebSpeechChunk(sentence, proceedToNext);
      };

      audio.src = ttsUrl;
      await audio.play();
      return;
    } catch (audioElErr) {
      console.warn('HTMLAudioElement play() failed, falling back to Web Speech API:', audioElErr);
    }

    // Method 3: Browser SpeechSynthesis Fallback
    this.fallbackWebSpeechChunk(sentence, () => {
      if (speechId === this.currentSpeechId && this.isSpeakingActive && !this.isPaused) {
        setTimeout(() => {
          this.playChunk(index + 1, speechId);
        }, 140);
      }
    });
  }

  private fallbackWebSpeechChunk(sentence: string, onDone: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone();
      return;
    }

    try {
      this.initVoices();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = Math.max(0.7, Math.min(1.5, this.currentRate));

      const hasBengali = /[\u0980-\u09FF]/.test(sentence);
      const bnVoice = this.voices.find(
        (v) => v.lang === 'bn-BD' || v.lang === 'bn-IN' || v.name.toLowerCase().includes('bengali')
      );

      if (bnVoice && hasBengali) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang;
      } else {
        utterance.lang = hasBengali ? 'bn-BD' : 'en-US';
      }

      utterance.onend = () => onDone();
      utterance.onerror = () => onDone();

      window.speechSynthesis.speak(utterance);
    } catch {
      onDone();
    }
  }

  pauseSpeaking() {
    this.isPaused = true;
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {}
      this.currentSourceNode = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
  }

  resumeSpeaking() {
    if (!this.isSpeakingActive) return;
    this.isPaused = false;
    this.playChunk(this.currentChunkIndex, this.currentSpeechId);
  }

  setPlaybackRate(newRate: number) {
    this.currentRate = Math.max(0.7, Math.min(2.0, newRate));
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.playbackRate.value = this.currentRate;
      } catch {}
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = this.currentRate;
    }
  }

  stopSpeaking() {
    this.currentSpeechId++;
    this.isSpeakingActive = false;
    this.isPaused = false;
    this.speechChunks = [];
    this.currentChunkIndex = 0;

    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {}
      this.currentSourceNode = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement.removeAttribute('src');
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.currentOnEndCallback = null;
    this.currentOnErrorCallback = null;
    this.currentOnProgressCallback = null;
  }

  private finishSpeech(speechId: number) {
    if (speechId !== this.currentSpeechId) return;
    const callback = this.currentOnEndCallback;
    this.stopSpeaking();
    if (callback) {
      try {
        callback();
      } catch {}
    }
  }

  isSpeaking(): boolean {
    return this.isSpeakingActive && !this.isPaused;
  }

  getVoices(): SpeechSynthesisVoice[] {
    this.initVoices();
    return this.voices;
  }
}

export const audioEngine = new AudioEngine();

/**
 * High-fidelity synthetic film clapperboard sound generator using Web Audio API.
 * Ensures zero network latency, zero broken external audio URLs, and instant playback.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playClapperSound(enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Transient click (sharp contact of wood sticks)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();

    osc1.type = "square";
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    filter1.type = "lowpass";
    filter1.frequency.setValueAtTime(3200, now);
    filter1.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.05);

    // 2. Wooden slate resonance body (mid acoustic pop)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const filter2 = ctx.createBiquadFilter();

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(380, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    filter2.type = "bandpass";
    filter2.frequency.setValueAtTime(680, now);
    filter2.Q.setValueAtTime(3.5, now);

    gain2.gain.setValueAtTime(0.65, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.1);

    // 3. Noise snap (hollow room slap)
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.Q.setValueAtTime(1.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.065);
  } catch {
    // Graceful silence if blocked or unpermitted by browser
  }
}

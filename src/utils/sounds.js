const SFX_STORAGE_KEY = "aprende_ingles_sfx_enabled";

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const isSfxEnabled = () => {
  try {
    const saved = localStorage.getItem(SFX_STORAGE_KEY);
    return saved === null ? true : saved === "true";
  } catch {
    return true;
  }
};

export const setSfxEnabled = (enabled) => {
  try {
    localStorage.setItem(SFX_STORAGE_KEY, String(Boolean(enabled)));
  } catch {
    // Ignorar si el almacenamiento está bloqueado
  }
};

const playTone = (
  ctx,
  {
    freq,
    endFreq = null,
    start = 0,
    duration = 0.14,
    type = "sine",
    volume = 0.16,
  }
) => {
  const now = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== null) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  }

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
};

// Sonido alegre ascendente al acertar una palabra
export const playSuccessSound = () => {
  if (!isSfxEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(ctx, { freq: 523.25, start: 0, duration: 0.12, type: "sine", volume: 0.16 });
  playTone(ctx, { freq: 659.25, start: 0.08, duration: 0.13, type: "sine", volume: 0.16 });
  playTone(ctx, { freq: 783.99, start: 0.16, duration: 0.24, type: "triangle", volume: 0.18 });
};

// Sonido grave suave cuando la respuesta es incorrecta
export const playErrorSound = () => {
  if (!isSfxEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(ctx, {
    freq: 250,
    endFreq: 195,
    start: 0,
    duration: 0.13,
    type: "triangle",
    volume: 0.18,
  });
  playTone(ctx, {
    freq: 195,
    endFreq: 150,
    start: 0.12,
    duration: 0.18,
    type: "triangle",
    volume: 0.16,
  });
};

// Sonido suave al avanzar o cambiar de tarjeta
export const playNextSound = () => {
  if (!isSfxEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(ctx, {
    freq: 460,
    endFreq: 660,
    start: 0,
    duration: 0.075,
    type: "sine",
    volume: 0.1,
  });
};
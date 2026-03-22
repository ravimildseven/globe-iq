// Synthesized UI sound effects — Web Audio API
// Uses a shared, persistent AudioContext to avoid browser pool exhaustion.
// All effects are gated by _soundEnabled (set by AmbientSound toggle).

let _soundEnabled = false;
let _ctx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean) {
  _soundEnabled = enabled;
}

// Lazily create one shared AudioContext; resume it if suspended.
// Returns null only if the browser has no Web Audio support.
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx || _ctx.state === "closed") {
      _ctx = new AudioContext();
    }
    // Always attempt resume — required on iOS Safari after lock screen etc.
    if (_ctx.state === "suspended") {
      _ctx.resume().catch(() => {});
    }
    return _ctx;
  } catch {
    return null;
  }
}

// Helper: schedule a simple tone.
// attack / decay in seconds, peak gain, start frequency, optional end frequency.
function tone(
  freq: number,
  peakGain: number,
  attack: number,
  decay: number,
  freqEnd?: number,
) {
  const c = ctx();
  if (!c) return;
  const t = c.currentTime;

  const osc  = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + attack + decay);
  }

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peakGain, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

// Select — rising two-tone chime (C5 → E5)
export function playSelectSound(): void {
  if (!_soundEnabled) return;
  tone(523, 0.40, 0.015, 0.28, 659);
  setTimeout(() => tone(659, 0.30, 0.010, 0.22), 60);
}

// Hover — very short soft blip, not too frequent
let _lastHover = 0;
export function playHoverSound(): void {
  if (!_soundEnabled) return;
  const now = Date.now();
  if (now - _lastHover < 120) return; // throttle: max ~8/s
  _lastHover = now;
  tone(600, 0.15, 0.008, 0.10);
}

// Deselect — descending soft glide
export function playDeselectSound(): void {
  if (!_soundEnabled) return;
  tone(660, 0.35, 0.010, 0.30, 420);
}

// Layer toggle — two-note UI "thock"
export function playLayerToggleSound(): void {
  if (!_soundEnabled) return;
  tone(800,  0.30, 0.008, 0.14);
  setTimeout(() => tone(1050, 0.20, 0.005, 0.12), 70);
}

// Zoom — short rising or falling filtered whoosh
export function playZoomSound(): void {
  if (!_soundEnabled) return;
  tone(300, 0.28, 0.012, 0.18, 600);
}

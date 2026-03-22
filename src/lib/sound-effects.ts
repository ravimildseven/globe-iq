// UI sound effects — Web Audio API
//
// Single shared AudioContext, pre-unlocked on the first touch/click anywhere.
// This is the only reliable cross-browser (iOS Safari, Chrome Android) pattern:
//   1. On first user gesture (touchstart / mousedown), create & resume the context.
//   2. All subsequent sounds use that already-running context — no gating.
//
// Call initAudio() once from the root layout to register the unlock listener.

let _ctx: AudioContext | null = null;
let _unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx || _ctx.state === "closed") {
    try {
      _ctx = new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { return null; }
  }
  return _ctx;
}

// Call once — attaches a one-time gesture listener that pre-resumes the context.
export function initAudio(): void {
  if (typeof window === "undefined" || _unlocked) return;
  const unlock = () => {
    if (_unlocked) return;
    _unlocked = true;
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => undefined);
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("mousedown",  unlock, true);
  };
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
  window.addEventListener("mousedown",  unlock, { capture: true, passive: true });
}

// AmbientSound can share its context
export function setSharedAudioCtx(ctx: AudioContext | null): void { _ctx = ctx; }
export function setSoundEnabled(_: boolean): void { /* kept for compat */ }

// ─── Internal helpers ──────────────────────────────────────────────────────────

function scheduleTone(
  c:      AudioContext,
  freq:   number,
  peak:   number,
  attack: number,
  decay:  number,
  endFreq?: number,
): void {
  const t    = c.currentTime;
  const osc  = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 0.001), t + attack + decay);
  }

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

function withCtx(fn: (c: AudioContext) => void): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "running") {
    fn(c);
  } else {
    c.resume().then(() => fn(c)).catch(() => undefined);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

// Rising two-tone chime
export function playSelectSound(): void {
  withCtx(c => {
    scheduleTone(c, 880, 0.75, 0.012, 0.32, 1320);
    setTimeout(() => scheduleTone(c, 1320, 0.60, 0.010, 0.26), 65);
  });
}

let _lastHover = 0;
export function playHoverSound(): void {
  const now = Date.now();
  if (now - _lastHover < 130) return;
  _lastHover = now;
  withCtx(c => scheduleTone(c, 900, 0.35, 0.006, 0.09));
}

export function playDeselectSound(): void {
  withCtx(c => scheduleTone(c, 900, 0.70, 0.010, 0.30, 600));
}

export function playLayerToggleSound(): void {
  withCtx(c => {
    scheduleTone(c, 880, 0.65, 0.008, 0.18);
    setTimeout(() => scheduleTone(c, 1100, 0.50, 0.005, 0.15), 70);
  });
}

export function playZoomSound(): void {
  withCtx(c => scheduleTone(c, 500, 0.60, 0.010, 0.18, 900));
}

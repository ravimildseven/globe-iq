// UI sound effects — Web Audio API
//
// Two-track architecture:
//   • When ambient is ON:  AmbientSound exports its confirmed-running AudioContext
//     via setSharedAudioCtx().  All effects reuse it — no suspended-context risk.
//   • When ambient is OFF: each effect creates a fresh AudioContext synchronously
//     (effects are always called from click handlers = trusted gesture) then
//     calls resume() → plays inside .then().
//
// _soundEnabled is only true while ambient is playing, so effects are a bonus
// layer — they won't fire unless the user has already unblocked audio.

let _soundEnabled      = false;  // ambient toggle
let _effectsUnlocked   = false;  // true after first user gesture unlocks audio
let _sharedCtx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean)           { _soundEnabled = enabled; if (enabled) _effectsUnlocked = true; }
export function setSharedAudioCtx(ctx: AudioContext | null) { _sharedCtx = ctx; }

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getOrMakeCtx(): AudioContext | null {
  // Prefer the shared, already-running context from AmbientSound.
  if (_sharedCtx && _sharedCtx.state !== "closed") return _sharedCtx;
  // Fall back: create a fresh one (only valid when we're inside a click handler).
  try { return new AudioContext(); } catch { return null; }
}

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
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + attack + decay);
  }

  // Start from tiny non-zero value — exponentialRamp to 0 throws RangeError
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

// Run `fn` on a guaranteed-running AudioContext.
// Effects fire whenever called from a click handler — no ambient-on requirement.
// (Browser autoplay: each effect is called from user gesture so fresh ctx works.)
function withCtx(fn: (c: AudioContext) => void): void {
  const c = getOrMakeCtx();
  if (!c) return;

  if (c.state === "running") {
    fn(c);
  } else {
    c.resume().then(() => fn(c));
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Rising two-tone chime: A5 → E6
export function playSelectSound(): void {
  withCtx(c => {
    scheduleTone(c, 880, 0.75, 0.012, 0.32, 1320);
    setTimeout(() => scheduleTone(c, 1320, 0.60, 0.010, 0.26), 65);
  });
}

// Soft blip on hover — throttled to avoid audio spam
let _lastHover = 0;
export function playHoverSound(): void {
  const now = Date.now();
  if (now - _lastHover < 130) return;
  _lastHover = now;
  withCtx(c => scheduleTone(c, 900, 0.35, 0.006, 0.09));
}

// Descending glide on panel close
export function playDeselectSound(): void {
  withCtx(c => scheduleTone(c, 900, 0.70, 0.010, 0.30, 600));
}

// Double-note "thock" for layer switches
export function playLayerToggleSound(): void {
  withCtx(c => {
    scheduleTone(c, 880,  0.65, 0.008, 0.18);
    setTimeout(() => scheduleTone(c, 1100, 0.50, 0.005, 0.15), 70);
  });
}

// Short filtered rise on zoom
export function playZoomSound(): void {
  withCtx(c => scheduleTone(c, 500, 0.60, 0.010, 0.18, 900));
}

// Expose unlock helper so any first click can unblock audio
export function unlockEffects(): void { _effectsUnlocked = true; }

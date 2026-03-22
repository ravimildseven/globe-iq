// Synthesized UI sound effects — Web Audio API
// Enabled flag is toggled by AmbientSound component

let _soundEnabled = false;

export function setSoundEnabled(enabled: boolean) {
  _soundEnabled = enabled;
}

function makeCtx(): AudioContext | null {
  try { return new AudioContext(); } catch { return null; }
}

export function playSelectSound(): void {
  if (!_soundEnabled) return;
  const ctx = makeCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.30);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  }).catch(() => {});
}

export function playHoverSound(): void {
  if (!_soundEnabled) return;
  const ctx = makeCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  }).catch(() => {});
}

export function playDeselectSound(): void {
  if (!_soundEnabled) return;
  const ctx = makeCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.20);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
    osc.onended = () => ctx.close();
  }).catch(() => {});
}

export function playLayerToggleSound(): void {
  if (!_soundEnabled) return;
  const ctx = makeCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    // Short noise burst
    const bufSize = Math.floor(ctx.sampleRate * 0.10);
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filt   = ctx.createBiquadFilter();
    filt.type      = "bandpass";
    filt.frequency.value = 800;
    filt.Q.value   = 2;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.08, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    noise.connect(filt).connect(ng).connect(ctx.destination);
    noise.start(ctx.currentTime);

    // Ping tone
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  }).catch(() => {});
}

export function playZoomSound(): void {
  if (!_soundEnabled) return;
  const ctx = makeCtx();
  if (!ctx) return;
  ctx.resume().then(() => {
    const bufSize = Math.floor(ctx.sampleRate * 0.20);
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filt   = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(200, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.20);
    filt.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    noise.connect(filt).connect(gain).connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.onended = () => ctx.close();
  }).catch(() => {});
}

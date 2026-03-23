"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, MousePointerClick } from "lucide-react";
import { setClicksEnabled, setSharedAudioCtx } from "@/lib/sound-effects";

// ─── Pure-oscillator drone ────────────────────────────────────────────────────
// Two detuned sines (60Hz + 63.3Hz) create a natural beating wave.
// Separate `breath` GainNode carries the LFO so the fade ramp on `master` is
// never contested by an automation source.
function buildDrone(ctx: AudioContext): { master: GainNode; stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Breath layer — LFO modulates this, not master
  const breath = ctx.createGain();
  breath.gain.value = 1.0;
  breath.connect(master);

  const oscs: OscillatorNode[] = [];

  const add = (freq: number, vol: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(breath);
    o.start();
    oscs.push(o);
  };

  add(200,   0.55);   // fundamental — audible on phone speakers
  add(204,   0.44);   // slight detune — creates beating
  add(400,   0.14);   // octave warmth
  add(600,   0.05);   // high shimmer

  // LFO breathing — 0.05 Hz = 20-second cycle, ±0.18 swing
  const lfo      = ctx.createOscillator();
  const lfoScale = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.05;
  lfoScale.gain.value = 0.18;
  lfo.connect(lfoScale).connect(breath.gain);
  lfo.start();
  oscs.push(lfo);

  return {
    master,
    stop: () => oscs.forEach(o => { try { o.stop(); } catch { /* already stopped */ } }),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [clicksOn, setClicksOn]   = useState(true);
  const ctxRef   = useRef<AudioContext | null>(null);
  const droneRef = useRef<{ master: GainNode; stop: () => void } | null>(null);

  const toggleAmbient = useCallback(() => {
    if (isPlaying) {
      // ── Fade out then tear down ──────────────────────────────────────────
      const ctx   = ctxRef.current;
      const drone = droneRef.current;
      if (ctx && drone) {
        const g = drone.master.gain;
        const t = ctx.currentTime;
        g.cancelScheduledValues(t);
        g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(0, t + 1.5);
        setTimeout(() => {
          try { drone.stop(); } catch { /* ok */ }
          try { ctx.close();  } catch { /* ok */ }
          droneRef.current = null;
          ctxRef.current   = null;
          setSharedAudioCtx(null);
        }, 1700);
      }
      setIsPlaying(false);

    } else {
      // ── MUST be synchronous in the click handler ─────────────────────────
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      ctx.resume().then(() => {
        const drone = buildDrone(ctx);
        droneRef.current = drone;

        const g = drone.master.gain;
        const t = ctx.currentTime;
        g.setValueAtTime(0, t);
        g.linearRampToValueAtTime(0.85, t + 3.0);

        // Share the confirmed-running context so click effects can piggyback
        setSharedAudioCtx(ctx);
      });

      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleClicks = useCallback(() => {
    const next = !clicksOn;
    setClicksOn(next);
    setClicksEnabled(next);
  }, [clicksOn]);

  return (
    <div className="flex items-center gap-1.5">
      {/* Ambient drone toggle */}
      <button
        onClick={toggleAmbient}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card/80 backdrop-blur-sm border border-border-subtle hover:border-hud-border transition-all text-text-muted hover:text-text-primary"
        title={isPlaying ? "Mute ambient sound" : "Play Earth ambient sound"}
      >
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span className="text-[11px] hidden sm:inline">
          {isPlaying ? "Ambience" : "Ambience"}
        </span>
      </button>

      {/* Click sounds toggle */}
      <button
        onClick={toggleClicks}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card/80 backdrop-blur-sm border transition-all ${
          clicksOn
            ? "border-border-subtle hover:border-hud-border text-text-muted hover:text-text-primary"
            : "border-border-subtle text-text-muted/40 hover:text-text-muted"
        }`}
        title={clicksOn ? "Mute click sounds" : "Enable click sounds"}
      >
        <MousePointerClick size={16} />
        <span className="text-[11px] hidden sm:inline">
          Clicks
        </span>
      </button>
    </div>
  );
}

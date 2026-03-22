"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled } from "@/lib/sound-effects";

// Pure Web Audio drone — no external URLs, no CORS issues
// Architecture: oscillators → oscMix → breathGain → masterGain → destination
//               lfo → lfoScale → breathGain.gain  (breathing effect)
function buildDrone(ctx: AudioContext): { master: GainNode; stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Separate breath layer so LFO doesn't fight the fade ramp on master
  const breath = ctx.createGain();
  breath.gain.value = 1;
  breath.connect(master);

  const nodes: (OscillatorNode)[] = [];

  // Deep beating drone — two slightly detuned sines produce natural waver
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 60;
  const g1 = ctx.createGain();
  g1.gain.value = 0.45;
  osc1.connect(g1).connect(breath);
  osc1.start();
  nodes.push(osc1);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 63.3; // +3.3Hz creates ~0.3s beating cycle
  const g2 = ctx.createGain();
  g2.gain.value = 0.35;
  osc2.connect(g2).connect(breath);
  osc2.start();
  nodes.push(osc2);

  // Octave warmth layer
  const osc3 = ctx.createOscillator();
  osc3.type = "sine";
  osc3.frequency.value = 120;
  const g3 = ctx.createGain();
  g3.gain.value = 0.12;
  osc3.connect(g3).connect(breath);
  osc3.start();
  nodes.push(osc3);

  // High shimmer — very subtle
  const osc4 = ctx.createOscillator();
  osc4.type = "sine";
  osc4.frequency.value = 243; // B3-ish
  const g4 = ctx.createGain();
  g4.gain.value = 0.04;
  const shimFilter = ctx.createBiquadFilter();
  shimFilter.type = "lowpass";
  shimFilter.frequency.value = 500;
  osc4.connect(shimFilter).connect(g4).connect(breath);
  osc4.start();
  nodes.push(osc4);

  // Slow LFO on breath.gain — 0.05Hz = 20s breath cycle, ±0.18 swing
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.05;
  const lfoScale = ctx.createGain();
  lfoScale.gain.value = 0.18;
  lfo.connect(lfoScale).connect(breath.gain);
  lfo.start();
  nodes.push(lfo);

  return {
    master,
    stop: () => nodes.forEach(n => { try { n.stop(); } catch { /* already stopped */ } }),
  };
}

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef   = useRef<AudioContext | null>(null);
  const droneRef = useRef<{ master: GainNode; stop: () => void } | null>(null);

  const toggle = useCallback(() => {
    if (isPlaying) {
      // Fade out then tear down
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
          try { ctx.close(); }  catch { /* ok */ }
          droneRef.current = null;
          ctxRef.current   = null;
        }, 1700);
      }
      setSoundEnabled(false);
      setIsPlaying(false);
    } else {
      // AudioContext MUST be created inside the click handler for iOS Safari
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const start = () => {
        const drone = buildDrone(ctx);
        droneRef.current = drone;
        // Schedule fade-in from current time (ctx is now running)
        const g = drone.master.gain;
        const t = ctx.currentTime;
        g.cancelScheduledValues(t);
        g.setValueAtTime(0, t);
        g.linearRampToValueAtTime(0.60, t + 3.0);
      };

      if (ctx.state === "suspended") {
        ctx.resume().then(start).catch(() => {
          // Fallback: try starting without explicit resume (some browsers auto-resume)
          start();
        });
      } else {
        start();
      }

      setSoundEnabled(true);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card/80 backdrop-blur-sm border border-border-subtle hover:border-hud-border transition-all text-text-muted hover:text-text-primary"
      title={isPlaying ? "Mute ambient sound" : "Play Earth ambient sound"}
    >
      {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
      <span className="text-[11px] hidden sm:inline">
        {isPlaying ? "Earth Ambience" : "Sound Off"}
      </span>
    </button>
  );
}

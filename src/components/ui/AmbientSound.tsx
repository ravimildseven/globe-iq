"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Procedural Earth ambient soundscape using Web Audio API
// Layers: deep Schumann resonance hum, atmospheric wind, harmonic pad
function createEarthSoundscape(ctx: AudioContext): { master: GainNode; stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const nodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  // Layer 1: Deep Earth hum — Schumann resonance harmonics (~7.83Hz base, played at audible octaves)
  const hum1 = ctx.createOscillator();
  hum1.type = "sine";
  hum1.frequency.value = 62.64; // 7.83 * 8 — 3 octaves up for audibility
  const hum1Gain = ctx.createGain();
  hum1Gain.gain.value = 0.12;
  const hum1Filter = ctx.createBiquadFilter();
  hum1Filter.type = "lowpass";
  hum1Filter.frequency.value = 120;
  hum1.connect(hum1Filter).connect(hum1Gain).connect(master);
  hum1.start();
  nodes.push(hum1);

  // Layer 2: Sub-bass drone — very low rumble
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 40;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.08;
  sub.connect(subGain).connect(master);
  sub.start();
  nodes.push(sub);

  // Layer 3: Slow LFO modulating the hum for organic movement
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08; // Very slow wobble
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain).connect(hum1.frequency);
  lfo.start();
  nodes.push(lfo);

  // Layer 4: Harmonic pad — ethereal fifth
  const pad1 = ctx.createOscillator();
  pad1.type = "sine";
  pad1.frequency.value = 130.81; // C3
  const pad1Gain = ctx.createGain();
  pad1Gain.gain.value = 0.04;
  const pad1Filter = ctx.createBiquadFilter();
  pad1Filter.type = "lowpass";
  pad1Filter.frequency.value = 400;
  pad1.connect(pad1Filter).connect(pad1Gain).connect(master);
  pad1.start();
  nodes.push(pad1);

  const pad2 = ctx.createOscillator();
  pad2.type = "sine";
  pad2.frequency.value = 196.0; // G3 — a perfect fifth
  const pad2Gain = ctx.createGain();
  pad2Gain.gain.value = 0.025;
  pad2.connect(pad1Filter).connect(pad2Gain).connect(master);
  pad2.start();
  nodes.push(pad2);

  // Layer 5: Wind/atmosphere — filtered noise
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 300;
  noiseFilter.Q.value = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.015;
  // Slow filter sweep for wind movement
  const windLfo = ctx.createOscillator();
  windLfo.type = "sine";
  windLfo.frequency.value = 0.03;
  const windLfoGain = ctx.createGain();
  windLfoGain.gain.value = 150;
  windLfo.connect(windLfoGain).connect(noiseFilter.frequency);
  windLfo.start();
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start();
  nodes.push(noise, windLfo);

  // Layer 6: High harmonic shimmer — very subtle
  const shimmer = ctx.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.value = 523.25; // C5
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.008;
  const shimmerFilter = ctx.createBiquadFilter();
  shimmerFilter.type = "lowpass";
  shimmerFilter.frequency.value = 600;
  shimmer.connect(shimmerFilter).connect(shimmerGain).connect(master);
  shimmer.start();
  nodes.push(shimmer);

  // Slow volume breathing for the entire mix
  const breathLfo = ctx.createOscillator();
  breathLfo.type = "sine";
  breathLfo.frequency.value = 0.05; // One breath every ~20 seconds
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.02;
  breathLfo.connect(breathGain).connect(master.gain);
  breathLfo.start();
  nodes.push(breathLfo);

  return {
    master,
    stop: () => {
      nodes.forEach((n) => {
        try { n.stop(); } catch {}
      });
    },
  };
}

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundRef = useRef<{ master: GainNode; stop: () => void } | null>(null);

  const toggle = useCallback(() => {
    if (isPlaying) {
      // Fade out
      if (soundRef.current) {
        const g = soundRef.current.master.gain;
        g.linearRampToValueAtTime(0, ctxRef.current!.currentTime + 1.5);
        setTimeout(() => {
          soundRef.current?.stop();
          ctxRef.current?.close();
          ctxRef.current = null;
          soundRef.current = null;
        }, 1600);
      }
      setIsPlaying(false);
    } else {
      // Start
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const sound = createEarthSoundscape(ctx);
      soundRef.current = sound;
      // Fade in
      sound.master.gain.setValueAtTime(0, ctx.currentTime);
      sound.master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

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

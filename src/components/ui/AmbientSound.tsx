"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled } from "@/lib/sound-effects";

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);

    if (isPlaying) {
      setSoundEnabled(false);
      setIsPlaying(false);
      fadeRef.current = setInterval(() => {
        if (audio.volume > 0.06) {
          audio.volume = Math.max(0, audio.volume - 0.06);
        } else {
          audio.volume = 0;
          audio.pause();
          if (fadeRef.current) clearInterval(fadeRef.current);
        }
      }, 80);
    } else {
      audio.volume = 0;
      audio.play().catch(() => {});
      setSoundEnabled(true);
      setIsPlaying(true);
      fadeRef.current = setInterval(() => {
        if (audio.volume < 0.64) {
          audio.volume = Math.min(0.70, audio.volume + 0.05);
        } else {
          if (fadeRef.current) clearInterval(fadeRef.current);
        }
      }, 80);
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

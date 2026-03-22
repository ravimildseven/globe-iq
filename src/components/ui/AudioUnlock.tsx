"use client";
import { useEffect } from "react";
import { initAudio } from "@/lib/sound-effects";

export default function AudioUnlock() {
  useEffect(() => { initAudio(); }, []);
  return null;
}

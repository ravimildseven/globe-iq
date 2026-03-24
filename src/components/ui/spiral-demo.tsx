'use client'
import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'
import { BrandLogo } from "@/components/ui/BrandLogo"

interface SpiralDemoProps {
  onEnter?: () => void;
}

const SpiralDemo = ({ onEnter }: SpiralDemoProps) => {
  const [startVisible, setStartVisible] = useState(false)

  const handleEnter = () => {
    if (onEnter) {
      onEnter();
    } else {
      window.location.href = "/";
    }
  }

  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-50">
      {/* Spiral Animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Brand Logo and Enter Button */}
      <div
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-[1500ms] ease-out flex flex-col items-center gap-8
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="scale-125 sm:scale-150 mb-4">
          <BrandLogo size="lg" />
        </div>
        
        <button
          onClick={handleEnter}
          className="group relative px-8 py-3 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          <span className="relative z-10 text-white/80 text-sm tracking-[0.2em] font-light uppercase transition-all duration-500 group-hover:text-white group-hover:tracking-[0.3em]">
            Enter Experience
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/0 via-accent-blue/10 to-accent-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur" />
        </button>
      </div>
    </div>
  )
}

export { SpiralDemo }

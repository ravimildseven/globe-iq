'use client'
import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'

const SpiralDemo = () => {
  const [startVisible, setStartVisible] = useState(false)

  const navigateToHome = () => {
    window.location.href = "/"
  }

  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Spiral Animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Simple Elegant Text Button with Pulsing Effect */}
      <div
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-[1500ms] ease-out
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <button
          onClick={navigateToHome}
          className="flex flex-col items-center gap-2 group"
        >
          <span className="
            text-white text-3xl tracking-[0.2em] uppercase font-extralight
            transition-all duration-700
            group-hover:tracking-[0.3em] animate-pulse
          ">
            GlobeIQ
          </span>
          <span className="text-white/60 text-xs tracking-widest font-light uppercase">
            Entering to explore World Intelligence
          </span>
        </button>
      </div>
    </div>
  )
}

export { SpiralDemo }

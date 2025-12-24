'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SplineHero() {
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Spline iframe - Full screen */}
      <div className="absolute inset-0">
        <iframe
          src="https://my.spline.design/retrofuturismbganimation-4VeKpSRVq2ctCqEVUsGohYyv/"
          className="w-full h-full"
          style={{ border: 'none' }}
          onLoad={() => setLoaded(true)}
          allow="autoplay"
          title="VeilCredit 3D Hero"
        />
      </div>

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <span className="text-orange-400 text-lg">Loading VeilCredit...</span>
          </div>
        </div>
      )}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Subtle scroll indicator */}
      {loaded && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <span className="text-sm text-orange-300/50 tracking-wider font-light">SCROLL</span>
            <ChevronDown className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
        </div>
      )}
    </section>
  )
}
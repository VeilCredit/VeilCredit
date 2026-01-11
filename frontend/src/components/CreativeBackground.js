'use client'

import { useEffect, useRef } from 'react'

export default function CreativeBackground({ variant = 1 }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    if (variant === 3) {
      // Canvas-based painterly background
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Create organic paint-like blobs
      const drawPaintBlobs = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Base gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#5C0C0B10')
        gradient.addColorStop(0.5, '#7A221415')
        gradient.addColorStop(1, '#964A1610')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Paint blobs
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const radius = 100 + Math.random() * 200
          
          const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
          blobGradient.addColorStop(0, `${i % 2 === 0 ? '#B86C1B' : '#D8933B'}${Math.floor(10 + Math.random() * 10)}`)
          blobGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = blobGradient
          ctx.fill()
        }
      }
      
      drawPaintBlobs()
      const interval = setInterval(drawPaintBlobs, 3000)
      
      return () => clearInterval(interval)
    }
  }, [variant])

  if (variant === 1) {
    // Abstract Geometric Pattern
    return (
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, #5C0C0B40 0px, transparent 50%),
              radial-gradient(circle at 80% 70%, #7A221440 0px, transparent 50%),
              radial-gradient(circle at 40% 80%, #964A1640 0px, transparent 50%)
            `,
            backgroundSize: '50vw 50vw',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(3vw, 2vh) scale(1.05); }
            66% { transform: translate(-2vw, -1vh) scale(0.95); }
          }
        `}</style>
      </div>
    )
  }

  if (variant === 2) {
    // Fluid Marble Effect
    return (
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              conic-gradient(from 0deg at 50% 50%, 
                #5C0C0B, #7A2214, #964A16, #B86C1B, #964A16, #7A2214, #5C0C0B
              )
            `,
            backgroundSize: '800% 800%',
            filter: 'blur(60px)',
            animation: 'marbleRotate 40s linear infinite'
          }}
        />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, transparent 30%, #000 70%)`,
          }}
        />
        <style jsx>{`
          @keyframes marbleRotate {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}</style>
      </div>
    )
  }

  // Variant 3: Canvas-based Paint Splatter
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-15"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 95%, #7A221420 100%),
            linear-gradient(0deg, transparent 95%, #7A221420 100%)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
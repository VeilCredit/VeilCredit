'use client'
import { useEffect, useRef } from 'react'
import SplineHero from '@/components/SplineHero'
import EnhancedAboutProject from '@/components/AboutProject'
import { motion } from 'framer-motion'

export default function Home() {
  const sectionsRef = useRef([])
  const observerRef = useRef(null)

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleSmoothScroll = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (link) {
        e.preventDefault()
        const targetId = link.getAttribute('href')
        if (targetId === '#') return
        
        const target = document.querySelector(targetId)
        if (target) {
          const offset = 80
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
        }
      }
    }

    // Intersection observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up')
            // Add a delay-based stagger for children
            const children = entry.target.querySelectorAll('.stagger-child')
            children.forEach((child, index) => {
              child.style.animationDelay = `${index * 0.1}s`
              child.classList.add('animate-fade-up')
            })
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '-100px 0px -100px 0px'
      }
    )

    // Observe all sections
    sectionsRef.current.forEach((section) => {
      if (section && observerRef.current) {
        observerRef.current.observe(section)
      }
    })

    document.addEventListener('click', handleSmoothScroll)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      document.removeEventListener('click', handleSmoothScroll)
    }
  }, [])

  // Parallax scroll handler
  useEffect(() => {
    const handleParallax = () => {
      const scrolled = window.pageYOffset
      const parallaxElements = document.querySelectorAll('.parallax-element')
      
      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5
        const yPos = -(scrolled * speed)
        element.style.transform = `translate3d(0, ${yPos}px, 0)`
      })
    }

    window.addEventListener('scroll', handleParallax)
    return () => window.removeEventListener('scroll', handleParallax)
  }, [])

  return (
    <div className="relative">
      {/* Page 1: Spline Hero - Full screen immersive animation */}
      <div ref={(el) => sectionsRef.current[0] = el}>
        <SplineHero />
      </div>

      {/* Gradient transition between sections */}
      <div 
        className="h-32 w-full parallax-element"
        data-speed="0.3"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(10, 10, 10, 0.8), #000)'
        }}
      />

      {/* Page 2: Enhanced About Project */}
      <div 
        ref={(el) => sectionsRef.current[1] = el}
        className="relative"
      >
        <EnhancedAboutProject />
      </div>

      {/* Scroll progress indicator */}
      <div className="fixed bottom-8 right-8 z-30">
        <motion.div
          className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full h-full flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #000;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #7A2214, #B86C1B);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #964A16, #D8933B);
        }
      `}</style>
    </div>
  )
}
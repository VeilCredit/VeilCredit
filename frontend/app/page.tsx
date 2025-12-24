// components/HeroSection.tsx
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <Navbar />

      <section className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Decorative Line */}
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-16"></div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Take Control of<br />Your Digital Assets
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto">
            ZBridgeX offers a seamless, secure experience for managing your digital assets.<br />
            Instant transactions, optimized fees, and premium design.
          </p>

          {/* CTA Button */}
          <Link
            href="/deposit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold rounded-full text-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
          >
            Get started now
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </Link>

          {/* Trust Badge */}
          <div className="mt-16">
            <p className="text-gray-500 text-sm mb-2">They trust us</p>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-6 h-6 text-yellow-400 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-2 text-white text-lg font-semibold">4,9</span>
              <span className="text-gray-400 text-lg font-semibold">G</span>
            </div>
          </div>

          {/* Decorative Line Bottom */}
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-16"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
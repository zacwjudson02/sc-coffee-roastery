import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, X } from "lucide-react";

// Global flag that persists during navigation but resets on page refresh
declare global {
  interface Window {
    __welcomeOverlayShown?: boolean;
  }
}

export const WelcomeOverlay = () => {
  // Check if overlay has been shown during this page session (not browser session)
  // This resets on page refresh but persists during SPA navigation
  const [isVisible, setIsVisible] = useState(() => {
    return !window.__welcomeOverlayShown;
  });
  const [showLogo, setShowLogo] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!isVisible) return; // Don't run timers if not visible
    
    // Sequence timing
    // 0s: Start text typing
    // 3s: Text finishes & Show Button
    // 3.5s: Show Logo
    // 8.5s: Auto fade out
    
    const buttonTimer = setTimeout(() => setShowButton(true), 3000);
    const logoTimer = setTimeout(() => setShowLogo(true), 3500);
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      window.__welcomeOverlayShown = true;
    }, 8500);

    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(logoTimer);
      clearTimeout(exitTimer);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    window.__welcomeOverlayShown = true;
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const typewriterVariants = {
    hidden: { width: "0%" },
    visible: { 
      width: "100%",
      transition: { 
        duration: 2.5, 
        ease: "linear",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black text-white min-h-[100dvh] min-h-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
        >
          {/* Main Content Area - Centered, scrollable on small screens */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto overscroll-contain">
            <div className="max-w-4xl px-4 sm:px-6 py-6 sm:py-8 text-center w-full">
              {/* Main Welcome Text - typewriter on desktop, fade on mobile */}
              <div className="mb-5 sm:mb-8 relative inline-block text-center md:text-left max-w-full pb-2">
                 {/* Mobile: Simple fade-in (below md) */}
                 <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, ease: "easeIn" }}
                  className="md:hidden text-xl sm:text-2xl font-mono font-bold tracking-tight text-white/90 leading-tight px-2"
                 >
                   Sunshine Coast Coffee Roastery
                 </motion.h1>

                 {/* Desktop: Typewriter effect (md and up) */}
                 <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "steps(30)" }}
                  className="hidden md:block overflow-hidden border-r-4 border-white/50 pr-2 pb-2 whitespace-nowrap"
                 >
                   <h1 className="text-4xl lg:text-5xl font-mono font-bold tracking-tight text-white/90 leading-normal">
                     Sunshine Coast Coffee Roastery
                   </h1>
                 </motion.div>
              </div>

              {/* Subtitles fading in */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="space-y-1 sm:space-y-2"
              >
                <h2 className="text-base sm:text-lg md:text-2xl text-white/70 font-light px-1">
                  Custom Delivery Management Software Proposal
                </h2>
              </motion.div>

              {/* Logo appearing - stacks on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.9 }}
                transition={{ duration: 1 }}
                className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-3 sm:gap-4"
              >
                <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/40">Proudly Built Locally By</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <Link className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-blue-500 shrink-0" strokeWidth={1.5} />
                  <div className="flex flex-col items-center sm:items-start font-bold text-lg sm:text-2xl md:text-4xl leading-tight text-blue-500 tracking-tight text-center sm:text-left">
                    <span>FACTORY FREIGHT</span>
                    <span>CONNECTIONS</span>
                  </div>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showLogo ? 1 : 0 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="text-white/60 text-xs sm:text-sm md:text-base max-w-lg mt-4 sm:mt-6 font-light px-2"
                >
                  For specialty coffee businesses that want fewer admin hours, cleaner data, and complete delivery visibility.
                </motion.p>
              </motion.div>
            </div>
          </div>

          {/* Skip Button - safe area padding, touch-friendly */}
          <div className="pt-4 flex justify-center items-center shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
              transition={{ duration: 0.6 }}
              onClick={handleClose}
              className="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] rounded-full bg-red-600 border-2 border-white/30 hover:border-white active:scale-95 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 touch-manipulation"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              <span className="sr-only">Skip intro</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;

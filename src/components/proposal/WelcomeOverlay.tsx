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
          className="fixed inset-0 z-50 flex flex-col bg-black text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
        >
          {/* Main Content Area - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl px-6 text-center w-full">
              {/* Main Welcome Text */}
              <div className="mb-8 relative overflow-hidden inline-block text-left">
                 <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "steps(40)" }}
                  className="overflow-hidden whitespace-nowrap border-r-4 border-white/50 pr-2"
                  style={{
                      wordBreak: "keep-all"
                  }}
                 >
                   <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white/90 leading-tight">
                     MENZ Transport
                   </h1>
                 </motion.div>
              </div>

              {/* Subtitles fading in */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="space-y-2"
              >
                <h2 className="text-xl md:text-2xl text-white/70 font-light">
                  Custom Operations Software Proposal
                </h2>
              </motion.div>

              {/* Logo appearing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.9 }}
                transition={{ duration: 1 }}
                className="mt-12 flex flex-col items-center justify-center gap-4"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-white/40">Proudly Built Locally By</p>
                
                <div className="flex items-center gap-4">
                  <Link className="h-12 w-12 md:h-16 md:w-16 text-blue-500" strokeWidth={1.5} />
                  <div className="flex flex-col items-start font-bold text-2xl md:text-4xl leading-tight text-blue-500 tracking-tight">
                    <span>FACTORY FREIGHT</span>
                    <span>CONNECTIONS</span>
                  </div>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showLogo ? 1 : 0 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="text-white/60 text-sm md:text-base max-w-lg mt-6 font-light"
                >
                  For transport businesses that want fewer admin hours, cleaner data, and tighter control.
                </motion.p>
              </motion.div>
            </div>
          </div>

          {/* Skip Button Container - Bottom Center using Flexbox */}
          <div className="pb-8 flex justify-center items-center">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
              transition={{ duration: 0.6 }}
              onClick={handleClose}
              className="w-14 h-14 rounded-full bg-red-600 border-2 border-white/30 hover:border-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
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

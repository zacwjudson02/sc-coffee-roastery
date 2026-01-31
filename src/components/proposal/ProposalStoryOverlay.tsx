import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import BulletList from "@/components/proposal/BulletList";
import { Button } from "@/components/ui/button";

interface ProposalStoryOverlayProps {
  open: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemSlideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const itemJiggle = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      scale: {
        type: "spring",
        stiffness: 200,
        damping: 12
      }
    }
  }
};

const itemBounceIn = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

const slides = [
  {
    id: "executive-why",
    label: "Executive Summary",
    title: "Why This Exists",
    content: (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.p variants={itemSlideIn} className="text-xl md:text-2xl text-white/80 mb-8 font-light leading-relaxed">
          Most transport businesses don't fail because of lack of work — they get slowed down by admin chaos. Bookings in one place, PODs in another, invoices always catching up.
        </motion.p>
        <motion.p variants={itemSlideIn} className="text-lg text-white/60 mb-12">
          This system consolidates bookings, job tracking, PODs, and invoicing into one controlled workflow that mirrors how MENZ already operates.
        </motion.p>
      </motion.div>
    )
  },
  {
    id: "executive-what",
    label: "Executive Summary",
    title: "What This Delivers",
    content: (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/5 p-6 rounded-xl border border-white/10 max-w-2xl mx-auto"
        >
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 text-left"
          >
             {[
               "Reduced admin workload",
               "Faster, more predictable invoicing",
               "Real-time visibility over jobs and cashflow",
               "One system, one set of numbers, no guesswork"
             ].map((item, i) => (
               <motion.li key={i} variants={itemJiggle} className="flex items-start gap-4 text-white/90 text-lg">
                  <span className="text-blue-500 mt-1">●</span>
                  <span>{item}</span>
               </motion.li>
             ))}
          </motion.ul>
        </motion.div>
    )
  },
  {
    id: "reality",
    label: "Current Reality",
    title: "How Operations Run Today",
    content: (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.p variants={itemFadeIn} className="text-xl md:text-2xl text-white/80 mb-8 font-light leading-relaxed">
          Based on our experience in transport operations, most businesses at this scale face similar pressure points that don't show up as one big failure — they show up as constant friction.
        </motion.p>
        <div className="grid gap-4 md:grid-cols-2 text-left">
           {[
             "Bookings finalised under time pressure",
             "Last-minute changes missing updates",
             "PODs scattered across channels",
             "Invoicing delayed by paperwork verification",
             "End-of-period invoicing scrambles"
           ].map((item, i) => (
             <motion.div 
               key={i} 
               variants={itemSlideIn}
               className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center gap-3"
             >
                <span className="text-red-400 text-lg">⚠️</span>
                <span className="text-white/80">{item}</span>
             </motion.div>
           ))}
        </div>
      </motion.div>
    )
  },
  {
    id: "pain-points",
    label: "Key Pain Points",
    title: "Where Time is Lost",
    content: (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left"
      >
        {[
            "Manual data entry across spreadsheets and emails",
            "Missing or delayed PODs holding up invoices",
            "Duplicate handling of the same job data",
            "Limited visibility once trucks are on the road",
            "Admin dependency concentrated on one or two people"
        ].map((point, i) => (
            <motion.div 
              key={i} 
              variants={itemFadeIn}
              className={`p-6 border border-white/10 bg-white/5 rounded-lg ${i === 4 ? "md:col-span-2" : ""}`}
            >
                <p className="text-white/70">{point}</p>
            </motion.div>
        ))}
      </motion.div>
    )
  },
  {
    id: "future",
    label: "Future State",
    title: "After Implementation",
    image: "/Before and after web diagram.png",
    content: (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.p variants={itemFadeIn} className="text-xl text-white/80 mb-8 font-light">
           The goal isn't more software — it's less noise.
        </motion.p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            {[
              "Jobs entered once, tracked to completion",
              "PODs captured and stored against the job",
              "Invoices generated directly from completed work",
              "Management visibility without chasing paperwork"
            ].map((item, i) => (
             <motion.li 
               key={i} 
               variants={itemBounceIn}
               className="flex items-start gap-3 text-white/80 bg-white/5 p-3 rounded border border-white/10"
             >
                <span className="text-green-500 mt-1">✓</span>
                <span>{item}</span>
             </motion.li>
           ))}
        </ul>
      </motion.div>
    )
  },
  {
    id: "system",
    label: "System Overview",
    title: "Core MVP Features",
    image: "/Core Features web diagram.png",
    content: (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8"
        >
            {[
                { t: "Booking & Job Management", d: "Log once. Flow through." },
                { t: "POD Capture & Storage", d: "Digitally captured & tagged." },
                { t: "Invoicing Logic", d: "Generated from jobs." },
                { t: "Customer Records", d: "Centralised rates & data." },
                { t: "Basic Reporting", d: "Operational visibility." }
            ].map((box, i) => (
                <motion.div 
                  key={i} 
                  variants={itemJiggle}
                  className="bg-orange-500/10 p-4 rounded border border-orange-500/20 hover:border-orange-500/40 transition-colors h-full flex flex-col"
                >
                    <div className="text-orange-400 font-bold text-base mb-3 break-words">{box.t}</div>
                    <div className="text-white/70 text-sm leading-snug mt-auto">{box.d}</div>
                </motion.div>
            ))}
        </motion.div>
    )
  },
  {
      id: "roi",
      label: "ROI & Leverage",
      title: "What You Gain",
      image: "/ROI web diagram.png",
      content: (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 text-left"
          >
              {[
                  { t: "Admin Hours Saved", d: "Manual entry reduced." },
                  { t: "Faster Invoicing", d: "Cash hits faster." },
                  { t: "Reduced Errors", d: "One set of numbers." },
                  { t: "Management Clarity", d: "Decisions on facts." }
              ].map((box, i) => (
                <motion.div 
                  key={i} 
                  variants={itemSlideIn}
                  className="bg-white/5 p-4 rounded border border-white/10"
                >
                    <div className="text-green-400 font-bold text-sm mb-1">{box.t}</div>
                    <div className="text-white/60 text-xs">{box.d}</div>
                </motion.div>
            ))}
          </motion.div>
      )
  },
  {
      id: "timeline",
      label: "Deployment",
      title: "Controlled 4-Week Rollout",
      image: "/deployment web diagram.png",
      content: (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-left bg-white/5 p-6 rounded-xl border border-white/10"
          >
              <motion.h4 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-white font-semibold mb-4"
              >
                Parallel Running Strategy
              </motion.h4>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/70 mb-4 text-sm"
              >
                  We run old and new systems side-by-side. No switch is flipped until figures match and the team is confident.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap gap-2"
              >
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">✓ Team Trained</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">✓ Jobs Flowing</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">✓ Invoices Correct</span>
              </motion.div>
          </motion.div>
      )
  },
  {
      id: "next",
      label: "Next Steps",
      title: "Let's Get Started",
      content: (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center space-y-8"
          >
              <motion.p variants={itemFadeIn} className="text-xl text-white/80 text-center max-w-2xl font-light">
                  If this direction makes sense, the next step is a working session to confirm scope, timing, and rollout details.
              </motion.p>
              
              <motion.div 
                variants={itemBounceIn}
                className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-lg"
              >
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to move forward?</h3>
                  <p className="text-white/60 mb-8">No pressure. No lock-in. Just clarity.</p>
                  
                  <div className="space-y-4">
                     <p className="text-sm text-white/50">Contact us at <span className="text-white">contact@factoryfreightconnections.com</span></p>
                  </div>
              </motion.div>
          </motion.div>
      )
  }
];

export const ProposalStoryOverlay = ({ open, onClose }: ProposalStoryOverlayProps) => {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  // Keyboard navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!open) return;
          if (e.key === "ArrowRight") nextSlide();
          if (e.key === "ArrowLeft") prevSlide();
          if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, index]);

  const nextSlide = () => {
      if (index < slides.length - 1) setIndex(index + 1);
  };

  const prevSlide = () => {
      if (index > 0) setIndex(index - 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black text-white flex flex-col"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.5, ease: "circOut" }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 z-10">
             <div className="flex items-center gap-3">
                 <span className="text-blue-500 font-bold tracking-tight">STRATEGY</span>
                 <span className="text-white/30">|</span>
                 <span className="text-white/60 text-sm uppercase tracking-widest">{slide.label}</span>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <X className="w-6 h-6 text-white/70" />
             </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto md:overflow-hidden relative">
             <motion.div 
               key={index}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.4 }}
               className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
             >
                 {/* Text Side */}
                 <div className={`order-2 md:order-1 ${!slide.image ? "md:col-span-2 md:text-center max-w-4xl mx-auto" : ""}`}>
                     <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                        {slide.title}
                     </h2>
                     <div className="text-white/90">
                        {slide.content}
                     </div>
                 </div>

                 {/* Image Side (if exists) */}
                 {slide.image && (
                     <div className="order-1 md:order-2">
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          src={slide.image} 
                          alt={slide.title}
                          className="w-full rounded-lg shadow-2xl border border-white/10 bg-white/5"
                        />
                     </div>
                 )}
             </motion.div>
          </div>

          {/* Bottom Navigation */}
          <div className="p-6 md:p-8 flex items-center justify-between z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
             <div className="flex gap-2">
                 {slides.map((_, i) => (
                     <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-blue-500" : "w-1.5 bg-white/20"}`}
                     />
                 ))}
             </div>

             <div className="flex gap-4">
                 <Button 
                   variant="ghost" 
                   className="text-white hover:text-white hover:bg-white/10 gap-2"
                   onClick={prevSlide}
                   disabled={index === 0}
                 >
                     <ChevronLeft className="w-4 h-4" /> Back
                 </Button>
                 {index < slides.length - 1 ? (
                     <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                        onClick={nextSlide}
                     >
                        Next <ChevronRight className="w-4 h-4" />
                     </Button>
                 ) : (
                     <Button 
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
                        onClick={onClose}
                     >
                        Finish <X className="w-4 h-4" />
                     </Button>
                 )}
             </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProposalStoryOverlay;

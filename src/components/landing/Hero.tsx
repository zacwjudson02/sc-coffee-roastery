 import { motion } from "framer-motion";
 import { ArrowRight, Snowflake, Shield, Clock } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import heroTruck from "@/assets/hero-truck.jpg";
 
 const FrostParticle = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
   <motion.div
     className="absolute w-2 h-2 rounded-full bg-accent/30"
     style={{ left: x, top: y }}
     initial={{ opacity: 0, scale: 0 }}
     animate={{
       opacity: [0, 0.6, 0],
       scale: [0, 1, 0.5],
       x: [0, Math.random() * 40 - 20],
       y: [0, Math.random() * -30 - 10],
     }}
     transition={{
       duration: 3,
       delay,
       repeat: Infinity,
       repeatDelay: Math.random() * 2,
     }}
   />
 );
 
 export const Hero = () => {
   return (
     <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroTruck}
          alt="Menz refrigerated transport truck on highway"
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
      </div>
 
       {/* Frost Particles */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {[...Array(15)].map((_, i) => (
           <FrostParticle
             key={i}
             delay={i * 0.3}
             x={`${10 + Math.random() * 80}%`}
             y={`${20 + Math.random() * 60}%`}
           />
         ))}
       </div>
 
       {/* Grid Overlay */}
       <div className="absolute inset-0 grid-overlay opacity-30" />
 
       {/* Content */}
       <div className="container relative z-10 mx-auto px-4 lg:px-8 pt-24 pb-16">
         <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm border border-accent/20 mb-8 shadow-lg"
          >
            <Snowflake className="h-4 w-4 text-accent animate-frost-drift" />
            <span className="text-sm font-bold text-primary">
              Temperature-Controlled Excellence
            </span>
          </motion.div>
 
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl"
          >
            Precision Refrigerated{" "}
            <span className="text-accent drop-shadow-lg">Transport</span> You Can Trust
          </motion.h1>
 
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed drop-shadow-lg"
          >
            Reliable temperature-controlled freight solutions across Southeast
            Queensland and Northern NSW. From single pallets to full loads, we
            keep your cargo at the perfect temperature.
          </motion.p>
 
           {/* CTAs */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="flex flex-col sm:flex-row gap-4 mb-16"
           >
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-primary font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group shadow-xl"
            >
              <a href="#contact">
                Get a Free Quote
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg"
            >
              <a href="#services">Our Services</a>
            </Button>
           </motion.div>
 
           {/* Trust Indicators */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="grid grid-cols-1 sm:grid-cols-3 gap-6"
           >
            {[
              { icon: Snowflake, label: "-25°C to +25°C", sublabel: "Temperature Range" },
              { icon: Shield, label: "HACCP Certified", sublabel: "Food Safety Compliant" },
              { icon: Clock, label: "24/7 Operations", sublabel: "Always Available" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
              >
                <div className="p-3 rounded-lg bg-accent/15">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-primary">{item.label}</p>
                  <p className="text-sm text-primary/70">{item.sublabel}</p>
                </div>
              </div>
            ))}
           </motion.div>
         </div>
       </div>
 
       {/* Bottom Gradient Fade */}
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
     </section>
   );
 };

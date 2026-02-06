 import { motion, useInView } from "framer-motion";
 import { useRef, useState } from "react";
 import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
 import { Button } from "@/components/ui/button";
 
 const testimonials = [
   {
     quote:
       "Menz has been our trusted refrigerated transport partner for over three years. Their reliability and temperature control precision is unmatched.",
     author: "Sarah Mitchell",
     role: "Operations Manager",
     company: "Fresh Foods QLD",
   },
   {
     quote:
       "When we needed urgent cold chain transport, Menz delivered. Professional service, real-time tracking, and our products arrived in perfect condition.",
     author: "David Chen",
     role: "Supply Chain Director",
     company: "Coastal Produce",
   },
   {
     quote:
       "The team at Menz understands the importance of maintaining temperature integrity. They've never let us down on a delivery.",
     author: "Emma Thompson",
     role: "Quality Assurance Lead",
     company: "Premium Dairy Co",
   },
 ];
 
 export const Testimonials = () => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const headerRef = useRef(null);
   const isHeaderInView = useInView(headerRef, { once: true });
 
   const nextTestimonial = () => {
     setCurrentIndex((prev) => (prev + 1) % testimonials.length);
   };
 
   const prevTestimonial = () => {
     setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
   };
 
   return (
     <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
       <div className="absolute inset-0 grid-overlay opacity-50" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         {/* Header */}
         <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
           <motion.span
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
           >
             Client Testimonials
           </motion.span>
           <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.1 }}
             className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
           >
             Trusted by Leading{" "}
             <span className="gradient-text-ice">Businesses</span>
           </motion.h2>
         </div>
 
         {/* Testimonial Slider */}
         <div className="max-w-4xl mx-auto">
           <motion.div
             key={currentIndex}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="relative"
           >
             {/* Quote Card */}
             <div className="industrial-card p-8 md:p-12 text-center relative">
               {/* Quote Icon */}
               <div className="absolute top-6 left-6 opacity-10">
                 <Quote className="h-16 w-16 text-accent" />
               </div>
 
               {/* Quote Text */}
               <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-8 relative z-10">
                 "{testimonials[currentIndex].quote}"
               </p>
 
               {/* Author */}
               <div className="flex flex-col items-center">
                 <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                   <span className="text-lg font-bold text-accent">
                     {testimonials[currentIndex].author.charAt(0)}
                   </span>
                 </div>
                 <p className="font-semibold text-foreground">
                   {testimonials[currentIndex].author}
                 </p>
                 <p className="text-sm text-muted-foreground">
                   {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                 </p>
               </div>
             </div>
           </motion.div>
 
           {/* Navigation */}
           <div className="flex items-center justify-center gap-4 mt-8">
             <Button
               variant="outline"
               size="icon"
               onClick={prevTestimonial}
               className="rounded-full border-border hover:border-accent hover:text-accent"
             >
               <ChevronLeft className="h-5 w-5" />
             </Button>
 
             {/* Dots */}
             <div className="flex gap-2">
               {testimonials.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentIndex(index)}
                   className={`w-2 h-2 rounded-full transition-all ${
                     index === currentIndex
                       ? "w-8 bg-accent"
                       : "bg-border hover:bg-accent/50"
                   }`}
                 />
               ))}
             </div>
 
             <Button
               variant="outline"
               size="icon"
               onClick={nextTestimonial}
               className="rounded-full border-border hover:border-accent hover:text-accent"
             >
               <ChevronRight className="h-5 w-5" />
             </Button>
           </div>
         </div>
       </div>
     </section>
   );
 };

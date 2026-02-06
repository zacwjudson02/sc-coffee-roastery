 import { motion, useInView } from "framer-motion";
 import { useRef } from "react";
 import { Shield, Award, FileCheck, Leaf } from "lucide-react";
 
 const certifications = [
   {
     icon: Shield,
     name: "HACCP Certified",
     description: "Hazard Analysis Critical Control Point certification for food safety management.",
     badge: "Food Safety",
   },
   {
     icon: Award,
     name: "Safe Food QLD",
     description: "Fully compliant with Queensland food safety regulations and standards.",
     badge: "State Compliant",
   },
   {
     icon: FileCheck,
     name: "National Standards",
     description: "Meeting all Australian national transport and logistics industry standards.",
     badge: "National",
   },
   {
     icon: Leaf,
     name: "Environmental Care",
     description: "Committed to sustainable practices and reducing our environmental footprint.",
     badge: "Eco-Friendly",
   },
 ];
 
 export const Trust = () => {
   const headerRef = useRef(null);
   const isHeaderInView = useInView(headerRef, { once: true });
 
   return (
     <section id="about" className="py-24 lg:py-32 section-dark relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 grid-overlay opacity-10" />
       <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         {/* Header */}
         <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
           <motion.span
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
           >
             Trust & Compliance
           </motion.span>
           <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.1 }}
             className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6"
           >
             Certified for Your{" "}
             <span className="gradient-text-ice">Peace of Mind</span>
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.2 }}
             className="text-lg text-primary-foreground/70"
           >
             We maintain the highest industry standards and certifications,
             ensuring your cargo is in safe, compliant hands every step of the way.
           </motion.p>
         </div>
 
         {/* Certifications Grid */}
         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {certifications.map((cert, index) => (
             <motion.div
               key={cert.name}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: index * 0.1 }}
               className="group relative"
             >
               <div className="industrial-card p-6 text-center h-full bg-primary/50 border-primary-foreground/10 hover:border-accent/30">
                 {/* Badge */}
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                   <span className="px-3 py-1 text-xs font-semibold text-accent bg-accent/10 rounded-full border border-accent/30">
                     {cert.badge}
                   </span>
                 </div>
 
                 {/* Icon */}
                 <div className="relative mx-auto mb-4 w-16 h-16 mt-2">
                   <div className="absolute inset-0 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors" />
                   <div className="absolute inset-2 rounded-full bg-primary flex items-center justify-center">
                     <cert.icon className="h-6 w-6 text-accent" />
                   </div>
                   <motion.div
                     className="absolute inset-0 rounded-full border-2 border-accent/30"
                     initial={{ scale: 0.8, opacity: 0 }}
                     whileInView={{ scale: 1, opacity: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.3 + index * 0.1 }}
                   />
                 </div>
 
                 {/* Content */}
                 <h3 className="text-base font-display font-bold text-primary-foreground mb-2">
                   {cert.name}
                 </h3>
                 <p className="text-xs text-primary-foreground/60 leading-relaxed">
                   {cert.description}
                 </p>
               </div>
             </motion.div>
           ))}
         </div>
 
         {/* Trust Stats */}
         <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4 }}
           className="mt-16 p-8 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10"
         >
           <div className="grid md:grid-cols-3 gap-8 text-center">
             {[
               { value: "0", suffix: "", label: "Product Failures", emphasis: "Zero" },
               { value: "100", suffix: "%", label: "Compliance Rate", emphasis: "Full" },
               { value: "24/7", suffix: "", label: "Temperature Monitoring", emphasis: "Real-time" },
             ].map((stat, index) => (
               <div key={index}>
                 <div className="text-4xl md:text-5xl font-display font-bold text-accent mb-1">
                   {stat.emphasis === "Zero" ? (
                     <span className="text-green-400">{stat.value}</span>
                   ) : (
                     <>
                       {stat.value}
                       <span className="text-accent">{stat.suffix}</span>
                     </>
                   )}
                 </div>
                 <p className="text-primary-foreground/60">{stat.label}</p>
               </div>
             ))}
           </div>
         </motion.div>
       </div>
     </section>
   );
 };

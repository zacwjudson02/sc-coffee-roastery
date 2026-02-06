 import { motion } from "framer-motion";
 import { useInView } from "framer-motion";
 import { useRef } from "react";
 import {
   Snowflake,
   Truck,
   Thermometer,
   Package,
   ArrowRight,
 } from "lucide-react";
 
 const services = [
   {
     icon: Snowflake,
     title: "Refrigerated Freight",
     description:
       "Temperature-controlled transport from -25°C to +25°C. Perfect for perishables, pharmaceuticals, and temperature-sensitive goods.",
     features: ["Real-time temperature monitoring", "HACCP compliant", "GPS tracking"],
   },
   {
     icon: Truck,
     title: "General Freight",
     description:
       "Reliable general freight services for non-temperature-sensitive cargo. Same dedication to timeliness and care.",
     features: ["Flexible scheduling", "Secure handling", "Competitive rates"],
   },
   {
     icon: Thermometer,
     title: "Temperature Controlled Logistics",
     description:
       "End-to-end cold chain management ensuring your products maintain integrity from pickup to delivery.",
     features: ["Chain of custody", "Temperature logging", "Compliance reporting"],
   },
   {
     icon: Package,
     title: "Pallet & Bulk Transport",
     description:
       "From single pallets to full trailer loads, we handle shipments of all sizes with the same professional care.",
     features: ["Palletised freight", "Bulk deliveries", "Consolidated loads"],
   },
 ];
 
 const ServiceCard = ({
   service,
   index,
 }: {
   service: (typeof services)[0];
   index: number;
 }) => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   return (
     <motion.div
       ref={ref}
       initial={{ opacity: 0, y: 40 }}
       animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
       transition={{ delay: index * 0.15, duration: 0.5 }}
       className="group industrial-card p-8 hover:border-accent/30"
     >
       {/* Icon */}
       <div className="relative mb-6">
         <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
           <service.icon className="h-7 w-7 text-accent" />
         </div>
         <div className="absolute inset-0 w-14 h-14 rounded-xl bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>
 
       {/* Content */}
       <h3 className="text-xl font-display font-bold text-foreground mb-3">
         {service.title}
       </h3>
       <p className="text-muted-foreground mb-6 leading-relaxed">
         {service.description}
       </p>
 
       {/* Features */}
       <ul className="space-y-2 mb-6">
         {service.features.map((feature, i) => (
           <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
             <div className="w-1.5 h-1.5 rounded-full bg-accent" />
             {feature}
           </li>
         ))}
       </ul>
 
       {/* Link */}
       <a
         href="#contact"
         className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all"
       >
         Learn More
         <ArrowRight className="h-4 w-4" />
       </a>
     </motion.div>
   );
 };
 
 export const Services = () => {
   const headerRef = useRef(null);
   const isHeaderInView = useInView(headerRef, { once: true });
 
   return (
     <section id="services" className="py-24 lg:py-32 bg-background relative">
       <div className="absolute inset-0 grid-overlay opacity-50" />
       
       <div className="container relative mx-auto px-4 lg:px-8">
         {/* Header */}
         <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
           <motion.span
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
           >
             Our Services
           </motion.span>
           <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.1 }}
             className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
           >
             Complete Cold Chain{" "}
             <span className="gradient-text-ice">Solutions</span>
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.2 }}
             className="text-lg text-muted-foreground"
           >
             From refrigerated transport to general freight, we deliver reliability
             and precision across every service we offer.
           </motion.p>
         </div>
 
         {/* Service Cards */}
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {services.map((service, index) => (
             <ServiceCard key={service.title} service={service} index={index} />
           ))}
         </div>
       </div>
     </section>
   );
 };

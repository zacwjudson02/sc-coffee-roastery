import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Thermometer, Weight, Gauge, Check, Truck, PackageOpen, Container, Package } from "lucide-react";
 
const fleetData = [
  {
    name: "Vans",
    capacity: "1-4 Pallets",
    tempRange: "-25°C to +25°C",
    payload: "Up to 1.5T",
    icon: PackageOpen,
    iconColor: "text-accent",
    features: ["Urban deliveries", "Express service", "Tight access locations"],
  },
  {
    name: "Medium Trucks",
    capacity: "6-10 Pallets",
    tempRange: "-25°C to +25°C",
    payload: "Up to 6T",
    icon: Truck,
    iconColor: "text-accent",
    features: ["Regional routes", "Multi-drop capability", "Tailgate equipped"],
  },
  {
    name: "Large Trucks & Trailers",
    capacity: "22-30 Pallets",
    tempRange: "-25°C to +25°C",
    payload: "Up to 28T",
    icon: Container,
    iconColor: "text-accent",
    features: ["Full load transport", "Interstate capable", "Dual temperature zones"],
  },
  {
    name: "Pallet Freight",
    capacity: "Single Pallets",
    tempRange: "-25°C to +25°C",
    payload: "Flexible",
    icon: Package,
    iconColor: "text-accent",
    features: ["LTL shipments", "Shared loads", "Cost-effective", "Weekly scheduled runs"],
  },
];
 
const FleetCard = ({
  vehicle,
  index,
}: {
  vehicle: (typeof fleetData)[0];
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1 }}
      className="industrial-card p-6 transition-all duration-300 hover:border-accent/30 h-full"
    >
      {/* Vehicle Icon */}
      <div className="mb-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
          <vehicle.icon className={`h-8 w-8 ${vehicle.iconColor}`} strokeWidth={2} />
        </div>
      </div>
 
       {/* Name */}
       <h3 className="text-xl font-display font-bold text-foreground mb-4">
         {vehicle.name}
       </h3>
 
       {/* Specs */}
       <div className="space-y-3">
         <div className="flex items-center gap-3 text-sm">
           <div className="p-2 rounded-lg bg-accent/10">
             <Gauge className="h-4 w-4 text-accent" />
           </div>
           <span className="text-muted-foreground">{vehicle.capacity}</span>
         </div>
         <div className="flex items-center gap-3 text-sm">
           <div className="p-2 rounded-lg bg-accent/10">
             <Thermometer className="h-4 w-4 text-accent" />
           </div>
           <span className="text-muted-foreground">{vehicle.tempRange}</span>
         </div>
         <div className="flex items-center gap-3 text-sm">
           <div className="p-2 rounded-lg bg-accent/10">
             <Weight className="h-4 w-4 text-accent" />
           </div>
           <span className="text-muted-foreground">{vehicle.payload}</span>
         </div>
       </div>
 
      {/* Features */}
      <div className="pt-4 mt-4 border-t border-border">
        <ul className="space-y-2">
          {vehicle.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-accent flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
     </motion.div>
   );
 };
 
export const Fleet = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="fleet" className="py-24 lg:py-32 section-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-overlay opacity-10" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
          >
            Our Fleet
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6"
          >
            Modern Fleet for{" "}
            <span className="gradient-text-ice">Every Need</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary-foreground/70"
          >
            From small urban deliveries to full interstate loads, our diverse
            fleet is equipped to handle your refrigerated freight needs.
          </motion.p>
        </div>

        {/* Fleet Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetData.map((vehicle, index) => (
            <FleetCard
              key={vehicle.name}
              vehicle={vehicle}
              index={index}
            />
          ))}
        </div>
 
         {/* Stats */}
         <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4 }}
           className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
         >
           {[
             { value: "20+", label: "Vehicles" },
             { value: "99.5%", label: "On-Time Delivery" },
             { value: "24/7", label: "Operations" },
             { value: "15+", label: "Years Experience" },
           ].map((stat, index) => (
             <div key={index} className="text-center">
               <div className="text-3xl md:text-4xl font-display font-bold text-accent mb-2">
                 {stat.value}
               </div>
               <div className="text-sm text-primary-foreground/60">{stat.label}</div>
             </div>
           ))}
         </motion.div>
       </div>
     </section>
   );
 };

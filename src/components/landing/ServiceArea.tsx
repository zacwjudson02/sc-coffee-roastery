import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Truck, Clock } from "lucide-react";
import serviceAreaMap from "/Menz Service area graphic.png";
 
const locations = [
  { name: "Brisbane Metro", coords: { x: 68, y: 52 }, deliveries: "Same Day" },
  { name: "Gold Coast", coords: { x: 73, y: 72 }, deliveries: "Same Day" },
  { name: "Sunshine Coast", coords: { x: 62, y: 28 }, deliveries: "Same Day" },
  { name: "Northern Rivers", coords: { x: 68, y: 82 }, deliveries: "Next Day" },
  { name: "Toowoomba", coords: { x: 35, y: 48 }, deliveries: "Same Day" },
  { name: "Ipswich", coords: { x: 52, y: 52 }, deliveries: "Same Day" },
];
 
 const MapNode = ({
   location,
   index,
 }: {
   location: (typeof locations)[0];
   index: number;
 }) => {
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0 }}
       whileInView={{ opacity: 1, scale: 1 }}
       viewport={{ once: true }}
       transition={{ delay: 0.5 + index * 0.15, type: "spring" }}
       className="absolute group"
       style={{ left: `${location.coords.x}%`, top: `${location.coords.y}%` }}
     >
       {/* Pulse Ring */}
       <div className="absolute inset-0 -m-4 w-8 h-8 rounded-full bg-accent/30 animate-glow-pulse" />
       
      {/* Node */}
      <div className="relative w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-accent shadow-ice cursor-pointer">
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
      </div>
 
       {/* Tooltip */}
       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
         <div className="frost-glass px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
           <p className="font-semibold text-foreground text-sm">{location.name}</p>
           <p className="text-xs text-accent">{location.deliveries} Delivery</p>
         </div>
       </div>
     </motion.div>
   );
 };
 
 export const ServiceArea = () => {
   const headerRef = useRef(null);
   const isHeaderInView = useInView(headerRef, { once: true });
 
   return (
     <section id="coverage" className="py-24 lg:py-32 bg-background relative overflow-hidden">
       <div className="absolute inset-0 grid-overlay opacity-50" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
           {/* Content */}
           <div ref={headerRef}>
             <motion.span
               initial={{ opacity: 0, y: 20 }}
               animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
               className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
             >
               Service Coverage
             </motion.span>
             <motion.h2
               initial={{ opacity: 0, y: 20 }}
               animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
               transition={{ delay: 0.1 }}
               className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
             >
               Covering Southeast{" "}
               <span className="gradient-text-ice">Queensland</span>
             </motion.h2>
             <motion.p
               initial={{ opacity: 0, y: 20 }}
               animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
               transition={{ delay: 0.2 }}
               className="text-lg text-muted-foreground mb-8"
             >
               Our strategic location enables efficient coverage across the
               Brisbane Metro area, Gold Coast, Sunshine Coast, and Northern NSW
               regions with reliable same-day and next-day delivery options.
             </motion.p>
 
             {/* Location List */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
               transition={{ delay: 0.3 }}
               className="grid sm:grid-cols-2 gap-4"
             >
               {locations.map((location, index) => (
                 <div
                   key={location.name}
                   className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50"
                 >
                   <div className="p-2 rounded-lg bg-accent/10">
                     <MapPin className="h-5 w-5 text-accent" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">{location.name}</p>
                     <p className="text-sm text-muted-foreground">
                       {location.deliveries} Delivery
                     </p>
                   </div>
                 </div>
               ))}
             </motion.div>
 
             {/* CTA */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
               transition={{ delay: 0.4 }}
               className="flex flex-wrap gap-6 mt-8"
             >
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Truck className="h-5 w-5 text-accent" />
                 <span>Daily scheduled runs</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Clock className="h-5 w-5 text-accent" />
                 <span>Flexible pickup times</span>
               </div>
             </motion.div>
           </div>
 
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="aspect-square max-w-lg mx-auto relative w-full">
              {/* Map Background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-2xl border-2 border-accent/20">
                {/* Actual Map Image */}
                <motion.img
                  src={serviceAreaMap}
                  alt="Southeast Queensland Service Area"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                />

                {/* Location Nodes */}
                {locations.map((location, index) => (
                  <MapNode key={location.name} location={location} index={index} />
                ))}
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl -z-10" />
            </div>
          </motion.div>
         </div>
       </div>
     </section>
   );
 };

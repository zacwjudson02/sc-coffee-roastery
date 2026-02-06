 import { motion, useInView } from "framer-motion";
 import { useRef, useState } from "react";
 import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 
 const contactInfo = [
   {
     icon: Phone,
     label: "Phone",
     value: "1300 MENZ",
     href: "tel:1300636900",
   },
   {
     icon: Mail,
     label: "Email",
     value: "freight@menz.com.au",
     href: "mailto:freight@menz.com.au",
   },
   {
     icon: MapPin,
     label: "Location",
     value: "Brisbane, QLD",
     href: "#",
   },
   {
     icon: Clock,
     label: "Hours",
     value: "24/7 Operations",
     href: "#",
   },
 ];
 
 export const Contact = () => {
   const [isSubmitted, setIsSubmitted] = useState(false);
   const headerRef = useRef(null);
   const isHeaderInView = useInView(headerRef, { once: true });
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitted(true);
     setTimeout(() => setIsSubmitted(false), 3000);
   };
 
   return (
     <section id="contact" className="py-24 lg:py-32 bg-background relative overflow-hidden">
       <div className="absolute inset-0 grid-overlay opacity-50" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         {/* Header */}
         <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
           <motion.span
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4"
           >
             Get In Touch
           </motion.span>
           <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.1 }}
             className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"
           >
             Request a{" "}
             <span className="gradient-text-ice">Free Quote</span>
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
             transition={{ delay: 0.2 }}
             className="text-lg text-muted-foreground"
           >
             Ready to streamline your refrigerated freight? Get in touch for a
             no-obligation quote tailored to your needs.
           </motion.p>
         </div>
 
         <div className="grid lg:grid-cols-5 gap-12">
           {/* Contact Info */}
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="lg:col-span-2 space-y-6"
           >
             {contactInfo.map((item, index) => (
               <motion.a
                 key={item.label}
                 href={item.href}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-frost transition-all group"
               >
                 <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                   <item.icon className="h-6 w-6 text-accent" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">{item.label}</p>
                   <p className="font-semibold text-foreground">{item.value}</p>
                 </div>
               </motion.a>
             ))}
 
             {/* Map Placeholder */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4 }}
               className="aspect-video rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border/50 overflow-hidden relative"
             >
               <div className="absolute inset-0 grid-overlay opacity-30" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center">
                   <MapPin className="h-10 w-10 text-accent mx-auto mb-2" />
                   <p className="text-sm text-muted-foreground">Brisbane, QLD</p>
                 </div>
               </div>
             </motion.div>
           </motion.div>
 
           {/* Contact Form */}
           <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="lg:col-span-3"
           >
             <div className="industrial-card p-8">
               {isSubmitted ? (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex flex-col items-center justify-center py-12"
                 >
                   <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                     <CheckCircle className="h-8 w-8 text-green-500" />
                   </div>
                   <h3 className="text-xl font-display font-bold text-foreground mb-2">
                     Quote Request Received!
                   </h3>
                   <p className="text-muted-foreground text-center">
                     We'll be in touch within 24 hours with your customised quote.
                   </p>
                 </motion.div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-foreground mb-2">
                         Full Name
                       </label>
                       <Input
                         placeholder="John Smith"
                         className="bg-background"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-foreground mb-2">
                         Company
                       </label>
                       <Input
                         placeholder="Your Company"
                         className="bg-background"
                       />
                     </div>
                   </div>
 
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-foreground mb-2">
                         Email
                       </label>
                       <Input
                         type="email"
                         placeholder="john@company.com"
                         className="bg-background"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-foreground mb-2">
                         Phone
                       </label>
                       <Input
                         type="tel"
                         placeholder="0400 000 000"
                         className="bg-background"
                         required
                       />
                     </div>
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-2">
                       Freight Type
                     </label>
                     <Select>
                       <SelectTrigger className="bg-background">
                         <SelectValue placeholder="Select freight type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="refrigerated">Refrigerated Freight</SelectItem>
                         <SelectItem value="general">General Freight</SelectItem>
                         <SelectItem value="temperature">Temperature Controlled</SelectItem>
                         <SelectItem value="pallet">Pallet Transport</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-2">
                       Message
                     </label>
                     <Textarea
                       placeholder="Tell us about your freight requirements..."
                       className="bg-background min-h-[120px]"
                       required
                     />
                   </div>
 
                   <Button
                     type="submit"
                     size="lg"
                     className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                   >
                     <Send className="h-5 w-5 mr-2" />
                     Request Quote
                   </Button>
                 </form>
               )}
             </div>
           </motion.div>
         </div>
       </div>
     </section>
   );
 };

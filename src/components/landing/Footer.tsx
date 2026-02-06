 import { Snowflake, Phone, Mail, MapPin } from "lucide-react";
 
 const footerLinks = {
   services: [
     { label: "Refrigerated Freight", href: "#services" },
     { label: "General Freight", href: "#services" },
     { label: "Temperature Controlled", href: "#services" },
     { label: "Pallet Transport", href: "#services" },
   ],
   company: [
     { label: "About Us", href: "#about" },
     { label: "Our Fleet", href: "#fleet" },
     { label: "Service Areas", href: "#coverage" },
     { label: "Contact", href: "#contact" },
   ],
   coverage: [
     { label: "Brisbane Metro", href: "#coverage" },
     { label: "Gold Coast", href: "#coverage" },
     { label: "Sunshine Coast", href: "#coverage" },
     { label: "Northern Rivers", href: "#coverage" },
   ],
 };
 
 export const Footer = () => {
   return (
     <footer className="bg-primary text-primary-foreground relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 grid-overlay opacity-5" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         {/* Main Footer */}
         <div className="py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-12">
           {/* Brand */}
           <div className="lg:col-span-2">
             <a href="#" className="flex items-center gap-3 mb-6">
               <div className="relative">
                 <Snowflake className="h-10 w-10 text-accent" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xl font-display font-bold tracking-tight">
                   MENZ
                 </span>
                 <span className="text-[10px] font-medium text-accent uppercase tracking-[0.2em]">
                   Refrigerated Transport
                 </span>
               </div>
             </a>
             <p className="text-primary-foreground/70 mb-6 max-w-sm">
               Your trusted partner for refrigerated and general freight transport
               across Southeast Queensland and Northern NSW.
             </p>
             <div className="space-y-3">
               <a
                 href="tel:1300636900"
                 className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
               >
                 <Phone className="h-4 w-4" />
                 1300 MENZ
               </a>
               <a
                 href="mailto:freight@menz.com.au"
                 className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
               >
                 <Mail className="h-4 w-4" />
                 freight@menz.com.au
               </a>
               <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                 <MapPin className="h-4 w-4" />
                 Brisbane, Queensland
               </div>
             </div>
           </div>
 
           {/* Services */}
           <div>
             <h4 className="font-display font-semibold mb-4">Services</h4>
             <ul className="space-y-3">
               {footerLinks.services.map((link) => (
                 <li key={link.label}>
                   <a
                     href={link.href}
                     className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                   >
                     {link.label}
                   </a>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Company */}
           <div>
             <h4 className="font-display font-semibold mb-4">Company</h4>
             <ul className="space-y-3">
               {footerLinks.company.map((link) => (
                 <li key={link.label}>
                   <a
                     href={link.href}
                     className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                   >
                     {link.label}
                   </a>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Coverage */}
           <div>
             <h4 className="font-display font-semibold mb-4">Coverage</h4>
             <ul className="space-y-3">
               {footerLinks.coverage.map((link) => (
                 <li key={link.label}>
                   <a
                     href={link.href}
                     className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                   >
                     {link.label}
                   </a>
                 </li>
               ))}
             </ul>
           </div>
         </div>
 
         {/* Bottom Bar */}
         <div className="py-6 border-t border-primary-foreground/10">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-sm text-primary-foreground/50">
               © {new Date().getFullYear()} Menz Refrigerated Transport. All rights reserved.
             </p>
             <div className="flex items-center gap-6">
               <a
                 href="#"
                 className="text-sm text-primary-foreground/50 hover:text-accent transition-colors"
               >
                 Privacy Policy
               </a>
               <a
                 href="#"
                 className="text-sm text-primary-foreground/50 hover:text-accent transition-colors"
               >
                 Terms of Service
               </a>
             </div>
           </div>
         </div>
       </div>
     </footer>
   );
 };

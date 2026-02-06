import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Snowflake, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#fleet", label: "Fleet" },
  { href: "#coverage", label: "Coverage" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-12 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-primary/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
           {/* Logo */}
           <Link to="/landing" className="flex items-center gap-3">
              <div className="relative">
                <Snowflake className="h-10 w-10 text-accent" />
                <div className="absolute inset-0 blur-lg bg-accent/30 animate-glow-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-primary-foreground tracking-tight">
                  MENZ
                </span>
                <span className="text-[10px] font-medium text-accent uppercase tracking-[0.2em]">
                  Refrigerated Transport
                </span>
             </div>
           </Link>

           {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

           {/* CTA Buttons */}
           <div className="hidden lg:flex items-center gap-4">
             <a
               href="tel:1300000000"
               className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors"
             >
               <Phone className="h-4 w-4" />
               1300 MENZ
             </a>
             <Button
               variant="ghost"
               className="text-primary-foreground/80 hover:text-accent hover:bg-accent/10"
               onClick={handleLogin}
             >
                 <LogIn className="h-4 w-4 mr-2" />
                 Login
             </Button>
             <Button
               asChild
               className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
             >
               <a href="#contact">Get a Quote</a>
             </Button>
           </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-primary-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 lg:hidden bg-primary pt-32"
          >
            <nav className="flex flex-col items-center gap-6 p-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-semibold text-primary-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="flex flex-col gap-4 mt-8 w-full max-w-xs"
             >
               <Button
                 asChild
                 size="lg"
                 className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold w-full"
               >
                 <a href="tel:1300000000">
                   <Phone className="h-5 w-5 mr-2" />
                   Call 1300 MENZ
                 </a>
               </Button>
               <Button
                 asChild
                 size="lg"
                 variant="outline"
                 className="border-accent text-accent hover:bg-accent/10 w-full"
               >
                 <a href="#contact">Get a Quote</a>
               </Button>
               <Button
                 size="lg"
                 variant="ghost"
                 className="text-primary-foreground hover:text-accent hover:bg-accent/10 w-full"
                 onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogin();
                 }}
               >
                   <LogIn className="h-5 w-5 mr-2" />
                   Login
               </Button>
             </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

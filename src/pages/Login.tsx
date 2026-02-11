import { useState } from "react";
import { motion } from "framer-motion";
import { Coffee, ArrowLeft, User, Lock, Mail, Package, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [activeTab, setActiveTab] = useState("client");
  const navigate = useNavigate();

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to booking portal for client access
    navigate("/booking-portal");
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to demo dashboard for staff access
    navigate("/demo");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-overlay opacity-10" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Coffee className="h-12 w-12 text-accent" />
              <div className="absolute inset-0 blur-lg bg-accent/30 animate-glow-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold tracking-tight">
                SC COFFEE
              </span>
              <span className="text-xs font-medium text-accent uppercase tracking-[0.2em]">
                Roastery
              </span>
            </div>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
                Welcome to Your{" "}
                <span className="gradient-text-ice">Roastery</span> Portal
              </h1>
              <p className="text-xl text-primary-foreground/70 leading-relaxed max-w-md">
                Access your operations dashboard, track orders in real-time, 
                and manage your roastery deliveries with precision.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-4"
            >
              {[
                { icon: Package, text: "Real-time order tracking" },
                { icon: Shield, text: "Quality & freshness assurance" },
                { icon: User, text: "Personalized dashboard" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-primary-foreground/80">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-primary-foreground/50"
          >
            © {new Date().getFullYear()} Sunshine Coast Coffee Roastery. All rights reserved.
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <Coffee className="h-8 w-8 text-accent" />
          <span className="text-lg font-display font-bold text-foreground">SC Coffee</span>
        </Link>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-8 right-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-display font-bold text-foreground">
                Sign In
              </h2>
              <p className="text-muted-foreground">
                Access your portal to manage your orders
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="client" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Client Portal
                </TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Staff Access
                </TabsTrigger>
              </TabsList>

              {/* Client Login */}
              <TabsContent value="client" className="space-y-4">
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <a href="#" className="text-sm text-accent hover:text-accent/80 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    Sign in to Client Portal
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="#contact" className="text-accent hover:text-accent/80 font-medium">
                    Contact us
                  </a>
                </div>
              </TabsContent>

              {/* Staff Login */}
              <TabsContent value="staff" className="space-y-4">
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Staff Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="staff@sccoffee.com.au"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <a href="#" className="text-sm text-accent hover:text-accent/80 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Sign in to Staff Portal
                  </Button>
                </form>

                <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs text-muted-foreground text-center">
                    Staff access is restricted to authorized SC Coffee Roastery personnel only.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure encrypted connection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

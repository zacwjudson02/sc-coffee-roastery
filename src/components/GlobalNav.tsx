import { Link, useLocation } from "react-router-dom";
import { FileText, Cog, User, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Proposal",
    path: "/",
    icon: FileText,
  },
  {
    label: "Operations Demo",
    path: "/demo",
    icon: Cog,
  },
  {
    label: "Driver App",
    path: "/driver-app",
    icon: Smartphone,
  },
  {
    label: "Client Portal",
    path: "/booking-portal",
    icon: User,
  },
];

export const GlobalNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-center h-12 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200 rounded-md group",
                  active
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                
                {/* Active indicator */}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

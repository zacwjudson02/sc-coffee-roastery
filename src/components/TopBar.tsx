import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-slate-300 bg-white shadow-md">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-md" />
        
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search bookings, manifests..."
              className="pl-9 border-slate-300 bg-slate-50 focus-visible:ring-emerald-700 focus-visible:border-emerald-700 focus-visible:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-md">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white shadow-sm">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-md">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

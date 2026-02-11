import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Battery,
  Signal,
  Wifi,
  MapPin,
  Package,
  Camera,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  MessageSquare,
  ChevronRight,
  Truck,
  User,
  Coffee,
  ClipboardCheck,
  AlertTriangle,
  Pen,
  Check,
  Pause,
  Smartphone,
  Bell,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ─────────────────── DEMO DATA ─────────────────── */

const demoDeliveries = [
  {
    id: "DEL-001",
    order: "ORD-2026-4821",
    customer: "Noosa Heads Espresso Bar",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "12 Hastings St, Noosa Heads",
    time: "7:30 AM",
    eta: "8:15 AM",
    pallets: 3,
    weight: "240 kg",
    items: "Single Origin Blend x 12, House Blend x 8, Decaf x 4",
    notes: "Use rear loading dock. Ask for Michelle.",
    status: "in-progress" as const,
    phone: "0412 345 678",
    distance: "32 km",
    specialInstructions: "Temperature sensitive, keep below 25°C",
  },
  {
    id: "DEL-002",
    order: "ORD-2026-4822",
    customer: "Mooloolaba Surf Club Cafe",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "71 The Esplanade, Mooloolaba",
    time: "9:00 AM",
    eta: "9:25 AM",
    pallets: 2,
    weight: "160 kg",
    items: "House Blend x 10, Chai Latte Mix x 6",
    notes: "Front entrance, ring bell twice.",
    status: "upcoming" as const,
    phone: "0423 456 789",
    distance: "8 km",
    specialInstructions: "",
  },
  {
    id: "DEL-003",
    order: "ORD-2026-4823",
    customer: "Caloundra Coffee House",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "88 Bulcock St, Caloundra",
    time: "10:30 AM",
    eta: "11:05 AM",
    pallets: 4,
    weight: "320 kg",
    items: "Premium Blend x 16, Cold Brew Concentrate x 8, Filters x 20",
    notes: "Loading bay B. Contact Dan on arrival.",
    status: "upcoming" as const,
    phone: "0434 567 890",
    distance: "18 km",
    specialInstructions: "Fragile glass bottles in this order",
  },
  {
    id: "DEL-004",
    order: "ORD-2026-4824",
    customer: "Maroochydore Markets Kiosk",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "Cornmeal Creek, Maroochydore",
    time: "12:00 PM",
    eta: "12:20 PM",
    pallets: 1,
    weight: "80 kg",
    items: "Sample Pack x 20, Merch x 5",
    notes: "Weekend market setup, ask for stall 14.",
    status: "upcoming" as const,
    phone: "0445 678 901",
    distance: "5 km",
    specialInstructions: "",
  },
  {
    id: "DEL-005",
    order: "ORD-2026-4825",
    customer: "Coolum Beach Roasters",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "2/15 Birtwill St, Coolum Beach",
    time: "1:30 PM",
    eta: "2:00 PM",
    pallets: 2,
    weight: "180 kg",
    items: "Green Beans x 8, Roasted Blend x 6",
    notes: "Side gate access. Pin code: 4872#",
    status: "upcoming" as const,
    phone: "0456 789 012",
    distance: "14 km",
    specialInstructions: "",
  },
];

type Screen = "home" | "deliveries" | "detail" | "pod" | "navigation" | "summary";

/* ─────────────────── PHONE STATUS BAR ─────────────────── */

const StatusBar = () => {
  const now = new Date();
  const time = now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <div className="flex items-center justify-between px-5 py-1.5 text-[11px] font-semibold text-white">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <Battery className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};

/* ─────────────────── PHONE BOTTOM NAV ─────────────────── */

interface BottomNavProps {
  screen: Screen;
  onNavigate: (s: Screen) => void;
}

const BottomNav = ({ screen, onNavigate }: BottomNavProps) => {
  const items = [
    { id: "home" as const, label: "Home", icon: Coffee },
    { id: "deliveries" as const, label: "Deliveries", icon: Truck },
    { id: "summary" as const, label: "Summary", icon: ClipboardCheck },
  ];
  return (
    <div className="flex items-center justify-around border-t border-white/10 bg-gray-950/90 backdrop-blur-sm py-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = screen === item.id || (item.id === "deliveries" && (screen === "detail" || screen === "pod" || screen === "navigation"));
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors",
              active ? "text-amber-400" : "text-white/50 hover:text-white/70"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ─────────────────── HOME SCREEN ─────────────────── */

interface HomeScreenProps {
  onNavigate: (s: Screen) => void;
  completedCount: number;
  totalCount: number;
}

const HomeScreen = ({ onNavigate, completedCount, totalCount }: HomeScreenProps) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {/* Driver greeting */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-lg">
          <User className="h-6 w-6 text-amber-100" />
        </div>
        <div>
          <p className="text-white font-bold text-base">Good morning, Jake</p>
          <p className="text-white/50 text-xs">Wednesday, 11 Feb 2026</p>
        </div>
      </div>

      {/* Shift card - always in progress */}
      <div className="rounded-2xl p-4 border transition-all bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border-emerald-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-sm">Shift In Progress</p>
            <p className="text-white/50 text-[11px]">Started at 6:45 AM</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[11px] font-bold">ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-white/60">Today's progress</span>
          <span className="text-white font-bold">{completedCount}/{totalCount} deliveries</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/10" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Stops", value: String(totalCount), icon: MapPin },
          { label: "Pallets", value: "12", icon: Package },
          { label: "Distance", value: "77 km", icon: Navigation },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <Icon className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{stat.value}</p>
              <p className="text-white/40 text-[10px]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Next delivery card */}
      <button onClick={() => onNavigate("deliveries")} className="w-full text-left">
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/50 border border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-[11px] font-bold uppercase tracking-wide">Next Delivery</span>
            <span className="text-white/50 text-[11px]">{demoDeliveries[0].eta} ETA</span>
          </div>
          <p className="text-white font-bold text-sm mb-1">{demoDeliveries[0].customer}</p>
          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
            <MapPin className="h-3 w-3" />
            <span>{demoDeliveries[0].dropoff}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-[11px]">{demoDeliveries[0].pallets} pallets</span>
              <span className="text-white/40 text-[11px]">{demoDeliveries[0].distance}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-400" />
          </div>
        </div>
      </button>

      {/* Alerts */}
      <div className="rounded-2xl bg-yellow-900/20 border border-yellow-500/20 p-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-yellow-300 text-xs font-bold">Temperature Alert</p>
          <p className="text-white/50 text-[11px]">Cargo temp 23°C, within range. Monitoring active.</p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── DELIVERIES LIST SCREEN ─────────────────── */

interface DeliveriesScreenProps {
  deliveries: typeof demoDeliveries;
  onSelect: (id: string) => void;
  completedIds: Set<string>;
}

const DeliveriesScreen = ({ deliveries, onSelect, completedIds }: DeliveriesScreenProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white font-bold text-lg">Today's Deliveries</h2>
        <p className="text-white/50 text-xs mt-0.5">{deliveries.length} stops, Sunshine Coast route</p>
      </div>

      {/* Delivery cards */}
      <div className="px-4 space-y-2 pb-4">
        {deliveries.map((del, idx) => {
          const completed = completedIds.has(del.id);
          const isCurrent = del.status === "in-progress" && !completed;
          return (
            <button
              key={del.id}
              onClick={() => onSelect(del.id)}
              className={cn(
                "w-full text-left rounded-xl border p-3 transition-all",
                completed
                  ? "bg-emerald-900/20 border-emerald-500/20 opacity-70"
                  : isCurrent
                    ? "bg-blue-900/20 border-blue-500/30 ring-1 ring-blue-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Stop number */}
                <div className={cn(
                  "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                  completed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isCurrent
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/10 text-white/50"
                )}>
                  {completed ? <Check className="h-4 w-4" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-bold text-sm truncate", completed ? "text-emerald-300" : "text-white")}>{del.customer}</p>
                    <span className="text-white/40 text-[11px] ml-2 flex-shrink-0">{del.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-white/30 flex-shrink-0" />
                    <span className="text-white/50 text-[11px] truncate">{del.dropoff}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-white/30 text-[10px]">{del.pallets} pallets</span>
                    <span className="text-white/30 text-[10px]">{del.weight}</span>
                    <span className="text-white/30 text-[10px]">{del.distance}</span>
                  </div>
                </div>

                <ChevronRight className={cn("h-4 w-4 flex-shrink-0 mt-1", completed ? "text-emerald-400/50" : "text-white/20")} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────── DELIVERY DETAIL SCREEN ─────────────────── */

interface DetailScreenProps {
  delivery: typeof demoDeliveries[number];
  completed: boolean;
  onBack: () => void;
  onNavigate: () => void;
  onPod: () => void;
}

const DetailScreen = ({ delivery, completed, onBack, onNavigate, onPod }: DetailScreenProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Back header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-white font-bold text-base">Delivery Details</h2>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "text-[10px] font-bold",
            completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          )}>
            {completed ? "COMPLETED" : "IN PROGRESS"}
          </Badge>
          <span className="text-white/40 text-[11px]">{delivery.order}</span>
        </div>

        {/* Customer card */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-white font-bold text-sm">{delivery.customer}</p>
          <div className="flex items-center gap-2 mt-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <Phone className="h-3 w-3" />
              Call
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-medium">
              <MessageSquare className="h-3 w-3" />
              SMS
            </button>
          </div>
        </div>

        {/* Route */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 border-2 border-amber-300" />
              <div className="w-px h-8 bg-white/20 my-1" />
              <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-emerald-300" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wide">Pickup</p>
                <p className="text-white text-xs font-medium">{delivery.pickup}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wide">Dropoff</p>
                <p className="text-white text-xs font-medium">{delivery.dropoff}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-white/40 text-[11px]">{delivery.distance}</span>
            <span className="text-white/40 text-[11px]">ETA {delivery.eta}</span>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wide mb-2">Cargo Details</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs">{delivery.pallets} pallets</span>
              <span className="text-white/50 text-xs">{delivery.weight}</span>
            </div>
            <p className="text-white/60 text-[11px]">{delivery.items}</p>
          </div>
        </div>

        {/* Special instructions */}
        {(delivery.specialInstructions || delivery.notes) && (
          <div className="rounded-xl bg-yellow-900/20 border border-yellow-500/20 p-3">
            <p className="text-yellow-400 text-[10px] uppercase tracking-wide mb-1.5 font-bold">Instructions</p>
            {delivery.specialInstructions && <p className="text-white/70 text-[11px] mb-1">{delivery.specialInstructions}</p>}
            {delivery.notes && <p className="text-white/60 text-[11px]">{delivery.notes}</p>}
          </div>
        )}

        {/* Action buttons */}
        {!completed && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg hover:bg-blue-500 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </button>
            <button
              onClick={onPod}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:bg-emerald-500 transition-colors"
            >
              <Camera className="h-4 w-4" />
              Capture POD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────── NAVIGATION SCREEN ─────────────────── */

interface NavigationScreenProps {
  delivery: typeof demoDeliveries[number];
  onBack: () => void;
}

const NavigationScreen = ({ delivery, onBack }: NavigationScreenProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-white font-bold text-base">Navigation</h2>
      </div>

      {/* Map placeholder */}
      <div className="flex-1 mx-4 mb-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-4">
              <Navigation className="h-12 w-12 text-blue-400 mx-auto" />
              <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse" />
            </div>
            <p className="text-white/80 text-sm font-bold">Live Navigation</p>
            <p className="text-white/40 text-xs mt-1">Integrated GPS guidance</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-left">
                <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">1</div>
                <span className="text-white/60 text-[11px]">Head north on Industrial Ave</span>
                <span className="text-white/30 text-[10px] ml-auto">0.3 km</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-left">
                <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">2</div>
                <span className="text-white/40 text-[11px]">Turn right onto Nicklin Way</span>
                <span className="text-white/30 text-[10px] ml-auto">12.4 km</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-left">
                <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">3</div>
                <span className="text-white/40 text-[11px]">Continue onto David Low Way</span>
                <span className="text-white/30 text-[10px] ml-auto">18.7 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="px-4 pb-3">
        <div className="rounded-xl bg-blue-900/30 border border-blue-500/20 p-3 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-xs">{delivery.dropoff}</p>
            <p className="text-white/50 text-[11px]">{delivery.distance}, ETA {delivery.eta}</p>
          </div>
          <button className="px-4 py-2 rounded-full bg-blue-500 text-white text-xs font-bold shadow-lg">
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── POD CAPTURE SCREEN ─────────────────── */

interface PodScreenProps {
  delivery: typeof demoDeliveries[number];
  onBack: () => void;
  onComplete: () => void;
}

const PodScreen = ({ delivery, onBack, onComplete }: PodScreenProps) => {
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signed, setSigned] = useState(false);
  const [receiverName, setReceiverName] = useState("");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-white font-bold text-base">Proof of Delivery</h2>
      </div>

      <div className="px-4 space-y-3 pb-4">
        <p className="text-white/50 text-xs">{delivery.customer}, {delivery.order}</p>

        {/* Photo capture */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-xs">Delivery Photo</p>
            {photoTaken && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          </div>
          {photoTaken ? (
            <div className="rounded-lg bg-emerald-900/20 border border-emerald-500/20 p-6 text-center">
              <Camera className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-xs font-bold">Photo captured</p>
              <p className="text-white/40 text-[10px] mt-0.5">IMG_2026_0211_0823.jpg</p>
              <button onClick={() => setPhotoTaken(false)} className="text-white/30 text-[10px] mt-2 underline">Retake</button>
            </div>
          ) : (
            <button
              onClick={() => setPhotoTaken(true)}
              className="w-full rounded-lg border-2 border-dashed border-white/20 p-8 text-center hover:border-amber-500/40 transition-colors"
            >
              <Camera className="h-10 w-10 text-white/30 mx-auto mb-2" />
              <p className="text-white/60 text-xs font-medium">Tap to take photo</p>
              <p className="text-white/30 text-[10px] mt-0.5">Photo of goods at delivery point</p>
            </button>
          )}
        </div>

        {/* Signature */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-xs">Receiver Signature</p>
            {signed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          </div>
          {signed ? (
            <div className="rounded-lg bg-emerald-900/20 border border-emerald-500/20 p-4 text-center">
              <Pen className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-xs font-bold">Signed by {receiverName || "Receiver"}</p>
              <button onClick={() => setSigned(false)} className="text-white/30 text-[10px] mt-2 underline">Clear</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Receiver name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/30 mb-2 focus:outline-none focus:border-amber-500/40"
              />
              <button
                onClick={() => setSigned(true)}
                className="w-full rounded-lg border-2 border-dashed border-white/20 p-6 text-center hover:border-amber-500/40 transition-colors"
              >
                <Pen className="h-8 w-8 text-white/30 mx-auto mb-2" />
                <p className="text-white/60 text-xs font-medium">Tap to capture signature</p>
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-white font-bold text-xs mb-2">Delivery Notes (Optional)</p>
          <textarea
            placeholder="Any notes about this delivery..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/30 h-16 resize-none focus:outline-none focus:border-amber-500/40"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => {
            if (photoTaken && signed) {
              onComplete();
            }
          }}
          disabled={!photoTaken || !signed}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2",
            photoTaken && signed
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          Complete Delivery
        </button>
      </div>
    </div>
  );
};

/* ─────────────────── SUMMARY SCREEN ─────────────────── */

interface SummaryScreenProps {
  completedCount: number;
  totalCount: number;
}

const SummaryScreen = ({ completedCount, totalCount }: SummaryScreenProps) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <h2 className="text-white font-bold text-lg">Shift Summary</h2>

      {/* Progress ring */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-amber-950/50 border border-amber-500/20 p-6 text-center">
        <div className="relative w-28 h-28 mx-auto mb-4">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="rgb(245,158,11)" strokeWidth="8"
              strokeDasharray={`${progress * 2.64} ${264 - progress * 2.64}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <p className="text-white font-bold text-2xl">{completedCount}</p>
              <p className="text-white/40 text-[10px]">of {totalCount}</p>
            </div>
          </div>
        </div>
        <p className="text-white font-bold text-sm">Deliveries Completed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total Distance", value: "32 km", sub: "driven today" },
          { label: "Avg Per Stop", value: "14 min", sub: "delivery time" },
          { label: "On-Time Rate", value: "100%", sub: "all on schedule" },
          { label: "PODs Captured", value: String(completedCount), sub: "photos and signatures" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-white/60 text-[11px] font-medium">{stat.label}</p>
            <p className="text-white/30 text-[10px]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* End shift button */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-white font-bold text-xs mb-2">Shift Duration</p>
        <p className="text-amber-400 font-bold text-2xl">4h 23m</p>
        <p className="text-white/40 text-[11px] mt-1">Started 6:45 AM at SC Roastery HQ</p>
        <button className="w-full mt-3 py-2.5 rounded-xl bg-red-600/80 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500 transition-colors">
          <Pause className="h-3.5 w-3.5" />
          End Shift
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════ MAIN DRIVER APP PAGE ═══════════════════ */

const DriverApp = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const currentDelivery = demoDeliveries.find((d) => d.id === selectedDelivery) || demoDeliveries[0];

  const handleSelectDelivery = (id: string) => {
    setSelectedDelivery(id);
    setScreen("detail");
  };

  const handleCompleteDelivery = () => {
    if (selectedDelivery) {
      setCompletedIds((prev) => new Set([...prev, selectedDelivery]));
      setScreen("deliveries");
    }
  };

  // Screen transition variants
  const screenVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream/50 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-bronze/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-bronze/5 rounded-full blur-3xl" />
      
      {/* Page header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm relative z-10 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-bronze-light mb-3">Field Operations</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-bronze to-bronze/80 flex items-center justify-center shadow-lg">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight mb-1">
                    Driver Field App
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium">Interactive demo. Tap through the screens below to explore.</p>
                </div>
              </div>
            </div>
            <Link to="/">
              <Button className="bg-bronze hover:bg-bronze/90 text-white font-semibold gap-2 shadow-lg hover:shadow-xl transition-all px-6 py-6 text-base">
                <ArrowLeft className="h-4 w-4" />
                Back to Proposal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="container mx-auto px-4 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-8">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-bronze mb-3">Core Capabilities</p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Built for the field</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Bell, label: "Smart Notifications", desc: "Alerts and live updates" },
            { icon: Camera, label: "POD Capture", desc: "Photos and e-signatures" },
            { icon: Clock, label: "Real-Time Tracking", desc: "Live shift monitoring" },
            { icon: Package, label: "Cargo Management", desc: "Full delivery details" },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.label} className="group rounded-2xl bg-card border border-border/60 p-5 text-center hover:shadow-xl hover:scale-105 hover:border-bronze/40 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-bronze/10 to-bronze/5 flex items-center justify-center mx-auto mb-3 group-hover:from-bronze/20 group-hover:to-bronze/10 transition-colors">
                  <Icon className="h-6 w-6 text-bronze" />
                </div>
                <p className="text-foreground font-bold text-sm mb-1">{feat.label}</p>
                <p className="text-muted-foreground text-[11px]">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section divider */}
      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-bronze/30" />
          <div className="h-2 w-2 rounded-full bg-bronze/40" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-bronze/30" />
        </div>
      </div>

      {/* Try me message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="flex flex-col items-center gap-2 pb-4 relative z-10"
      >
        <p className="text-bronze font-bold text-lg tracking-wide">Try me!</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6 text-bronze" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Phone frame */}
      <div className="flex-1 flex items-start justify-center pb-16 px-4 relative z-10">
        <div className="relative">
          {/* Glow effect behind phone */}
          <div className="absolute inset-0 bg-gradient-to-b from-bronze/20 via-bronze/10 to-transparent blur-3xl scale-110 animate-pulse" />
          
          {/* Phone bezel */}
          <div className="relative w-[340px] md:w-[375px] h-[720px] bg-gray-950 rounded-[3rem] border-[3px] border-gray-700 shadow-2xl shadow-bronze/20 overflow-hidden flex flex-col ring-1 ring-bronze/10">
            {/* Notch */}
            <div className="relative bg-gray-950 pt-2">
              <div className="mx-auto w-28 h-6 bg-black rounded-b-2xl" />
              <StatusBar />
            </div>

            {/* App header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-900/80 to-amber-950/80 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-400" />
                <span className="text-white font-bold text-xs tracking-wide">SC ROASTERY</span>
              </div>
              <span className="text-amber-400/60 text-[10px] font-medium">DRIVER</span>
            </div>

            {/* Screen content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  variants={screenVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {screen === "home" && (
                    <HomeScreen
                      onNavigate={setScreen}
                      completedCount={completedIds.size}
                      totalCount={demoDeliveries.length}
                    />
                  )}
                  {screen === "deliveries" && (
                    <DeliveriesScreen
                      deliveries={demoDeliveries}
                      onSelect={handleSelectDelivery}
                      completedIds={completedIds}
                    />
                  )}
                  {screen === "detail" && currentDelivery && (
                    <DetailScreen
                      delivery={currentDelivery}
                      completed={completedIds.has(currentDelivery.id)}
                      onBack={() => setScreen("deliveries")}
                      onNavigate={() => setScreen("navigation")}
                      onPod={() => setScreen("pod")}
                    />
                  )}
                  {screen === "navigation" && currentDelivery && (
                    <NavigationScreen
                      delivery={currentDelivery}
                      onBack={() => setScreen("detail")}
                    />
                  )}
                  {screen === "pod" && currentDelivery && (
                    <PodScreen
                      delivery={currentDelivery}
                      onBack={() => setScreen("detail")}
                      onComplete={handleCompleteDelivery}
                    />
                  )}
                  {screen === "summary" && (
                    <SummaryScreen
                      completedCount={completedIds.size}
                      totalCount={demoDeliveries.length}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom nav */}
            <BottomNav screen={screen} onNavigate={setScreen} />

            {/* Home indicator */}
            <div className="bg-gray-950 pb-2 pt-1 flex justify-center">
              <div className="w-28 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Selling points below the phone */}
      <div className="border-t border-border/60 bg-gradient-to-b from-card to-background relative z-10">
        {/* Decorative top border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-bronze to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="font-sans text-sm tracking-[0.25em] uppercase text-bronze-light mb-4">Why a driver app?</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4 leading-tight">
              Everything your drivers need.<br />
              <span className="text-bronze italic">Nothing they don't.</span>
            </h2>
            <div className="w-16 h-px bg-bronze/30 mx-auto my-6" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              A purpose-built field app that keeps drivers focused on deliveries, not fighting with clunky software. 
              Real-time data syncs back to your operations dashboard instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Zero Training Required",
                description: "Intuitive mobile-first design means drivers can start using it on day one. No manuals, no workshops.",
                icon: Smartphone,
                number: "01",
              },
              {
                title: "Offline-Ready",
                description: "Works without cell coverage. Data syncs automatically when the connection returns, so nothing gets lost.",
                icon: Shield,
                number: "02",
              },
              {
                title: "Instant POD Processing",
                description: "Photos, signatures, and delivery notes flow straight to invoicing. Close jobs in seconds, not days.",
                icon: Camera,
                number: "03",
              },
            ].map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="group relative">
                  {/* Number badge */}
                  <span className="absolute -top-2 -left-2 text-6xl font-serif font-bold text-bronze/10 group-hover:text-bronze/20 transition-colors">
                    {point.number}
                  </span>
                  
                  <div className="relative rounded-2xl bg-background border border-border/60 p-8 hover:shadow-2xl hover:border-bronze/40 transition-all duration-300 h-full">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-bronze to-bronze/80 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-foreground font-bold text-xl mb-3 font-serif">{point.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverApp;

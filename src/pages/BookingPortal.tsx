import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Clock,
  Eye,
  Plus,
  MapPin,
  CheckCircle2,
  Coffee,
  Calendar,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAppData } from "@/hooks/use-appdata";
import { BookingDialog, CreateBookingPayload } from "@/components/bookings/BookingDialog";
import { useToast } from "@/hooks/use-toast";
import { formatDateAU, formatDateTimeAU } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Demo tracking event data structure
type TrackingEvent = {
  timestamp: string;
  location: string;
  message: string;
  status: "pending" | "in_transit" | "delivered" | "exception";
};

// Extended demo booking with tracking
type DemoBookingWithTracking = {
  id: string;
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  pickupSuburb: string;
  dropoffSuburb: string;
  date: string;
  status: "Draft" | "Confirmed" | "In Transit" | "Delivered" | "Exception";
  pallets?: number;
  spaces?: number;
  customerRef?: string;
  trackingEvents: TrackingEvent[];
  estimatedDelivery?: string;
};

// Demo data with tracking
const DEMO_BOOKINGS: DemoBookingWithTracking[] = [
  {
    id: "demo-1",
    bookingId: "ORD-2026-0201",
    customer: "Noosa Heads Cafe",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "12 Hastings St, Noosa",
    pickupSuburb: "Warana",
    dropoffSuburb: "Noosa",
    date: "2026-02-05",
    status: "In Transit",
    pallets: 12,
    spaces: 12,
    customerRef: "PO-4501",
    estimatedDelivery: "2026-02-05 14:30",
    trackingEvents: [
      { timestamp: "2026-02-05 06:00", location: "SC Roastery HQ", message: "Order created", status: "pending" },
      { timestamp: "2026-02-05 07:30", location: "SC Roastery HQ", message: "Loaded onto vehicle", status: "in_transit" },
      { timestamp: "2026-02-05 09:15", location: "Maroochydore", message: "In transit - checkpoint", status: "in_transit" },
      { timestamp: "2026-02-05 11:45", location: "Noosa", message: "Arrived at delivery zone", status: "in_transit" },
    ],
  },
  {
    id: "demo-2",
    bookingId: "ORD-2026-0200",
    customer: "Mooloolaba Espresso Bar",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "88 The Esplanade, Mooloolaba",
    pickupSuburb: "Warana",
    dropoffSuburb: "Mooloolaba",
    date: "2026-02-04",
    status: "Delivered",
    pallets: 8,
    spaces: 8,
    customerRef: "PO-4502",
    estimatedDelivery: "2026-02-04 16:00",
    trackingEvents: [
      { timestamp: "2026-02-04 05:30", location: "SC Roastery HQ", message: "Order created", status: "pending" },
      { timestamp: "2026-02-04 08:00", location: "SC Roastery HQ", message: "Loaded onto vehicle", status: "in_transit" },
      { timestamp: "2026-02-04 09:30", location: "Warana", message: "In transit", status: "in_transit" },
      { timestamp: "2026-02-04 10:15", location: "Mooloolaba", message: "Arrived at destination", status: "in_transit" },
      { timestamp: "2026-02-04 10:45", location: "Mooloolaba", message: "Delivered successfully", status: "delivered" },
    ],
  },
  {
    id: "demo-3",
    bookingId: "ORD-2026-0199",
    customer: "Caloundra Coffee House",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "34 Bulcock St, Caloundra",
    pickupSuburb: "Warana",
    dropoffSuburb: "Caloundra",
    date: "2026-02-06",
    status: "Confirmed",
    pallets: 15,
    spaces: 15,
    customerRef: "PO-4503",
    estimatedDelivery: "2026-02-06 12:00",
    trackingEvents: [
      { timestamp: "2026-02-05 16:30", location: "SC Roastery HQ", message: "Order confirmed", status: "pending" },
    ],
  },
  {
    id: "demo-4",
    bookingId: "ORD-2026-0198",
    customer: "Coolum Beach Cafe",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "5 David Low Way, Coolum",
    pickupSuburb: "Warana",
    dropoffSuburb: "Coolum",
    date: "2026-02-03",
    status: "Delivered",
    pallets: 6,
    spaces: 6,
    customerRef: "PO-4504",
    estimatedDelivery: "2026-02-03 10:30",
    trackingEvents: [
      { timestamp: "2026-02-03 06:00", location: "SC Roastery HQ", message: "Order created", status: "pending" },
      { timestamp: "2026-02-03 07:00", location: "SC Roastery HQ", message: "Loaded onto vehicle", status: "in_transit" },
      { timestamp: "2026-02-03 09:00", location: "Coolum", message: "Delivered successfully", status: "delivered" },
    ],
  },
  {
    id: "demo-5",
    bookingId: "ORD-2026-0197",
    customer: "Noosa Heads Cafe",
    pickup: "SC Roastery HQ, Warana",
    dropoff: "12 Hastings St, Noosa",
    pickupSuburb: "Warana",
    dropoffSuburb: "Noosa",
    date: "2026-02-07",
    status: "Draft",
    pallets: 10,
    spaces: 10,
    customerRef: "PO-4505",
    trackingEvents: [
      { timestamp: "2026-02-05 15:00", location: "SC Roastery HQ", message: "Order draft created", status: "pending" },
    ],
  },
];

export default function BookingPortal() {
  const { customers, bookings, addBooking } = useAppData();
  const { toast } = useToast();

  // Dialog states
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [newBookingDialogOpen, setNewBookingDialogOpen] = useState(false);
  const [viewTrackingDialogOpen, setViewTrackingDialogOpen] = useState(false);
  const [trackingBoardOpen, setTrackingBoardOpen] = useState(false);

  // Track shipment state
  const [trackingRef, setTrackingRef] = useState("");
  const [trackingResult, setTrackingResult] = useState<DemoBookingWithTracking | null>(null);

  // History filters
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState<string>("all");

  // Currently selected booking for tracking view
  const [selectedBooking, setSelectedBooking] = useState<DemoBookingWithTracking | null>(null);

  // Active bookings for tracking board
  const activeBookings = useMemo(() => {
    return DEMO_BOOKINGS.filter(
      (b) => b.status === "Confirmed" || b.status === "In Transit"
    );
  }, []);

  // Track shipment handler
  const handleTrackShipment = () => {
    const found = DEMO_BOOKINGS.find(
      (b) => b.bookingId.toLowerCase() === trackingRef.toLowerCase()
    );
    if (found) {
      setTrackingResult(found);
    } else {
      setTrackingResult(null);
      toast({
        title: "Not Found",
        description: `No booking found with reference ${trackingRef}`,
        variant: "destructive",
      });
    }
  };

  // Open tracking view from track dialog
  const handleOpenTrackingView = (booking: DemoBookingWithTracking) => {
    setSelectedBooking(booking);
    setTrackDialogOpen(false);
    setViewTrackingDialogOpen(true);
  };

  // Open tracking view from history
  const handleViewFromHistory = (booking: DemoBookingWithTracking) => {
    setSelectedBooking(booking);
    setHistoryDialogOpen(false);
    setViewTrackingDialogOpen(true);
  };

  // Filter history
  const filteredHistory = useMemo(() => {
    return DEMO_BOOKINGS.filter((b) => {
      const matchesSearch =
        b.bookingId.toLowerCase().includes(historySearch.toLowerCase()) ||
        b.customer.toLowerCase().includes(historySearch.toLowerCase()) ||
        (b.customerRef?.toLowerCase() || "").includes(historySearch.toLowerCase());
      const matchesStatus = historyStatus === "all" || b.status === historyStatus;
      return matchesSearch && matchesStatus;
    });
  }, [historySearch, historyStatus]);

  // New booking handler
  const handleCreateBooking = (payload: CreateBookingPayload) => {
    // Create demo tracking events
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const newDemoBooking: DemoBookingWithTracking = {
      id: `demo-new-${Date.now()}`,
      bookingId: payload.consignmentNo,
      customer: payload.customer,
      pickup: `${payload.pickupAddress}, ${payload.pickupSuburb}`,
      dropoff: `${payload.dropoffAddress}, ${payload.dropoffSuburb}`,
      pickupSuburb: payload.pickupSuburb,
      dropoffSuburb: payload.dropoffSuburb,
      date: payload.date,
      status: "Draft",
      pallets: payload.pallets,
      spaces: payload.spaces,
      customerRef: payload.customerRef,
      trackingEvents: [
        {
          timestamp: now,
          location: "System",
          message: "Booking created",
          status: "pending",
        },
      ],
    };

    // Add to demo data
    DEMO_BOOKINGS.unshift(newDemoBooking);

    // Also add to app data store for persistence
    const customerId = customers.find(
      (c) => c.company.toLowerCase() === payload.customer.toLowerCase()
    )?.id || "";
    
    addBooking({
      bookingId: payload.consignmentNo,
      customerId,
      customerName: payload.customer,
      pickup: `${payload.pickupAddress}, ${payload.pickupSuburb}`,
      dropoff: `${payload.dropoffAddress}, ${payload.dropoffSuburb}`,
      pickupSuburb: payload.pickupSuburb,
      dropoffSuburb: payload.dropoffSuburb,
      date: payload.date,
      status: "Draft",
      pallets: payload.pallets,
      spaces: payload.spaces,
      palletType: payload.palletType,
      transferType: payload.transferType,
      podMethod: payload.podMethod,
      customerRef: payload.customerRef,
    });

    toast({
      title: "Booking Created",
      description: `${payload.consignmentNo} has been created successfully`,
    });

    // Open tracking view for new booking
    setSelectedBooking(newDemoBooking);
    setNewBookingDialogOpen(false);
    setViewTrackingDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "In Transit":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "Confirmed":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "Exception":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getEventIcon = (status: TrackingEvent["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_transit":
        return <Coffee className="h-4 w-4 text-blue-600" />;
      case "exception":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-12 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                SC Coffee Client Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                Roastery Order Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              Demo Environment
            </Badge>
            <Link to="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8 sm:space-y-12"
        >
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-6 sm:p-8">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))] -z-10" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                Welcome to Your Booking Portal
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                Manage your coffee delivery orders, track deliveries in
                real-time, and access your complete order history.
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Track Delivery Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-accent/40 h-full">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">Track Delivery</CardTitle>
                    <CardDescription className="text-sm">
                      Monitor your deliveries in real-time with live updates
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setTrackDialogOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-md transition-shadow"
                  >
                    Track Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking History Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-accent/40 h-full">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">Booking History</CardTitle>
                    <CardDescription className="text-sm">
                      View past and upcoming deliveries with detailed records
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setHistoryDialogOpen(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 group-hover:shadow-md transition-shadow"
                  >
                    View History
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* New Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-accent/40 h-full">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">New Booking</CardTitle>
                    <CardDescription className="text-sm">
                      Schedule a new coffee delivery order
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setNewBookingDialogOpen(true)}
                    className="w-full bg-accent hover:bg-accent/90 group-hover:shadow-md transition-shadow"
                  >
                    Create Booking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* View Tracking Board Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-accent/40 h-full">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="h-7 w-7 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">Tracking Board</CardTitle>
                    <CardDescription className="text-sm">
                      View comprehensive tracking for all active deliveries
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setTrackingBoardOpen(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700 group-hover:shadow-md transition-shadow"
                  >
                    View Board
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Track Delivery Dialog */}
      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Track Delivery</DialogTitle>
            <DialogDescription>
              Enter your order reference to track your delivery
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="tracking-ref" className="text-sm font-medium">
                Booking Reference
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tracking-ref"
                  placeholder="e.g. ORD-2026-0201"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTrackShipment();
                  }}
                  className="text-base"
                />
                <Button onClick={handleTrackShipment} className="bg-accent hover:bg-accent/90">
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Try: ORD-2026-0201, ORD-2026-0200, ORD-2026-0199
              </p>
            </div>

            {/* Tracking Result */}
            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-4 border-2 border-accent/20 rounded-lg bg-accent/5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{trackingResult.bookingId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {trackingResult.customer}
                    </p>
                  </div>
                  <Badge className={getStatusColor(trackingResult.status)}>
                    {trackingResult.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      Pickup
                    </p>
                    <p className="font-medium">{trackingResult.pickupSuburb}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-green-500" />
                      Delivery
                    </p>
                    <p className="font-medium">{trackingResult.dropoffSuburb}</p>
                  </div>
                </div>

                {trackingResult.estimatedDelivery && (
                  <div className="text-sm">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {formatDateTimeAU(trackingResult.estimatedDelivery)}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Latest Update</p>
                  <div className="flex items-center gap-2">
                    {getEventIcon(
                      trackingResult.trackingEvents[
                        trackingResult.trackingEvents.length - 1
                      ]?.status
                    )}
                    <span className="text-sm font-medium">
                      {
                        trackingResult.trackingEvents[
                          trackingResult.trackingEvents.length - 1
                        ]?.message
                      }
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenTrackingView(trackingResult)}
                  className="w-full"
                  variant="default"
                >
                  Open Tracking View
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Booking History</DialogTitle>
            <DialogDescription>
              View and manage your past and upcoming deliveries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by booking ref, customer, or order number..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={historyStatus} onValueChange={setHistoryStatus}>
                <SelectTrigger className="sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                    <TableRow>
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">Route</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {booking.bookingId}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{booking.customer}</p>
                              {booking.customerRef && (
                                <p className="text-xs text-muted-foreground">
                                  {booking.customerRef}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="text-sm space-y-0.5">
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                {booking.pickupSuburb}
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-green-500" />
                                {booking.dropoffSuburb}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDateAU(booking.date)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewFromHistory(booking)}
                            >
                              View
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Booking Dialog */}
      <BookingDialog
        open={newBookingDialogOpen}
        onOpenChange={setNewBookingDialogOpen}
        onCreate={(payload) => handleCreateBooking(payload)}
      />

      {/* Tracking Board Dialog */}
      <Dialog open={trackingBoardOpen} onOpenChange={setTrackingBoardOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Active Deliveries Tracking Board</DialogTitle>
            <DialogDescription>
              Monitor all confirmed and in-transit deliveries
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {activeBookings.length === 0 ? (
              <div className="py-12 text-center">
                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No active deliveries</p>
                <p className="text-sm text-muted-foreground">
                  Create a booking to start tracking
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {activeBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative p-4 border-2 rounded-lg hover:border-accent/40 hover:shadow-lg transition-all cursor-pointer bg-card"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setTrackingBoardOpen(false);
                      setViewTrackingDialogOpen(true);
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.bookingId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.customer}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    {/* Route */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="font-medium truncate">{booking.pickup}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Delivery</p>
                          <p className="font-medium truncate">{booking.dropoff}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Scheduled
                        </p>
                        <p className="font-medium">{formatDateAU(booking.date)}</p>
                      </div>
                      {booking.pallets && (
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Load
                          </p>
                          <p className="font-medium">{booking.pallets} pallets</p>
                        </div>
                      )}
                    </div>

                    {/* Latest Event */}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1.5">Latest Update</p>
                      <div className="flex items-start gap-2">
                        {getEventIcon(
                          booking.trackingEvents[booking.trackingEvents.length - 1]?.status
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {booking.trackingEvents[booking.trackingEvents.length - 1]?.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.trackingEvents[booking.trackingEvents.length - 1]?.location} •{" "}
                            {formatDateTimeAU(
                              booking.trackingEvents[booking.trackingEvents.length - 1]?.timestamp
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Tracking Dialog */}
      <Dialog open={viewTrackingDialogOpen} onOpenChange={setViewTrackingDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
          {selectedBooking ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedBooking.bookingId}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedBooking.customer}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-2">
                {/* Summary Card */}
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        Pickup
                      </p>
                      <p className="font-medium text-sm">{selectedBooking.pickup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-500" />
                        Delivery
                      </p>
                      <p className="font-medium text-sm">{selectedBooking.dropoff}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Scheduled Date
                      </p>
                      <p className="font-medium text-sm">
                        {formatDateAU(selectedBooking.date)}
                      </p>
                    </div>
                    {selectedBooking.estimatedDelivery && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Est. Delivery
                        </p>
                        <p className="font-medium text-sm">
                          {formatDateTimeAU(selectedBooking.estimatedDelivery)}
                        </p>
                      </div>
                    )}
                    {selectedBooking.pallets && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Pallets
                        </p>
                        <p className="font-medium text-sm">
                          {selectedBooking.pallets} pallets / {selectedBooking.spaces} spaces
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Tracking Timeline
                  </h3>
                  <div className="space-y-3 relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                    {selectedBooking.trackingEvents.map((event, idx) => {
                      const isLatest = idx === selectedBooking.trackingEvents.length - 1;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`relative flex gap-4 ${
                            isLatest ? "bg-accent/5 -mx-2 px-2 py-2 rounded-lg" : ""
                          }`}
                        >
                          <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isLatest
                              ? "bg-accent shadow-md shadow-accent/20"
                              : "bg-background border-2 border-border"
                          }`}>
                            {isLatest ? (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            ) : (
                              getEventIcon(event.status)
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <p className={`text-sm font-medium ${
                              isLatest ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {event.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {event.location} • {formatDateTimeAU(event.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewTrackingDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No order selected. Pick an order from History or Track Delivery.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

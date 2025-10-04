import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, ClipboardList, CheckCircle2, Loader2, MapPin, FileCheck2, DollarSign } from "lucide-react";
import { BookingDialog } from "@/components/bookings/BookingDialog";
import { BookingTable, BookingRow } from "@/components/shared/BookingTable";
import { EntityModal } from "@/components/shared/EntityModal";
import { AllocateDriverDialog } from "@/components/bookings/AllocateDriverDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreateRunsheetDialog } from "@/components/runsheets/CreateRunsheetDialog";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PodViewer } from "@/components/pods/PodViewer";
import { SavedViewsDialog } from "@/components/shared/SavedViewsDialog";
import { useToast } from "@/hooks/use-toast";
import { BookingViewDialog } from "@/components/bookings/BookingViewDialog";

type Booking = {
  id: string;
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: "Draft" | "Confirmed" | "Allocated" | "Invoiced" | "Completed";
  driver?: string;
  suburb?: string; // legacy single suburb for allocation filter (maps to dropoff_suburb)
  pickupSuburb?: string;
  dropoffSuburb?: string;
  pallets?: number;
  chargeTo?: "Sender" | "Receiver" | "Third Party";
  palletType?: "Standard" | "Chep" | "Loscam" | "Other";
  transferType?: "Metro" | "Regional" | "Linehaul" | "Other";
  podMethod?: "Paper" | "Digital" | "Photo" | "Other";
  podReceived?: boolean;
  specialInstructions?: string;
  customerRef?: string;
  secondRef?: string;
  podFile?: File;
  spaces?: number;
  unitPrice?: number;
  rateBasis?: "per_pallet" | "per_space";
  invoiceTotal?: number;
  createdAt?: string;
  updatedAt?: string;
};

const mockBookings: Booking[] = [
  {
    id: "1",
    bookingId: "BK-2024-0150",
    customer: "ABC Logistics",
    pickup: "Melbourne Warehouse",
    dropoff: "Sydney CBD",
    date: "2024-10-02",
    status: "Confirmed",
    driver: "John Smith",
    suburb: "Sydney",
    pickupSuburb: "Melbourne",
    dropoffSuburb: "Sydney",
    pallets: 6,
    spaces: 6,
    chargeTo: "Sender",
    palletType: "Chep",
    transferType: "Metro",
    podMethod: "Paper",
    podReceived: false,
    specialInstructions: "Tailgate required",
    createdAt: "2024-10-01 09:00",
    updatedAt: "2024-10-01 09:00",
  },
  {
    id: "2",
    bookingId: "BK-2024-0149",
    customer: "XYZ Freight",
    pickup: "Brisbane Port",
    dropoff: "Gold Coast",
    date: "2024-10-02",
    status: "Invoiced",
    driver: "Sarah Jones",
    suburb: "Gold Coast",
    pickupSuburb: "Brisbane",
    dropoffSuburb: "Gold Coast",
    pallets: 10,
    spaces: 10,
    chargeTo: "Receiver",
    palletType: "Standard",
    transferType: "Regional",
    podMethod: "Digital",
    podReceived: true,
    specialInstructions: "Call on approach",
    unitPrice: 45,
    rateBasis: "per_pallet",
    invoiceTotal: 450,
    createdAt: "2024-10-01 08:30",
    updatedAt: "2024-10-02 10:15",
  },
  {
    id: "3",
    bookingId: "BK-2024-0148",
    customer: "Global Shipping Co",
    pickup: "Adelaide Depot",
    dropoff: "Melbourne",
    date: "2024-10-02",
    status: "Allocated",
    driver: "Mike Brown",
    suburb: "Melbourne",
    pickupSuburb: "Adelaide",
    dropoffSuburb: "Melbourne",
    pallets: 4,
    spaces: 4,
    chargeTo: "Third Party",
    palletType: "Loscam",
    transferType: "Linehaul",
    podMethod: "Photo",
    podReceived: false,
    specialInstructions: "Fragile",
    createdAt: "2024-10-01 07:55",
    updatedAt: "2024-10-01 07:55",
  },
  {
    id: "4",
    bookingId: "BK-2024-0147",
    customer: "Fast Track Transport",
    pickup: "Perth Hub",
    dropoff: "Fremantle",
    date: "2024-10-03",
    status: "Completed",
    driver: "Priya Patel",
    suburb: "Fremantle",
    pickupSuburb: "Perth",
    dropoffSuburb: "Fremantle",
    pallets: 2,
    spaces: 2,
    chargeTo: "Sender",
    palletType: "Standard",
    transferType: "Metro",
    podMethod: "Photo",
    podReceived: true,
    specialInstructions: "Deliver to side gate",
    createdAt: "2024-10-01 06:40",
    updatedAt: "2024-10-03 16:05",
  },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [allocateForId, setAllocateForId] = useState<string | null>(null);
  const [lens, setLens] = useState<string>("Admin");
  const [driverFilter, setDriverFilter] = useState<string>("all");
  const [suburbFilter, setSuburbFilter] = useState<string>("");
  const [statusQuick, setStatusQuick] = useState<"all" | "unallocated" | "allocated" | "completed">("all");
  const [runsheetOpen, setRunsheetOpen] = useState(false);
  const [viewForId, setViewForId] = useState<string | null>(null);
  const [podPreviewForId, setPodPreviewForId] = useState<string | null>(null);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [rangeMode, setRangeMode] = useState(false);
  const [savedViews, setSavedViews] = useState<{ id: string; name: string; payload: any }[]>([]);
  const [customBase, setCustomBase] = useState<"Admin" | "Allocation" | "Customer Service" | null>(null);
  const [customColumns, setCustomColumns] = useState<string[] | null>(null);
  const { toast } = useToast();

  const customers = useMemo(() => Array.from(new Set(bookings.map((b) => b.customer))), [bookings]);
  const drivers = useMemo(() => Array.from(new Set(bookings.map((b) => b.driver).filter(Boolean))) as string[], [bookings]);
  const kpi = useMemo(() => {
    const total = bookings.length;
    const draft = bookings.filter((b) => b.status === "Draft").length;
    const allocated = bookings.filter((b) => b.status === "Allocated").length;
    const invoiced = bookings.filter((b) => b.status === "Invoiced").length;
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
    const fmt = (n: number) => `${n} (${pct(n)}%)`;
    return { total, draft, allocated, invoiced, fmt };
  }, [bookings]);

  // Refresh saved views when dialog closes/opens
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookings.savedViews");
      setSavedViews(raw ? JSON.parse(raw) : []);
    } catch {}
  }, [viewsOpen]);

  const filtered = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || booking.customer === customerFilter;
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFrom = !fromDate || booking.date >= fromDate;
    const matchesTo = !toDate || booking.date <= toDate;
    const matchesDriver = driverFilter === "all" || booking.driver === driverFilter;
    const matchesSuburb = !suburbFilter || (booking.dropoffSuburb ?? booking.suburb ?? "").toLowerCase().includes(suburbFilter.toLowerCase());

    let matchesQuick = true;
    if (statusQuick === "unallocated") matchesQuick = !booking.driver;
    if (statusQuick === "allocated") matchesQuick = booking.status === "Allocated";
    if (statusQuick === "completed") matchesQuick = booking.status === "Completed";

    return (
      matchesStatus && matchesCustomer && matchesSearch && matchesFrom && matchesTo && matchesDriver && matchesSuburb && matchesQuick
    );
  });

  const driverColorMap = useMemo(() => {
    try {
      const raw = localStorage.getItem("driverColors");
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {} as Record<string, string>;
    }
  }, [bookings]);

  const rows: BookingRow[] = filtered.map((b) => ({
    id: b.id,
    bookingId: b.bookingId,
    customer: b.customer,
    pickup: b.pickup,
    dropoff: b.dropoff,
    status: b.status,
    driver: b.driver,
    date: b.date,
  }));

  function handleCreateBooking(newBooking: Omit<Booking, "id">): string {
    const newId = String(Date.now());
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const created: Booking = { id: newId, ...newBooking, createdAt: now, updatedAt: now };
    setBookings((prev) => [created, ...prev]);
    return newId;
  }

  function handleAllocate(row: BookingRow) {
    setAllocateForId(row.id);
  }

  function setDriverForBooking(bookingId: string, driverName: string) {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, driver: driverName, status: "Allocated", updatedAt: now } : b)));
    setAllocateForId(null);
  }

  function generateInvoice(bookingId: string, details?: { rateBasis?: "per_pallet" | "per_space"; unitPrice?: number; pallets?: number; spaces?: number; chargeTo?: string; }) {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;
    const rateBasis = details?.rateBasis ?? b.rateBasis;
    const unitPrice = details?.unitPrice ?? b.unitPrice ?? 0;
    const pallets = details?.pallets ?? b.pallets ?? 0;
    const spaces = details?.spaces ?? b.spaces ?? 0;
    const total = (rateBasis === "per_space" ? spaces : pallets) * unitPrice;
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    toast({ title: "Invoice generated (demo)", description: `Created draft invoice for ${b.bookingId}` });
    setBookings((prev) => prev.map((x) => (x.id === bookingId ? { ...x, status: "Invoiced", rateBasis, unitPrice, pallets, spaces, chargeTo: (details?.chargeTo as any) ?? x.chargeTo, invoiceTotal: Number(total.toFixed(2)), updatedAt: now } : x)));
  }

  function handleSaveBooking(updated: Partial<Booking> & { id: string }) {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated, updatedAt: now } : b)));
    toast({ title: "Booking saved" });
  }

  function handleUploadPod(bookingId: string, file: File) {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, podFile: file, podReceived: true } : b)));
    toast({ title: "POD uploaded (demo)", description: `Attached ${file.name}` });
  }

  function renderLensTable() {
    // Custom view
    if (lens.startsWith("custom:")) {
      const base = customBase ?? "Admin";
      const colSet = new Set(customColumns ?? []);
      type Def = { key: string; label: string; render: (b: Booking) => JSX.Element };
      const adminDefs: Def[] = [
        { key: "bookingId", label: "Booking", render: (b) => <TableCell key="bookingId" className="font-medium">{b.bookingId}</TableCell> },
        { key: "customer", label: "Customer", render: (b) => <TableCell key="customer">{b.customer}</TableCell> },
        { key: "date", label: "Date", render: (b) => <TableCell key="date">{b.date ?? "-"}</TableCell> },
        { key: "pickup", label: "Pickup", render: (b) => <TableCell key="pickup">{b.pickup}</TableCell> },
        { key: "dropoff", label: "Dropoff", render: (b) => <TableCell key="dropoff">{b.dropoff}</TableCell> },
        { key: "chargeTo", label: "Charge To", render: (b) => <TableCell key="chargeTo">{b.chargeTo ?? "-"}</TableCell> },
        { key: "palletType", label: "Pallet Type", render: (b) => <TableCell key="palletType">{b.palletType ?? "-"}</TableCell> },
        { key: "transferType", label: "Transfer Type", render: (b) => <TableCell key="transferType">{b.transferType ?? "-"}</TableCell> },
        { key: "podMethod", label: "POD Method", render: (b) => <TableCell key="podMethod">{b.podMethod ?? "-"}</TableCell> },
        { key: "customerRef", label: "Customer Ref", render: (b) => <TableCell key="customerRef">{b.customerRef ?? "-"}</TableCell> },
        { key: "secondRef", label: "Second Ref", render: (b) => <TableCell key="secondRef">{b.secondRef ?? "-"}</TableCell> },
        { key: "podLink", label: "POD Link", render: (b) => <TableCell key="podLink">{b.podReceived ? (<Button size="sm" variant="outline" onClick={() => setPodPreviewForId(b.id)}>Preview</Button>) : "-"}</TableCell> },
        { key: "unitPrice", label: "Unit Price", render: (b) => <TableCell key="unitPrice">{typeof b.unitPrice === "number" ? `$${b.unitPrice.toFixed(2)}` : "-"}</TableCell> },
        { key: "rateBasis", label: "Rate Basis", render: (b) => <TableCell key="rateBasis">{b.rateBasis ? (<Badge variant={b.rateBasis === "per_pallet" ? "secondary" : "inactive"} className="rounded-full px-2 py-0.5">{b.rateBasis === "per_pallet" ? "Per Pallet" : "Per Space"}</Badge>) : "-"}</TableCell> },
        { key: "invoiceTotal", label: "Invoice Total", render: (b) => <TableCell key="invoiceTotal">{typeof b.invoiceTotal === "number" ? `$${b.invoiceTotal.toFixed(2)}` : "-"}</TableCell> },
        { key: "status", label: "Status", render: (b) => <TableCell key="status">{b.status}</TableCell> },
        { key: "actions", label: "Actions", render: (b) => <TableCell key="actions" className="text-right space-x-2"><Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>View Booking</Button></TableCell> },
      ];
      const allocationDefs: Def[] = [
        { key: "bookingId", label: "Booking", render: (b) => <TableCell key="bookingId" className="font-medium">{b.bookingId}</TableCell> },
        { key: "date", label: "Date", render: (b) => <TableCell key="date">{b.date ?? "-"}</TableCell> },
        { key: "pickup", label: "Pickup", render: (b) => <TableCell key="pickup">{b.pickup}</TableCell> },
        { key: "dropoff", label: "Dropoff", render: (b) => <TableCell key="dropoff">{b.dropoff}</TableCell> },
        { key: "suburb", label: "Suburb", render: (b) => <TableCell key="suburb">{b.suburb ?? "-"}</TableCell> },
        { key: "transferType", label: "Transfer Type", render: (b) => <TableCell key="transferType">{b.transferType ?? "-"}</TableCell> },
        { key: "podLink", label: "POD Link", render: (b) => <TableCell key="podLink">{b.podReceived ? (<Button size="sm" variant="outline" onClick={() => setPodPreviewForId(b.id)}>Preview</Button>) : "-"}</TableCell> },
        { key: "driver", label: "Driver", render: (b) => <TableCell key="driver">{b.driver ?? "Unassigned"}</TableCell> },
        { key: "actions", label: "Actions", render: (b) => (
          <TableCell key="actions" className="text-right space-x-2">
            <Button size="sm" variant="ghost" onClick={() => handleAllocate({ id: b.id, bookingId: b.bookingId, customer: b.customer, pickup: b.pickup, dropoff: b.dropoff, status: b.status, driver: b.driver, date: b.date })}>Allocate</Button>
            <Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>View Booking</Button>
          </TableCell>
        ) },
      ];
      const csDefs: Def[] = [
        { key: "bookingId", label: "Consignment #", render: (b) => <TableCell key="bookingId" className="font-medium">{b.bookingId}</TableCell> },
        { key: "customer", label: "Customer", render: (b) => <TableCell key="customer">{b.customer}</TableCell> },
        { key: "date", label: "Date", render: (b) => <TableCell key="date">{b.date ?? "-"}</TableCell> },
        { key: "pickup", label: "Pickup", render: (b) => <TableCell key="pickup">{b.pickup}</TableCell> },
        { key: "dropoff", label: "Dropoff", render: (b) => <TableCell key="dropoff">{b.dropoff}</TableCell> },
        { key: "customerRef", label: "Customer Ref", render: (b) => <TableCell key="customerRef">{b.customerRef ?? "-"}</TableCell> },
        { key: "secondRef", label: "Second Ref", render: (b) => <TableCell key="secondRef">{b.secondRef ?? "-"}</TableCell> },
        { key: "podLink", label: "POD Link", render: (b) => <TableCell key="podLink">{b.podReceived ? (<Button size="sm" variant="outline" onClick={() => setPodPreviewForId(b.id)}>Preview</Button>) : "-"}</TableCell> },
        { key: "status", label: "Status", render: (b) => <TableCell key="status">{b.status}</TableCell> },
        { key: "actions", label: "Actions", render: (b) => <TableCell key="actions" className="text-right"><Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>View Booking</Button></TableCell> },
      ];
      const defs = base === "Admin" ? adminDefs : base === "Allocation" ? allocationDefs : csDefs;
      const visible = defs.filter((d) => colSet.has(d.key));
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-b from-muted/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 shadow-sm">
              <TableRow>
                {visible.map((d) => (
                  <TableHead key={d.key} className={`text-[11px] uppercase tracking-wide text-muted-foreground ${d.key === "actions" ? "text-right" : ""}`}>{d.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  {visible.map((d) => d.render(b))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    if (lens === "Admin") {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-b from-muted/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 shadow-sm">
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Booking</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Pickup</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Dropoff</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Charge To</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Pallet Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Transfer Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">POD Method</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Unit Price</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Rate Basis</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Invoice Total</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.bookingId}</TableCell>
                  <TableCell>{b.customer}</TableCell>
                  <TableCell>{b.pickup}</TableCell>
                  <TableCell>{b.dropoff}</TableCell>
                  <TableCell>{b.chargeTo ?? "-"}</TableCell>
                  <TableCell>{b.palletType ?? "-"}</TableCell>
                  <TableCell>{b.transferType ?? "-"}</TableCell>
                  <TableCell>{b.podMethod ?? "-"}</TableCell>
                  <TableCell>{typeof b.unitPrice === "number" ? `$${b.unitPrice.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>
                    {b.rateBasis ? (
                      <Badge variant={b.rateBasis === "per_pallet" ? "secondary" : "inactive"} className="rounded-full px-2 py-0.5">
                        {b.rateBasis === "per_pallet" ? "Per Pallet" : "Per Space"}
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{typeof b.invoiceTotal === "number" ? `$${b.invoiceTotal.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>
                      View Booking
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (lens === "Allocation") {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-b from-muted/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 shadow-sm">
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Booking</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Pickup</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Dropoff</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Suburb</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Transfer Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Driver</TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const color = b.driver ? driverColorMap[b.driver] : undefined;
                const style = color ? { backgroundColor: `${color}1A` } as React.CSSProperties : undefined; // 10% tint
                return (
                <TableRow key={b.id} style={style}>
                  <TableCell className="font-medium">{b.bookingId}</TableCell>
                  <TableCell>{b.pickup}</TableCell>
                  <TableCell>{b.dropoff}</TableCell>
                  <TableCell>{b.suburb ?? "-"}</TableCell>
                  <TableCell>{b.transferType ?? "-"}</TableCell>
                  
                  <TableCell>{b.driver ?? "Unassigned"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleAllocate({ id: b.id, bookingId: b.bookingId, customer: b.customer, pickup: b.pickup, dropoff: b.dropoff, status: b.status, driver: b.driver, date: b.date })}>Allocate</Button>
                    <Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>
                      View Booking
                    </Button>
                  </TableCell>
                </TableRow>
              );})}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (lens === "Customer Service") {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-b from-muted/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 shadow-sm">
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Consignment #</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Pickup</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Dropoff</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Date</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Customer Ref</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Second Ref</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">POD</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.bookingId}</TableCell>
                  <TableCell>{b.customer}</TableCell>
                  <TableCell>{b.pickup}</TableCell>
                  <TableCell>{b.dropoff}</TableCell>
                  <TableCell>{b.date ?? "-"}</TableCell>
                  <TableCell>{b.customerRef ?? "-"}</TableCell>
                  <TableCell>{b.secondRef ?? "-"}</TableCell>
                  <TableCell>
                    {b.podReceived ? (
                      <Button size="sm" variant="outline" onClick={() => setPodPreviewForId(b.id)}>Preview</Button>
                    ) : (
                      "Pending"
                    )}
                  </TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setViewForId(b.id)}>View Booking</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // default
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage and track all transport bookings
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setDialogOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Bookings Today" value={kpi.total} icon={Loader2} />
        <KpiCard title="Draft Bookings" value={kpi.fmt(kpi.draft)} icon={Loader2} variant="warning" />
        <KpiCard title="Allocated Bookings" value={kpi.fmt(kpi.allocated)} icon={CheckCircle2} variant="success" />
        <KpiCard title="Invoiced Bookings" value={kpi.fmt(kpi.invoiced)} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by booking ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Allocated">Allocated</SelectItem>
            <SelectItem value="Invoiced">Invoiced</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={driverFilter} onValueChange={setDriverFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Suburb" value={suburbFilter} onChange={(e) => setSuburbFilter(e.target.value)} />
        <div className="col-span-2 flex items-center gap-2">
          <Input
            type="date"
            className="h-9 w-[140px] rounded-md border border-input bg-background/70 px-2 pr-8 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="Date"
          />
          {rangeMode && (
            <Input
              type="date"
              className="h-9 w-[140px] rounded-md border border-input bg-background/70 px-2 pr-8 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To"
            />
          )}
          <Button size="sm" variant="outline" onClick={() => {
            const today = new Date().toISOString().slice(0,10);
            setFromDate(today);
            setToDate("");
            setRangeMode(false);
          }}>Today</Button>
          <Button size="sm" variant={rangeMode ? "default" : "outline"} onClick={() => {
            setRangeMode((prev) => {
              const next = !prev;
              if (!next) setToDate("");
              if (next && !toDate) setToDate(fromDate || new Date().toISOString().slice(0,10));
              return next;
            });
          }}>Range</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">View:</div>
        <Select value={lens} onValueChange={(v) => setLens(v)}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Allocation">Allocation</SelectItem>
            <SelectItem value="Customer Service">Customer Service</SelectItem>
            {savedViews.length > 0 && (
              <>
                <div className="border-t my-1" />
                {savedViews.map((v) => (
                  <Button key={v.id} variant="ghost" className="w-full justify-start text-left" onClick={() => {
                    const p = v.payload || {};
                    setLens(`custom:${v.id}`);
                    setCustomBase((p.base as any) ?? "Admin");
                    setCustomColumns((p.columns as string[]) ?? []);
                    setStatusFilter(p.statusFilter ?? statusFilter);
                    setCustomerFilter(p.customerFilter ?? customerFilter);
                    setDriverFilter(p.driverFilter ?? driverFilter);
                    setSuburbFilter(p.suburbFilter ?? suburbFilter);
                    setFromDate(p.fromDate ?? fromDate);
                    setToDate(p.toDate ?? toDate);
                  }}>{v.name}</Button>
                ))}
              </>
            )}
            <div className="border-t my-1" />
            <Button variant="ghost" className="w-full justify-start text-left" onClick={() => setViewsOpen(true)}>Manage Views…</Button>
          </SelectContent>
        </Select>
      </div>

      {renderLensTable()}

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={(payload, allocate) => {
          const base: Omit<Booking, "id"> = {
            bookingId: payload.consignmentNo,
            customer: payload.customer,
            pickup: payload.pickupAddress,
            dropoff: payload.dropoffAddress,
            pickupSuburb: payload.pickupSuburb,
            dropoffSuburb: payload.dropoffSuburb,
            suburb: payload.dropoffSuburb,
            chargeTo: payload.customer as any,
            palletType: payload.palletType,
            transferType: payload.transferType,
            podMethod: payload.podMethod,
            specialInstructions: payload.instructions,
            customerRef: payload.customerRef,
            secondRef: payload.secondRef,
            date: payload.date,
            status: allocate ? "Allocated" : "Draft",
            driver: allocate ? "Unassigned" : undefined,
          };
          const createdId = handleCreateBooking(base);
          if (allocate) setAllocateForId(createdId);
        }}
      />

      <AllocateDriverDialog
        open={!!allocateForId}
        onOpenChange={(o) => !o && setAllocateForId(null)}
        onSelect={(driver) => allocateForId && setDriverForBooking(allocateForId, driver)}
      />

      <CreateRunsheetDialog
        open={runsheetOpen}
        onOpenChange={setRunsheetOpen}
        onCreate={({ driver, bookings: selected }) => {
          toast({ title: "Run sheet created", description: `${driver} with ${selected.length} booking(s)` });
          setRunsheetOpen(false);
        }}
      />

      <BookingViewDialog
        open={!!viewForId}
        onOpenChange={(o) => !o && setViewForId(null)}
        booking={viewForId ? bookings.find((b) => b.id === viewForId) ?? null : null}
        onSave={(updated) => handleSaveBooking(updated)}
        onInvoice={(id, details) => generateInvoice(id, details)}
        onUploadPod={(id, file) => handleUploadPod(id, file)}
      />

      <Dialog open={!!podPreviewForId} onOpenChange={(o) => !o && setPodPreviewForId(null)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>POD Preview</DialogTitle>
          </DialogHeader>
          <div className="h-[520px]">
            {(() => {
              const b = podPreviewForId ? bookings.find((x) => x.id === podPreviewForId) : null;
              return <PodViewer file={b?.podFile} height={500} />;
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <SavedViewsDialog
        open={viewsOpen}
        onOpenChange={setViewsOpen}
        current={{
          base: (lens.startsWith("custom:") ? (customBase ?? "Admin") : (lens as any)),
          statusFilter,
          customerFilter,
          driverFilter,
          suburbFilter,
          fromDate,
          toDate,
          columns: customColumns ?? undefined,
        }}
        columnSets={{
          Admin: [
            { key: "bookingId", label: "Booking" },
            { key: "customer", label: "Customer" },
            { key: "date", label: "Date" },
            { key: "pickup", label: "Pickup" },
            { key: "dropoff", label: "Dropoff" },
            { key: "chargeTo", label: "Charge To" },
            { key: "palletType", label: "Pallet Type" },
            { key: "transferType", label: "Transfer Type" },
            { key: "podMethod", label: "POD Method" },
            { key: "customerRef", label: "Customer Ref" },
            { key: "secondRef", label: "Second Ref" },
            { key: "podLink", label: "POD Link" },
            { key: "unitPrice", label: "Unit Price" },
            { key: "rateBasis", label: "Rate Basis" },
            { key: "invoiceTotal", label: "Invoice Total" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ],
          Allocation: [
            { key: "bookingId", label: "Booking" },
            { key: "date", label: "Date" },
            { key: "pickup", label: "Pickup" },
            { key: "dropoff", label: "Dropoff" },
            { key: "suburb", label: "Suburb" },
            { key: "transferType", label: "Transfer Type" },
            { key: "podLink", label: "POD Link" },
            { key: "driver", label: "Driver" },
            { key: "actions", label: "Actions" },
          ],
          "Customer Service": [
            { key: "bookingId", label: "Consignment #" },
            { key: "customer", label: "Customer" },
            { key: "date", label: "Date" },
            { key: "pickup", label: "Pickup" },
            { key: "dropoff", label: "Dropoff" },
            { key: "customerRef", label: "Customer Ref" },
            { key: "secondRef", label: "Second Ref" },
            { key: "podLink", label: "POD Link" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ],
        }}
        selectedColumns={customColumns ?? []}
        onApply={(p) => {
          if (!p) return;
          const id = String(Date.now());
          setLens(`custom:${id}`);
          setCustomBase((p.base as any) ?? "Admin");
          setCustomColumns((p.columns as string[]) ?? []);
          setStatusFilter(p.statusFilter ?? statusFilter);
          setCustomerFilter(p.customerFilter ?? customerFilter);
          setDriverFilter(p.driverFilter ?? driverFilter);
          setSuburbFilter(p.suburbFilter ?? suburbFilter);
          setFromDate(p.fromDate ?? fromDate);
          setToDate(p.toDate ?? toDate);
        }}
      />
    </div>
  );
}

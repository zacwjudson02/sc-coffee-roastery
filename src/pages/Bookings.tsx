import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { BookingDialog } from "@/components/bookings/BookingDialog";
import { BookingTable, BookingRow } from "@/components/shared/BookingTable";
import { EntityModal } from "@/components/shared/EntityModal";
import { AllocateDriverDialog } from "@/components/bookings/AllocateDriverDialog";

type Booking = {
  id: string;
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: "Draft" | "Confirmed" | "Allocated" | "Invoiced";
  driver?: string;
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
  },
  {
    id: "4",
    bookingId: "BK-2024-0147",
    customer: "Fast Track Transport",
    pickup: "Perth Hub",
    dropoff: "Fremantle",
    date: "2024-10-03",
    status: "Draft",
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

  const customers = useMemo(() => Array.from(new Set(bookings.map((b) => b.customer))), [bookings]);

  const filtered = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || booking.customer === customerFilter;
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFrom = !fromDate || booking.date >= fromDate;
    const matchesTo = !toDate || booking.date <= toDate;
    return matchesStatus && matchesCustomer && matchesSearch && matchesFrom && matchesTo;
  });

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
    const created: Booking = { id: newId, ...newBooking };
    setBookings((prev) => [created, ...prev]);
    return newId;
  }

  function handleAllocate(row: BookingRow) {
    setAllocateForId(row.id);
  }

  function setDriverForBooking(bookingId: string, driverName: string) {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, driver: driverName, status: "Allocated" } : b)));
    setAllocateForId(null);
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
        <Button onClick={() => setDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="From" />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="To" />
        </div>
      </div>

      <BookingTable
        data={rows}
        onAllocate={handleAllocate}
        onView={() => {}}
      />

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={(payload, allocate) => {
          const base: Omit<Booking, "id"> = {
            bookingId: payload.reference,
            customer: payload.customer,
            pickup: payload.pickup,
            dropoff: payload.dropoff,
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
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { BookingDialog } from "@/components/bookings/BookingDialog";

interface Booking {
  id: string;
  reference: string;
  customer: string;
  pickup: string;
  delivery: string;
  date: string;
  status: "new" | "allocated" | "dispatched" | "delivered";
  driver?: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    reference: "BK-2024-0150",
    customer: "ABC Logistics",
    pickup: "Melbourne Warehouse",
    delivery: "Sydney CBD",
    date: "2024-10-02",
    status: "dispatched",
    driver: "John Smith",
  },
  {
    id: "2",
    reference: "BK-2024-0149",
    customer: "XYZ Freight",
    pickup: "Brisbane Port",
    delivery: "Gold Coast",
    date: "2024-10-02",
    status: "delivered",
    driver: "Sarah Jones",
  },
  {
    id: "3",
    reference: "BK-2024-0148",
    customer: "Global Shipping Co",
    pickup: "Adelaide Depot",
    delivery: "Melbourne",
    date: "2024-10-02",
    status: "allocated",
    driver: "Mike Brown",
  },
  {
    id: "4",
    reference: "BK-2024-0147",
    customer: "Fast Track Transport",
    pickup: "Perth Hub",
    delivery: "Fremantle",
    date: "2024-10-03",
    status: "new",
  },
];

export default function Bookings() {
  const [bookings] = useState<Booking[]>(mockBookings);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "new":
        return "inactive";
      case "allocated":
        return "default";
      case "dispatched":
        return "progress";
      case "delivered":
        return "complete";
      default:
        return "default";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      booking.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.reference}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.pickup}</TableCell>
                <TableCell>{booking.delivery}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.driver || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BookingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

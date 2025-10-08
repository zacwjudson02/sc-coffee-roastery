import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useResources } from "@/hooks/use-resources";

type SimpleBooking = {
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  date: string;
};

type CreateRunsheetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { driver: string; bookings: SimpleBooking[] }) => void;
};

const MOCK_BOOKINGS: SimpleBooking[] = [
  { bookingId: "BK-2024-0151", customer: "ABC Logistics", pickup: "Melbourne Warehouse", dropoff: "Airport", date: "2024-09-22" },
  { bookingId: "BK-2024-0152", customer: "XYZ Freight", pickup: "Docklands", dropoff: "Geelong DC", date: "2024-09-22" },
  { bookingId: "BK-2024-0153", customer: "Global Shipping Co", pickup: "Brunswick", dropoff: "Airport", date: "2024-09-22" },
  { bookingId: "BK-2024-0154", customer: "Fast Movers", pickup: "Richmond", dropoff: "St Kilda", date: "2024-09-22" },
  { bookingId: "BK-2024-0155", customer: "Prime Logistics", pickup: "Southbank", dropoff: "Dandenong", date: "2024-09-22" },
  { bookingId: "BK-2024-0156", customer: "Metro Freight", pickup: "Footscray", dropoff: "Sunshine", date: "2024-09-22" },
];

export function CreateRunsheetDialog({ open, onOpenChange, onCreate }: CreateRunsheetDialogProps) {
  const [driver, setDriver] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { drivers: storeDrivers } = useResources();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_BOOKINGS;
    return MOCK_BOOKINGS.filter((b) =>
      [b.bookingId, b.customer, b.pickup, b.dropoff].some((v) => v.toLowerCase().includes(q))
    );
  }, [query]);

  function toggle(bookingId: string, checked: boolean | string) {
    setSelected((prev) => ({ ...prev, [bookingId]: Boolean(checked) }));
  }

  function handleCreate() {
    const chosen = MOCK_BOOKINGS.filter((b) => selected[b.bookingId]);
    if (!driver || chosen.length === 0) return;
    onCreate({ driver, bookings: chosen });
    // reset
    setDriver("");
    setQuery("");
    setSelected({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Create Run Sheet</DialogTitle>
          <DialogDescription>Select a driver and add bookings to the run.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Driver</div>
              <Select value={driver} onValueChange={setDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {storeDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="text-sm font-medium">Find bookings</div>
              <Input placeholder="Search by ID, customer, location" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 text-sm">
              <div className="text-muted-foreground">{Object.values(selected).filter(Boolean).length} selected</div>
              <div className="text-muted-foreground">{filtered.length} results</div>
            </div>
            <div className="max-h-[360px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Dropoff</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell>
                        <Checkbox checked={!!selected[b.bookingId]} onCheckedChange={(v) => toggle(b.bookingId, v)} />
                      </TableCell>
                      <TableCell className="font-medium">{b.bookingId}</TableCell>
                      <TableCell>{b.customer}</TableCell>
                      <TableCell>{b.pickup}</TableCell>
                      <TableCell>{b.dropoff}</TableCell>
                      <TableCell>{b.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!driver || Object.values(selected).every((v) => !v)}>Create Run Sheet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { SimpleBooking };



import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleBooking } from "@/components/runsheets/CreateRunsheetDialog";
import { useResources } from "@/hooks/use-resources";
import { useAppData } from "@/hooks/use-appdata";

type AllocateBookingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drivers: string[];
  onAllocate: (payload: { driver: string; bookings: SimpleBooking[] }) => void;
  bookings?: SimpleBooking[]; // optional; if omitted derive from store
  date?: string;
};

export function AllocateBookingsDialog({ open, onOpenChange, drivers, onAllocate, bookings: provided, date }: AllocateBookingsDialogProps) {
  const [driver, setDriver] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { drivers: storeDrivers } = useResources();
  const app = useAppData();

  const source: SimpleBooking[] = useMemo(() => {
    if (Array.isArray(provided)) return provided;
    const list = app.bookings
      .filter((b) => (!b.driver) && (!date || b.date === date))
      .map((b) => ({ bookingId: b.bookingId, customer: b.customerName, pickup: b.pickup, dropoff: b.dropoff, date: b.date })) as SimpleBooking[];
    return list;
  }, [provided, app.bookings, date]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((b) => [b.bookingId, b.customer, b.pickup, b.dropoff].some((v) => v.toLowerCase().includes(q)));
  }, [query, source]);

  function toggle(bookingId: string, checked: boolean | string) {
    setSelected((prev) => ({ ...prev, [bookingId]: Boolean(checked) }));
  }

  function handleAllocate() {
    const chosen = source.filter((b) => selected[b.bookingId]);
    if (!driver || chosen.length === 0) return;
    onAllocate({ driver, bookings: chosen });
    setDriver("");
    setQuery("");
    setSelected({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Allocate Unassigned Bookings</DialogTitle>
          <DialogDescription>Select a driver and allocate bookings to their run.</DialogDescription>
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
          <Button onClick={handleAllocate} disabled={!driver || Object.values(selected).every((v) => !v)}>Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { SimpleBooking };



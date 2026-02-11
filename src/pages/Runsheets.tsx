import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Filter, ClipboardList, Coffee } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus } from "lucide-react";
import { CreateRunsheetDialog } from "@/components/runsheets/CreateRunsheetDialog";
import { AllocateBookingsDialog } from "@/components/runsheets/AllocateBookingsDialog";
import { BookingViewDialog } from "@/components/bookings/BookingViewDialog";
import { useResources } from "@/hooks/use-resources";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreviewRunsheetDialog } from "@/components/runsheets/PreviewRunsheetDialog";

// ── Types ──────────────────────────────────────────────────────────────────────

type Job = {
  id: string;
  bookingId: string;
  pickup: string;
  dropoff: string;
  pickupSuburb?: string;
  dropoffSuburb?: string;
  pallets: number;
  spaces: number;
  palletType: string;
  transferMethod: string;
  suburb: string;
};

type DriverRunsheet = {
  driver: string;
  jobs: Job[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const TODAY = formatLocalDate(new Date());

// ── Seed demo runsheets (always available, no store dependency) ────────────────

function buildDemoRunsheets(): DriverRunsheet[] {
  return [
    {
      driver: "Jake Brennan",
      jobs: [
        { id: "demo-j1", bookingId: "ORD-2026-0201", pickup: "SC Roastery HQ", dropoff: "Noosa Cafe Strip", pickupSuburb: "Warana", dropoffSuburb: "Noosa Heads", pallets: 6, spaces: 6, palletType: "Standard", transferMethod: "Hand", suburb: "Noosa Heads" },
        { id: "demo-j2", bookingId: "ORD-2026-0205", pickup: "SC Roastery HQ", dropoff: "Peregian Beach Kiosk", pickupSuburb: "Warana", dropoffSuburb: "Peregian Beach", pallets: 2, spaces: 2, palletType: "Standard", transferMethod: "Hand", suburb: "Peregian Beach" },
      ],
    },
    {
      driver: "Lily Tran",
      jobs: [
        { id: "demo-j3", bookingId: "ORD-2026-0202", pickup: "SC Roastery HQ", dropoff: "Mooloolaba Esplanade", pickupSuburb: "Warana", dropoffSuburb: "Mooloolaba", pallets: 10, spaces: 10, palletType: "Standard", transferMethod: "Hand", suburb: "Mooloolaba" },
        { id: "demo-j4", bookingId: "ORD-2026-0206", pickup: "SC Roastery HQ", dropoff: "Alexandra Headland", pickupSuburb: "Warana", dropoffSuburb: "Alexandra Headland", pallets: 3, spaces: 3, palletType: "Standard", transferMethod: "Hand", suburb: "Alexandra Headland" },
      ],
    },
    {
      driver: "Sam Keogh",
      jobs: [
        { id: "demo-j5", bookingId: "ORD-2026-0203", pickup: "SC Roastery HQ", dropoff: "Caloundra Main St", pickupSuburb: "Warana", dropoffSuburb: "Caloundra", pallets: 4, spaces: 4, palletType: "Standard", transferMethod: "Hand", suburb: "Caloundra" },
        { id: "demo-j6", bookingId: "ORD-2026-0207", pickup: "SC Roastery HQ", dropoff: "Kawana Waters", pickupSuburb: "Warana", dropoffSuburb: "Kawana", pallets: 5, spaces: 5, palletType: "Standard", transferMethod: "Hand", suburb: "Kawana" },
      ],
    },
  ];
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Runsheets() {
  // State
  const [date, setDate] = useState(TODAY);
  const [driverFilter, setDriverFilter] = useState("all");
  const [runsheets, setRunsheets] = useState<DriverRunsheet[]>(buildDemoRunsheets);
  const { drivers: storeDrivers } = useResources();

  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openAllocate, setOpenAllocate] = useState(false);
  const [viewFor, setViewFor] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ driver: string } | null>(null);
  const [preview, setPreview] = useState<{ driver: string } | null>(null);

  // Derived driver list (merge store + UI)
  const drivers = useMemo(() => {
    const fromStore = storeDrivers.map((d) => d.name);
    const fromUi = runsheets.map((r) => r.driver);
    return Array.from(new Set([...fromStore, ...fromUi]));
  }, [storeDrivers, runsheets]);

  // Filtered view
  const visible = useMemo(() => {
    return runsheets.filter((r) => driverFilter === "all" || r.driver === driverFilter);
  }, [runsheets, driverFilter]);

  // Total job count
  const totalJobs = runsheets.reduce((sum, r) => sum + r.jobs.length, 0);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, fromDriver: string, jobId: string) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ fromDriver, jobId }));
  }

  function onDrop(e: React.DragEvent, toDriver: string, toIndex: number) {
    e.preventDefault();
    const { fromDriver, jobId } = JSON.parse(e.dataTransfer.getData("text/plain"));
    setRunsheets((prev) => {
      const copy = prev.map((r) => ({ ...r, jobs: [...r.jobs] }));
      const from = copy.find((r) => r.driver === fromDriver);
      const to = copy.find((r) => r.driver === toDriver);
      if (!from || !to) return prev;
      const idx = from.jobs.findIndex((j) => j.id === jobId);
      if (idx === -1) return prev;
      const [job] = from.jobs.splice(idx, 1);
      to.jobs.splice(toIndex, 0, job);
      return copy;
    });
  }

  // ── Create / Allocate handlers ───────────────────────────────────────────────

  function handleCreate({ driver, bookings }: { driver: string; bookings: any[] }) {
    const newSheet: DriverRunsheet = {
      driver,
      jobs: bookings.map((b, i) => ({
        id: `${b.bookingId}-${Date.now()}-${i}`,
        bookingId: b.bookingId,
        pickup: b.pickup,
        dropoff: b.dropoff,
        pickupSuburb: b.pickup,
        dropoffSuburb: b.dropoff,
        pallets: b.pallets ?? 1,
        spaces: b.spaces ?? 1,
        palletType: b.palletType || "Standard",
        transferMethod: "Hand",
        suburb: b.dropoff,
      })),
    };
    setRunsheets((prev) => [newSheet, ...prev]);
  }

  function handleAllocate({ driver, bookings }: { driver: string; bookings: any[] }) {
    setRunsheets((prev) => {
      const copy = prev.map((r) => ({ ...r, jobs: [...r.jobs] }));
      let target = copy.find((r) => r.driver === driver);
      if (!target) {
        target = { driver, jobs: [] };
        copy.unshift(target);
      }
      bookings.forEach((b, i) => {
        target!.jobs.push({
          id: `${b.bookingId}-${Date.now()}-${i}`,
          bookingId: b.bookingId,
          pickup: b.pickup,
          dropoff: b.dropoff,
          pickupSuburb: b.pickup,
          dropoffSuburb: b.dropoff,
          pallets: b.pallets ?? 1,
          spaces: b.spaces ?? 1,
          palletType: b.palletType || "Standard",
          transferMethod: "Hand",
          suburb: b.dropoff,
        });
      });
      return copy;
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runsheets</h1>
          <p className="text-muted-foreground">Assemble and dispatch delivery runs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenAllocate(true)} className="bg-accent hover:bg-accent/90">
            <ClipboardList className="h-4 w-4 mr-2" /> Allocate Unassigned
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b text-sm flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</div>
          <div className="text-xs text-muted-foreground">{date} &middot; {totalJobs} job{totalJobs !== 1 ? "s" : ""} across {runsheets.length} driver{runsheets.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="p-4 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" /> {date || "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date ? parseLocalDate(date) : undefined} onSelect={(d) => setDate(d ? formatLocalDate(d) : TODAY)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => setDate(TODAY)}>Today</Button>

          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Drivers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {drivers.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => { setDate(TODAY); setDriverFilter("all"); }}>Clear</Button>
        </div>
      </div>

      {/* Runsheet cards */}
      {visible.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Coffee className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No runsheets for this date.</p>
          <p className="text-sm text-muted-foreground mt-1">Select a different date or create a new runsheet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((r) => (
            <div key={r.driver} className="rounded-lg border bg-card">
              {/* Driver header */}
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <div className="font-medium">{r.driver} <span className="text-xs text-muted-foreground ml-1">({r.jobs.length} stop{r.jobs.length !== 1 ? "s" : ""})</span></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview({ driver: r.driver })}>Preview</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete({ driver: r.driver })}>Delete</Button>
                </div>
              </div>

              {/* Jobs */}
              <div className="px-2 py-2">
                {r.jobs.map((j, idx) => (
                  <div
                    key={j.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.driver, j.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, r.driver, idx)}
                    className="flex items-start gap-2 rounded-md border p-2 mb-1.5 bg-background hover:shadow-sm transition-shadow"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-1 cursor-grab" />
                    <div className="flex-1 space-y-1.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Pickup</div>
                          <div className="text-base md:text-lg font-semibold text-foreground">{j.pickup}</div>
                          {j.pickupSuburb && <div className="text-xs text-muted-foreground">{j.pickupSuburb}</div>}
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Dropoff</div>
                          <div className="text-base md:text-lg font-semibold text-foreground">{j.dropoff}</div>
                          {j.dropoffSuburb && <div className="text-xs text-muted-foreground">{j.dropoffSuburb}</div>}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{j.bookingId}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <div><span className="uppercase">Pallets</span>: <span className="font-medium text-foreground">{j.pallets}</span></div>
                        <div><span className="uppercase">Spaces</span>: <span className="font-medium text-foreground">{j.spaces}</span></div>
                        <div><span className="uppercase">Type</span>: <span className="font-medium text-foreground">{j.palletType}</span></div>
                        <div><span className="uppercase">Suburb</span>: <span className="font-medium text-foreground">{j.suburb}</span></div>
                      </div>
                      <div className="flex justify-end pt-0.5">
                        <Button size="sm" variant="outline" onClick={() => setViewFor({
                          id: j.bookingId,
                          bookingId: j.bookingId,
                          customer: j.suburb,
                          pickup: j.pickup,
                          dropoff: j.dropoff,
                          date: date || TODAY,
                          status: "Allocated",
                          createdAt: "",
                          updatedAt: "",
                        })}>View Order</Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Drop zone at end */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, r.driver, r.jobs.length)}
                  className="h-9 border-2 border-dashed rounded-md flex items-center justify-center text-[11px] text-muted-foreground"
                >
                  Drop here to add to end
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button className="shadow-xl rounded-full h-12 px-6" onClick={() => setOpenCreate(true)}>
          <Plus className="h-5 w-5 mr-2" /> Add Run Sheet
        </Button>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────────── */}

      <CreateRunsheetDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={handleCreate}
      />

      <AllocateBookingsDialog
        open={openAllocate}
        onOpenChange={setOpenAllocate}
        drivers={drivers}
        onAllocate={handleAllocate}
      />

      <BookingViewDialog
        open={!!viewFor}
        onOpenChange={(o) => !o && setViewFor(null)}
        booking={viewFor}
        onSave={() => setViewFor(null)}
        onInvoice={() => {}}
        onUploadPod={(id, file) => setViewFor((prev: any) => (prev && prev.id === id ? { ...prev, podFile: file, podReceived: true } : prev))}
      />

      <PreviewRunsheetDialog
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        date={date || TODAY}
        driverName={preview?.driver || ""}
        jobs={(() => {
          if (!preview) return [];
          const rs = runsheets.find((r) => r.driver === preview.driver);
          if (!rs) return [];
          return rs.jobs.map((j) => ({
            id: j.id,
            bookingId: j.bookingId,
            pickup: j.pickup,
            dropoff: j.dropoff,
            pallets: j.pallets,
            spaces: j.spaces,
            palletType: j.palletType,
            transferMethod: j.transferMethod,
          }));
        })()}
        onPrint={() => window.print()}
        onDelete={() => {
          if (!preview) return;
          setConfirmDelete({ driver: preview.driver });
          setPreview(null);
        }}
      />

      {/* Confirm delete */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Delete Run Sheet</DialogTitle>
            <DialogDescription>All jobs on this run sheet will be unassigned.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>Driver: <span className="font-medium">{confirmDelete?.driver}</span></div>
            <div className="text-muted-foreground">Jobs: {confirmDelete ? (runsheets.find((r) => r.driver === confirmDelete.driver)?.jobs.length ?? 0) : 0}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (!confirmDelete) return;
              setRunsheets((prev) => prev.filter((r) => r.driver !== confirmDelete.driver));
              setConfirmDelete(null);
            }}>Delete Run Sheet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Filter, ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, GripVertical, Plus, Printer, Send } from "lucide-react";
import { CreateRunsheetDialog } from "@/components/runsheets/CreateRunsheetDialog";
import { AllocateBookingsDialog } from "@/components/runsheets/AllocateBookingsDialog";
import { BookingViewDialog } from "@/components/bookings/BookingViewDialog";
import { ShiftViewDialog } from "@/components/shifts/ShiftViewDialog";
import { useResources } from "@/hooks/use-resources";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreviewRunsheetDialog } from "@/components/runsheets/PreviewRunsheetDialog";

type Job = {
  id: string;
  bookingId: string;
  type: "Pickup" | "Dropoff";
  address: string;
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
  routeSummary: string;
  start: string;
  finish: string;
  jobs: Job[];
  open?: boolean;
};

const MOCK: DriverRunsheet[] = [
  {
    driver: "John Smith",
    routeSummary: "Melbourne CBD ⇄ Airport",
    start: "07:30",
    finish: "14:45",
    jobs: [
      { id: "j1", bookingId: "BK-2024-0150", type: "Pickup", address: "Melbourne Warehouse", pickup: "Melbourne Warehouse", dropoff: "Sydney CBD", pickupSuburb: "Melbourne", dropoffSuburb: "Sydney", pallets: 2, spaces: 2, palletType: "CHEP", transferMethod: "Fork", suburb: "Melbourne" },
      { id: "j2", bookingId: "BK-2024-0148", type: "Dropoff", address: "Melbourne", pickup: "Adelaide Depot", dropoff: "Melbourne", pickupSuburb: "Adelaide", dropoffSuburb: "Melbourne", pallets: 1, spaces: 1, palletType: "Standard", transferMethod: "Tailgate", suburb: "Melbourne" },
    ],
    open: true,
  },
  {
    driver: "Sarah Jones",
    routeSummary: "Brisbane South",
    start: "08:00",
    finish: "16:00",
    jobs: [
      { id: "j3", bookingId: "BK-2024-0149", type: "Pickup", address: "Brisbane Port", pickup: "Brisbane Port", dropoff: "Gold Coast", pickupSuburb: "Brisbane", dropoffSuburb: "Gold Coast", pallets: 3, spaces: 2, palletType: "Loscam", transferMethod: "Fork", suburb: "Brisbane" },
      { id: "j4", bookingId: "BK-2024-0147", type: "Dropoff", address: "Fremantle", pickup: "Perth Hub", dropoff: "Fremantle", pickupSuburb: "Perth", dropoffSuburb: "Fremantle", pallets: 2, spaces: 2, palletType: "Standard", transferMethod: "Hand unload", suburb: "Gold Coast" },
    ],
  },
];

export default function Runsheets() {
  const [date, setDate] = useState("");
  const [driverFilter, setDriverFilter] = useState("all");
  const { drivers: storeDrivers, shifts, ensureShift, ensureRunsheet, addJobsToRunsheet, runsheets: storeRunsheets, deleteRunsheet, removeShift, getRunsheetBy } = useResources();
  const [runsheets, setRunsheets] = useState<DriverRunsheet[]>(MOCK);
  const [openCreate, setOpenCreate] = useState(false);
  const [openAllocate, setOpenAllocate] = useState(false);
  const [viewFor, setViewFor] = useState<any | null>(null);
  const [viewShift, setViewShift] = useState<{ driver: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ shiftId: string; driver: string } | null>(null);
  const [preview, setPreview] = useState<{ driver: string } | null>(null);
  const drivers = useMemo(() => Array.from(new Set(MOCK.map((r) => r.driver))), []);

  function onDragStart(e: React.DragEvent<HTMLDivElement>, fromDriver: string, jobId: string) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ fromDriver, jobId }));
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>, toDriver: string, toIndex: number) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { fromDriver, jobId } = data as { fromDriver: string; jobId: string };
    setRunsheets((prev) => {
      const copy = prev.map((r) => ({ ...r, jobs: [...r.jobs] }));
      const from = copy.find((r) => r.driver === fromDriver)!;
      const to = copy.find((r) => r.driver === toDriver)!;
      const idx = from.jobs.findIndex((j) => j.id === jobId);
      if (idx === -1) return prev;
      const [job] = from.jobs.splice(idx, 1);
      to.jobs.splice(toIndex, 0, job);
      return copy;
    });
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runsheets</h1>
          <p className="text-muted-foreground">Assemble and dispatch driver runs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenAllocate(true)} className="bg-accent hover:bg-accent/90">
            <ClipboardList className="h-4 w-4 mr-2" /> Allocate Unassigned
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b text-sm flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</div>
          <div className="text-xs text-muted-foreground">{date || "No date selected"}</div>
        </div>
        <div className="p-4 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start"><CalendarIcon className="h-4 w-4 mr-2" /> {date || "Select date"}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date ? new Date(date) : undefined} onSelect={(d) => setDate(d ? d.toISOString().slice(0,10) : "")} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => setDate(new Date().toISOString().slice(0,10))}>Today</Button>

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

          <Button variant="outline" size="sm" onClick={() => { setDate(""); setDriverFilter("all"); }}>Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {runsheets
          .filter((r) => driverFilter === "all" || r.driver === driverFilter)
          .map((r) => (
            <div key={r.driver} className="rounded-lg border bg-card">
              <div className="px-3 py-2 border-b flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{r.driver}</div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <Button variant="outline" size="sm" onClick={() => setPreview({ driver: r.driver })}>Preview</Button>
                </div>
              </div>
              <div className="px-2 py-2">
                {r.jobs.map((j, idx) => (
                  <div
                    key={j.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.driver, j.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, r.driver, idx)}
                    className="flex items-start gap-2 rounded-md border p-2 mb-1.5 bg-background"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
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
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <div><span className="uppercase">Pallets</span>: <span className="font-medium text-foreground">{j.pallets}</span></div>
                        <div><span className="uppercase">Spaces</span>: <span className="font-medium text-foreground">{j.spaces}</span></div>
                        <div><span className="uppercase">Pallet</span>: <span className="font-medium text-foreground">{j.palletType}</span></div>
                        <div><span className="uppercase">Transfer</span>: <span className="font-medium text-foreground">{j.transferMethod}</span></div>
                        <div><span className="uppercase">Suburb</span>: <span className="font-medium text-foreground">{j.suburb}</span></div>
                      </div>
                      <div className="flex justify-end pt-0.5">
                        <Button size="sm" variant="outline" onClick={() => setViewFor({
                          id: j.bookingId,
                          bookingId: j.bookingId,
                          customer: "Demo Customer",
                          pickup: j.pickup,
                          dropoff: j.dropoff,
                          date: date || new Date().toISOString().slice(0,10),
                          status: "Allocated",
                          createdAt: "",
                          updatedAt: "",
                        })}>View Booking</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* drop at end */}
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

      <div className="fixed bottom-6 right-6 z-40">
        <Button className="shadow-xl rounded-full h-12 px-6" onClick={() => setOpenCreate(true)}>
          <Plus className="h-5 w-5 mr-2" /> Add Run Sheet
        </Button>
      </div>

      <CreateRunsheetDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={({ driver, bookings }) => {
          setRunsheets((prev) => [
            {
              driver,
              routeSummary: `${bookings[0]?.pickup ?? "Start"} → ${bookings[bookings.length - 1]?.dropoff ?? "End"}`,
              start: "08:00",
              finish: "16:00",
              jobs: bookings.map((b, i) => ({
                id: `${b.bookingId}-${i}`,
                bookingId: b.bookingId,
                type: i === 0 ? "Pickup" : "Dropoff",
                address: i === 0 ? b.pickup : b.dropoff,
                pickup: b.pickup,
                dropoff: b.dropoff,
                pickupSuburb: b.pickup,
                dropoffSuburb: b.dropoff,
                pallets: 1,
                spaces: 1,
                palletType: "Standard",
                transferMethod: "Fork",
                suburb: (i === 0 ? b.pickup : b.dropoff).split(" ").slice(-1)[0] || "",
              })),
              open: true,
            },
            ...prev,
          ]);
          // Ensure underlying shift+runsheet in store for persistence and View Shift linkage
          const d = storeDrivers.find((x) => x.name === driver);
          if (d) {
            const runDate = date || new Date().toISOString().slice(0,10);
            const shiftId = ensureShift(runDate, d.id);
            ensureRunsheet(shiftId);
            const jobs = bookings.map((b, i) => ({
              id: `${b.bookingId}-${Date.now()}-${i}`,
              bookingId: b.bookingId,
              pickup: b.pickup,
              dropoff: b.dropoff,
              pickupSuburb: b.pickup,
              dropoffSuburb: b.dropoff,
              pallets: 1,
              spaces: 1,
              palletType: "Standard",
              transferMethod: "Fork",
              suburb: b.dropoff,
            }));
            addJobsToRunsheet(shiftId, jobs);
          }
        }}
      />

      <AllocateBookingsDialog
        open={openAllocate}
        onOpenChange={setOpenAllocate}
        drivers={drivers}
        onAllocate={({ driver, bookings }) => {
          setRunsheets((prev) => {
            // ensure driver runsheet exists
            const next = prev.map((r) => ({ ...r, jobs: [...r.jobs] }));
            let target = next.find((r) => r.driver === driver);
            if (!target) {
              target = {
                driver,
                routeSummary: `${bookings[0]?.pickup ?? "Start"} → ${bookings[bookings.length - 1]?.dropoff ?? "End"}`,
                start: "08:00",
                finish: "16:00",
                jobs: [],
                open: true,
              };
              next.unshift(target);
            }
            const toAppend: Job[] = bookings.map((b, i) => ({
              id: `${b.bookingId}-${Date.now()}-${i}`,
              bookingId: b.bookingId,
              type: "Pickup" as const,
              address: b.pickup,
              pickup: b.pickup,
              dropoff: b.dropoff,
              pickupSuburb: b.pickup,
              dropoffSuburb: b.dropoff,
              pallets: 1,
              spaces: 1,
              palletType: "Standard",
              transferMethod: "Fork",
              suburb: b.dropoff,
            }));
            target.jobs.push(...toAppend);
            return next;
          });
          // Also ensure underlying store-level shift+runsheet so View Shift works
          const d = storeDrivers.find((x) => x.name === driver);
          if (d && bookings.length > 0) {
            const runDate = date || bookings[0].date || new Date().toISOString().slice(0,10);
            const shiftId = ensureShift(runDate, d.id);
            ensureRunsheet(shiftId);
            const toJobs = bookings.map((b, i) => ({
              id: `${b.bookingId}-${Date.now()}-${i}`,
              bookingId: b.bookingId,
              pickup: b.pickup,
              dropoff: b.dropoff,
              pickupSuburb: b.pickup,
              dropoffSuburb: b.dropoff,
              pallets: 1,
              spaces: 1,
              palletType: "Standard",
              transferMethod: "Fork",
              suburb: b.dropoff,
            }));
            addJobsToRunsheet(shiftId, toJobs);
          }
        }}
      />

      <BookingViewDialog
        open={!!viewFor}
        onOpenChange={(o) => !o && setViewFor(null)}
        booking={viewFor}
        onSave={() => setViewFor(null)}
        onInvoice={() => {}}
        onUploadPod={(id, file) => setViewFor((prev: any) => (prev && prev.id === id ? { ...prev, podFile: file, podReceived: true } : prev))}
      />

      <ShiftViewDialog
        open={!!viewShift}
        onOpenChange={(o) => !o && setViewShift(null)}
        shift={(() => {
          if (!viewShift) return null;
          const d = storeDrivers.find((x) => x.name === viewShift.driver);
          if (!d) return null;
          const s = shifts.find((x) => (!date || x.date === date) && x.driverId === d.id);
          return s ?? null;
        })()}
        suggest={(() => {
          if (!viewShift) return null;
          const d = storeDrivers.find((x) => x.name === viewShift.driver);
          if (!d) return null;
          const s = shifts.find((x) => (!date || x.date === date) && x.driverId === d.id);
          if (s) return null;
          const runDate = date || new Date().toISOString().slice(0,10);
          return { date: runDate, driverId: d.id };
        })()}
      />

      <PreviewRunsheetDialog
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        date={date || new Date().toISOString().slice(0,10)}
        driverName={preview?.driver || ""}
        jobs={(() => {
          if (!preview) return [] as any[];
          // Prefer the UI runsheet jobs for immediate preview
          const ui = runsheets.find((r) => r.driver === preview.driver);
          if (ui && ui.jobs && ui.jobs.length > 0) {
            return ui.jobs.map((j) => ({ id: j.id, bookingId: j.bookingId, pickup: j.pickup, dropoff: j.dropoff, pallets: j.pallets, spaces: j.spaces, palletType: j.palletType, transferMethod: j.transferMethod }));
          }
          // Fallback to backing store runsheet if created via ensureRunsheet/addJobsToRunsheet
          const d = storeDrivers.find((x) => x.name === preview.driver);
          const s = d ? shifts.find((x) => (!date || x.date === date) && x.driverId === d.id) : null;
          const rs = s ? storeRunsheets.find((r) => r.shiftId === s.id) : null;
          if (rs && rs.jobs) {
            return rs.jobs.map((j) => ({ id: j.id, bookingId: j.bookingId, pickup: j.pickup, dropoff: j.dropoff, pallets: j.pallets, spaces: j.spaces, palletType: j.palletType, transferMethod: j.transferMethod }));
          }
          return [] as any[];
        })()}
        onPrint={() => window.print()}
        onDelete={() => {
          if (!preview) return;
          const d = storeDrivers.find((x) => x.name === preview.driver);
          if (!d) return;
          const s = shifts.find((x) => (!date || x.date === date) && x.driverId === d.id);
          if (s) setConfirmDelete({ shiftId: s.id, driver: preview.driver });
          setPreview(null);
        }}
      />

      {/* Confirm delete run sheet dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Delete Run Sheet</DialogTitle>
            <DialogDescription>All jobs on this run sheet will be unassigned. You can also delete the underlying shift.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>Driver: {confirmDelete ? confirmDelete.driver : ""}</div>
            <div className="text-muted-foreground">This action affects only today’s selection unless a date is set.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="secondary" onClick={() => {
              if (!confirmDelete) return;
              const shiftId = confirmDelete.shiftId;
              // Remove jobs from UI mock and delete underlying store runsheet
              setRunsheets((prev) => prev.filter((r) => r.driver !== confirmDelete.driver));
              deleteRunsheet(shiftId);
              setConfirmDelete(null);
            }}>Delete Run Sheet</Button>
            <Button variant="destructive" onClick={() => {
              if (!confirmDelete) return;
              const shiftId = confirmDelete.shiftId;
              setRunsheets((prev) => prev.filter((r) => r.driver !== confirmDelete.driver));
              deleteRunsheet(shiftId);
              removeShift(shiftId);
              setConfirmDelete(null);
            }}>Delete Run Sheet & Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



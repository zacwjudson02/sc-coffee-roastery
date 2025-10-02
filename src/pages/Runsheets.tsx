import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, GripVertical, Plus, Printer, Send } from "lucide-react";
import { CreateRunsheetDialog } from "@/components/runsheets/CreateRunsheetDialog";

type Job = {
  id: string;
  bookingId: string;
  type: "Pickup" | "Dropoff";
  address: string;
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
      { id: "j1", bookingId: "BK-2024-0150", type: "Pickup", address: "Melbourne Warehouse" },
      { id: "j2", bookingId: "BK-2024-0148", type: "Dropoff", address: "Sydney CBD" },
    ],
    open: true,
  },
  {
    driver: "Sarah Jones",
    routeSummary: "Brisbane South",
    start: "08:00",
    finish: "16:00",
    jobs: [
      { id: "j3", bookingId: "BK-2024-0149", type: "Pickup", address: "Brisbane Port" },
      { id: "j4", bookingId: "BK-2024-0147", type: "Dropoff", address: "Gold Coast" },
    ],
  },
];

export default function Runsheets() {
  const [date, setDate] = useState("");
  const [driverFilter, setDriverFilter] = useState("all");
  const [runsheets, setRunsheets] = useState<DriverRunsheet[]>(MOCK);
  const [openCreate, setOpenCreate] = useState(false);
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Runsheets</h1>
        <p className="text-muted-foreground">Assemble and dispatch driver runs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select value={driverFilter} onValueChange={setDriverFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {runsheets
          .filter((r) => driverFilter === "all" || r.driver === driverFilter)
          .map((r) => (
            <div key={r.driver} className="rounded-lg border bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="space-y-0.5">
                  <div className="font-medium">{r.driver}</div>
                  <div className="text-xs text-muted-foreground">{r.routeSummary} • {r.start} → {r.finish}</div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Print Runsheet</Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90"><Send className="h-4 w-4 mr-1" /> Send to Driver</Button>
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
                    className="flex items-center gap-3 rounded-md border p-3 mb-2 bg-background"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">{j.type}</div>
                    <div className="text-muted-foreground text-sm">{j.bookingId} • {j.address}</div>
                  </div>
                ))}
                {/* drop at end */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, r.driver, r.jobs.length)}
                  className="h-10 border-2 border-dashed rounded-md flex items-center justify-center text-xs text-muted-foreground"
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
              jobs: bookings.map((b, i) => ({ id: `${b.bookingId}-${i}`, bookingId: b.bookingId, type: i === 0 ? "Pickup" : "Dropoff", address: i === 0 ? b.pickup : b.dropoff })),
              open: true,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}



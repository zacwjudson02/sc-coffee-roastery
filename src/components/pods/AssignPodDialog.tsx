import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PodViewer } from "@/components/pods/PodViewer";
import { demoOcr, DemoOcrResult } from "@/lib/ocrDemo";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type AssignChoice = {
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  date: string;
};

type AssignPodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  file?: File;
  choices: AssignChoice[];
  onAssign: (bookingId: string) => void;
};

export function AssignPodDialog({ open, onOpenChange, fileName, file, choices, onAssign }: AssignPodDialogProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [ocr, setOcr] = useState<DemoOcrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState({ customer: "", pickup: "", dropoff: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return choices;
    return choices.filter((c) => [c.bookingId, c.customer, c.pickup, c.dropoff].some((v) => v.toLowerCase().includes(q)));
  }, [choices, query]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!file) return;
      setLoading(true);
      const res = await demoOcr(file);
      if (!active) return;
      setOcr(res);
      setLoading(false);
      if (res.extractedBookingId) setSelected(res.extractedBookingId);
      setEditable({
        customer: res.fields.customer ?? "",
        pickup: res.fields.pickup ?? "",
        dropoff: res.fields.dropoff ?? "",
      });
    }
    if (open) run();
    return () => { active = false; };
  }, [open, file]);

  function handleAssign() {
    if (!selected) return;
    onAssign(selected);
    setSelected("");
    setQuery("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Assign POD to Booking</DialogTitle>
          <DialogDescription>Choose the correct booking for the uploaded POD.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Panel 1: Preview */}
          <div className="border rounded-md overflow-hidden">
            <div className="px-3 py-2 text-sm border-b">Preview</div>
            <PodViewer file={file} height={420} />
          </div>

          {/* Panel 2: OCR Extract */}
          <div className="border rounded-md overflow-hidden">
            <div className="px-3 py-2 text-sm border-b">Extracted Data (OCR)</div>
            <div className="p-3 text-sm space-y-3">
              {loading && <div className="text-muted-foreground">Running OCR…</div>}
              {!loading && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-xs text-muted-foreground">Booking ID</div>
                  <div className="text-sm font-mono">{ocr?.fields.bookingId || "-"}</div>

                  <div className="grid grid-cols-1 gap-1">
                    <Label className="text-xs text-muted-foreground">Customer</Label>
                    <Input value={editable.customer} onChange={(e) => setEditable((v) => ({ ...v, customer: e.target.value }))} placeholder="Detected customer" />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <Label className="text-xs text-muted-foreground">Pickup</Label>
                    <Input value={editable.pickup} onChange={(e) => setEditable((v) => ({ ...v, pickup: e.target.value }))} placeholder="Detected pickup" />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <Label className="text-xs text-muted-foreground">Dropoff</Label>
                    <Input value={editable.dropoff} onChange={(e) => setEditable((v) => ({ ...v, dropoff: e.target.value }))} placeholder="Detected dropoff" />
                  </div>

                  <div className="pt-1"><span className="text-muted-foreground">Match:</span> {ocr?.matchPercent ?? 0}%</div>
                </div>
              )}
              <div className="pt-2 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={async () => { if (file) { setLoading(true); const res = await demoOcr(file); setOcr(res); setEditable({ customer: res.fields.customer ?? "", pickup: res.fields.pickup ?? "", dropoff: res.fields.dropoff ?? "" }); setLoading(false); } }}>Re-run OCR</Button>
                <Button size="sm" onClick={() => { if (ocr?.extractedBookingId) setSelected(ocr.extractedBookingId); }}>Use Detected Booking</Button>
              </div>
            </div>
          </div>

          {/* Panel 3: Candidate Bookings */}
          <div className="border rounded-md overflow-hidden">
            <div className="px-3 py-2 text-sm border-b flex items-center justify-between gap-2">
              <Input placeholder="Search bookings by ID, customer, location" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Dropoff</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.bookingId} className={selected === row.bookingId ? "bg-muted/40" : undefined}>
                      <TableCell>
                        <input
                          type="radio"
                          name="booking"
                          checked={selected === row.bookingId}
                          onChange={() => setSelected(row.bookingId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.bookingId}</TableCell>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>{row.pickup}</TableCell>
                      <TableCell>{row.dropoff}</TableCell>
                      <TableCell>{row.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selected}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResources } from "@/hooks/use-resources";
import { StatusChip } from "@/components/shared/StatusChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PreviewRunsheetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  driverName: string;
  onDelete?: () => void;
  onPrint?: () => void;
  jobs?: { id: string; bookingId: string; pickup: string; dropoff: string; pallets?: number; spaces?: number; palletType?: string; transferMethod?: string }[];
};

export function PreviewRunsheetDialog({ open, onOpenChange, date, driverName, onDelete, onPrint, jobs }: PreviewRunsheetDialogProps) {
  const { drivers, shifts, runsheets, vehicles, updateShift } = useResources();
  const d = drivers.find((x) => x.name === driverName);
  const s = shifts.find((x) => x.driverId === d?.id && x.date === date);
  const rs = runsheets.find((r) => r.shiftId === s?.id);
  const vehicleRego = vehicles.find((v) => v.id === s?.vehicleId)?.rego || "-";
  const [form, setForm] = useState<{ status: "planned" | "in_progress" | "completed" | "cancelled"; start: string; end: string; vehicleId: string | "none"; notes: string } | null>(null);

  useEffect(() => {
    if (!s) { setForm(null); return; }
    setForm({ status: s.status ?? "planned", start: s.start ?? "", end: s.end ?? "", vehicleId: s.vehicleId ?? "none", notes: s.notes ?? "" });
  }, [s]);

  const jobRows = ((rs && rs.jobs && rs.jobs.length > 0) ? rs.jobs : (jobs ?? [])) as { id: string; bookingId: string; pickup: string; dropoff: string; pallets?: number; spaces?: number; palletType?: string; transferMethod?: string }[];
  const [showNote, setShowNote] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Run Sheet Preview</DialogTitle>
          <DialogDescription>Review the entries for this run sheet before printing or making changes.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/30 px-3 py-2">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div>
                <div className="text-xs text-muted-foreground">Driver</div>
                <div className="font-medium">{driverName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="font-medium">{date || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vehicle</div>
                {form ? (
                  <Select value={form.vehicleId} onValueChange={(v) => setForm((f) => f ? ({ ...f, vehicleId: v as any }) : f)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.rego}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (<div className="font-medium">{vehicleRego}</div>)}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Shift Status</div>
                {form ? (
                  <Select value={form.status} onValueChange={(v) => setForm((f) => f ? ({ ...f, status: v as any }) : f)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusChip status={(s?.status === 'in_progress' ? 'In Progress' : s?.status === 'completed' ? 'Completed' : s?.status === 'cancelled' ? 'Cancelled' : 'Planned')} />
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Start</div>
                {form ? (<Input className="h-8 text-xs" type="time" value={form.start} onChange={(e) => setForm((f) => f ? ({ ...f, start: e.target.value }) : f)} />) : (<div className="font-medium">{s?.start || '-'}</div>)}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">End</div>
                {form ? (<Input className="h-8 text-xs" type="time" value={form.end} onChange={(e) => setForm((f) => f ? ({ ...f, end: e.target.value }) : f)} />) : (<div className="font-medium">{s?.end || '-'}</div>)}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setShowNote((v) => !v)}>Add Note</Button>
            </div>
          </div>
          {showNote && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Notes</div>
              {form ? (
                <Textarea className="text-xs" value={form.notes} onChange={(e) => setForm((f) => f ? ({ ...f, notes: e.target.value }) : f)} rows={2} />
              ) : (
                <div className="text-sm">{s?.notes || '-'}</div>
              )}
            </div>
          )}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dropoff</TableHead>
                  <TableHead>Pallets</TableHead>
                  <TableHead>Spaces</TableHead>
                  <TableHead>Pallet Type</TableHead>
                  <TableHead>Transfer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-sm text-muted-foreground">No jobs on this run sheet.</TableCell>
                  </TableRow>
                ) : (
                  jobRows.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium">{j.bookingId}</TableCell>
                      <TableCell>{j.pickup}</TableCell>
                      <TableCell>{j.dropoff}</TableCell>
                      <TableCell>{typeof j.pallets === 'number' ? j.pallets : '-'}</TableCell>
                      <TableCell>{typeof j.spaces === 'number' ? j.spaces : '-'}</TableCell>
                      <TableCell>{j.palletType ?? '-'}</TableCell>
                      <TableCell>{j.transferMethod ?? '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="secondary" onClick={onPrint}>Print</Button>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
          <Button
            disabled={!s || !form}
            onClick={() => {
              if (!s || !form) return;
              updateShift(s.id, {
                status: form.status,
                start: form.start || undefined,
                end: form.end || undefined,
                vehicleId: form.vehicleId === "none" ? undefined : form.vehicleId,
                notes: form.notes || undefined,
              });
            }}
          >Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



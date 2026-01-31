import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useResources, type Shift } from "@/hooks/use-resources";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type ShiftViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  suggest?: { date: string; driverId: string } | null; // when no shift exists yet
};

export function ShiftViewDialog({ open, onOpenChange, shift, suggest }: ShiftViewDialogProps) {
  const { drivers, vehicles, ensureShift, ensureRunsheet, updateShift } = useResources();
  const navigate = useNavigate();

  const meta = useMemo(() => {
    if (!shift) return { driverName: "", vehicleRego: "" };
    const driverName = drivers.find((d) => d.id === shift.driverId)?.name || "";
    const vehicleRego = vehicles.find((v) => v.id === shift.vehicleId)?.rego || "";
    return { driverName, vehicleRego };
  }, [shift, drivers, vehicles]);

  const [form, setForm] = useState<{ status: Shift["status"]; start: string; end: string; vehicleId: string | undefined }>({ status: "planned", start: "", end: "", vehicleId: undefined });

  useEffect(() => {
    if (shift) {
      setForm({ status: shift.status ?? "planned", start: shift.start ?? "", end: shift.end ?? "", vehicleId: shift.vehicleId });
    }
  }, [shift]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Shift Details</DialogTitle>
          <DialogDescription>
            {shift ? `${meta.driverName} • ${shift.date}` : "No shift found for this selection."}
          </DialogDescription>
        </DialogHeader>

        {shift ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Driver</div>
                <div className="font-medium">{meta.driverName || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vehicle</div>
                <Select value={form.vehicleId ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v === "none" ? undefined : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.rego}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Start</div>
                <Input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">End</div>
                <Input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Select value={form.status ?? "planned"} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Shift["status"] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="font-medium">{shift.date}</div>
              </div>
            </div>
            {shift.notes && (
              <div className="rounded-md border p-3 bg-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <div>{shift.notes}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">No shift found for this selection.</div>
            {suggest ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">{suggest.date}</div>
                </div>
                <Button onClick={() => {
                  const id = ensureShift(suggest.date, suggest.driverId);
                  ensureRunsheet(id);
                  onOpenChange(false);
                  navigate(`/demo/runsheets?date=${encodeURIComponent(suggest.date)}&driverId=${encodeURIComponent(suggest.driverId)}`);
                }}>Create Shift</Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Select a date and driver with an existing shift, or create a shift from the Resources page.</div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            disabled={!shift}
            variant="secondary"
            onClick={() => {
              if (!shift) return;
              updateShift(shift.id, { status: form.status, start: form.start || undefined, end: form.end || undefined, vehicleId: form.vehicleId });
              onOpenChange(false);
            }}
          >Save</Button>
          <Button
            disabled={!shift}
            onClick={() => {
              if (!shift) return;
              navigate(`/demo/runsheets?date=${encodeURIComponent(shift.date)}&driverId=${encodeURIComponent(shift.driverId)}`);
              onOpenChange(false);
            }}
          >Open Runsheet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



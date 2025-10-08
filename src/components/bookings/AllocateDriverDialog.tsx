import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResources } from "@/hooks/use-resources";

type AllocateDriverDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (driver: string) => void;
};

export function AllocateDriverDialog({ open, onOpenChange, onSelect }: AllocateDriverDialogProps) {
  const [driver, setDriver] = useState<string>("");
  const { drivers } = useResources();
  const ordered = useMemo(() => {
    const copy = [...drivers];
    copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [drivers]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Allocate Driver</DialogTitle>
          <DialogDescription>Select a driver to allocate this booking.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Select value={driver} onValueChange={setDriver}>
            <SelectTrigger>
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {ordered.map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: d.color || "#e5e7eb" }} />
                    <span>{d.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!driver} onClick={() => onSelect(driver)}>Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




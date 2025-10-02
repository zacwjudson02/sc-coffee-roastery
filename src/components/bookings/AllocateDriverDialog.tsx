import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AllocateDriverDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (driver: string) => void;
};

const MOCK_DRIVERS = [
  { name: "John Smith" },
  { name: "Sarah Jones" },
  { name: "Mike Brown" },
  { name: "Priya Patel" },
];

export function AllocateDriverDialog({ open, onOpenChange, onSelect }: AllocateDriverDialogProps) {
  const [driver, setDriver] = useState<string>("");
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
              {MOCK_DRIVERS.map((d) => (
                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
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




import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (payload: {
    reference: string;
    customer: string;
    pickup: string;
    dropoff: string;
    date: string;
    notes?: string;
    files?: File[];
  }, allocate: boolean) => void;
}

export function BookingDialog({ open, onOpenChange, onCreate }: BookingDialogProps) {
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reference = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const seq = String(d.getTime()).slice(-4);
    return `BK-${y}-${seq}`;
  }, [open]);

  function reset() {
    setCustomer("");
    setDate("");
    setPickup("");
    setDropoff("");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(allocate: boolean) {
    const files = Array.from(fileInputRef.current?.files ?? []);
    onCreate?.({ reference, customer, pickup, dropoff, date, notes, files }, allocate);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Create a new transport booking. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABC Logistics">ABC Logistics</SelectItem>
                  <SelectItem value="XYZ Freight">XYZ Freight</SelectItem>
                  <SelectItem value="Global Shipping Co">Global Shipping Co</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <Input id="pickup" placeholder="Enter pickup address" value={pickup} onChange={(e) => setPickup(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">Dropoff Location</Label>
            <Input id="delivery" placeholder="Enter delivery address" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any special handling instructions..." 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <Input ref={fileInputRef} type="file" multiple accept=".pdf,.xls,.xlsx,image/*" />
            <p className="text-xs text-muted-foreground">PDF, Excel, or images.</p>
          </div>
        </div>

        <DialogFooter>
          <div className="mr-auto text-xs text-muted-foreground">Reference: {reference}</div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSubmit(false)}>Save as Draft</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => handleSubmit(true)}>Save & Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

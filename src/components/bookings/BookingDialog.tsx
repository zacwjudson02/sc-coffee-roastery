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
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
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
              <Select>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc">ABC Logistics</SelectItem>
                  <SelectItem value="xyz">XYZ Freight</SelectItem>
                  <SelectItem value="global">Global Shipping Co</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Booking Date</Label>
              <Input id="date" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <Input id="pickup" placeholder="Enter pickup address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">Delivery Location</Label>
            <Input id="delivery" placeholder="Enter delivery address" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="0" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pieces">Number of Pieces</Label>
              <Input id="pieces" type="number" placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any special handling instructions..." 
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => onOpenChange(false)}>
            Create Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { useAppData } from "@/hooks/use-appdata";

export type CreateBookingPayload = {
  consignmentNo: string;
  customer: string;
  customerId?: string;
  pickupAddress: string;
  pickupSuburb: string;
  dropoffAddress: string;
  dropoffSuburb: string;
  date: string;
  palletType: "Standard" | "Chep" | "Loscam" | "Other";
  transferType: "Metro" | "Regional" | "Linehaul" | "Other";
  podMethod: "Paper" | "Digital" | "Photo" | "Other";
  instructions?: string;
  customerRef?: string;
  secondRef?: string;
  pallets?: number;
  spaces?: number;
  files?: File[];
};

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (payload: CreateBookingPayload, allocate: boolean) => void;
}

export function BookingDialog({ open, onOpenChange, onCreate }: BookingDialogProps) {
  const { customers } = useAppData();
  const [customer, setCustomer] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupSuburb, setPickupSuburb] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffSuburb, setDropoffSuburb] = useState("");
  const [pallets, setPallets] = useState<number>(0);
  const [spaces, setSpaces] = useState<number>(0);
  const [palletType, setPalletType] = useState<"Standard" | "Chep" | "Loscam" | "Other" | "">("");
  const [transferType, setTransferType] = useState<"Metro" | "Regional" | "Linehaul" | "Other" | "">("");
  const [podMethod, setPodMethod] = useState<"Paper" | "Digital" | "Photo" | "Other" | "">("");
  const [instructions, setInstructions] = useState("");
  const [customerRef, setCustomerRef] = useState("");
  const [secondRef, setSecondRef] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reference = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const seq = String(d.getTime()).slice(-4);
    return `JNL-${y}-${seq}`;
  }, [open]);

  function reset() {
    setCustomer("");
    setCustomerId(undefined);
    setDate("");
    setPickupAddress("");
    setPickupSuburb("");
    setDropoffAddress("");
    setDropoffSuburb("");
    setPallets(0);
    setSpaces(0);
    setPalletType("");
    setTransferType("");
    setPodMethod("");
    setInstructions("");
    setCustomerRef("");
    setSecondRef("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(allocate: boolean) {
    const files = Array.from(fileInputRef.current?.files ?? []);
    onCreate?.({
      consignmentNo: reference,
      customer,
      customerId,
      pickupAddress,
      pickupSuburb,
      dropoffAddress,
      dropoffSuburb,
      date,
      pallets,
      spaces,
      palletType: palletType as any,
      transferType: transferType as any,
      podMethod: podMethod as any,
      instructions,
      customerRef,
      secondRef,
      files,
    }, allocate);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
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
            <Select value={customerId ?? ""} onValueChange={(v) => { setCustomerId(v); const c = customers.find((x) => x.id === v); setCustomer(c?.company || ""); }}>
                <SelectTrigger id="customer">
                <SelectValue placeholder={customer || "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pallets">Pallets</Label>
            <Input id="pallets" type="number" value={pallets} onChange={(e) => setPallets(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spaces">Spaces</Label>
            <Input id="spaces" type="number" value={spaces} onChange={(e) => setSpaces(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Input id="pickupAddress" placeholder="Full pickup address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupSuburb">Pickup Suburb</Label>
              <Input id="pickupSuburb" placeholder="Suburb" value={pickupSuburb} onChange={(e) => setPickupSuburb(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dropoffAddress">Dropoff Address</Label>
              <Input id="dropoffAddress" placeholder="Full dropoff address" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffSuburb">Dropoff Suburb</Label>
              <Input id="dropoffSuburb" placeholder="Suburb" value={dropoffSuburb} onChange={(e) => setDropoffSuburb(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pallet Type</Label>
              <Select value={palletType} onValueChange={(v) => setPalletType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pallet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Chep">Chep</SelectItem>
                  <SelectItem value="Loscam">Loscam</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transfer Type</Label>
              <Select value={transferType} onValueChange={(v) => setTransferType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transfer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Metro">Metro</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Linehaul">Linehaul</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>POD Method</Label>
              <Select value={podMethod} onValueChange={(v) => setPodMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select POD method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paper">Paper</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Photo">Photo</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea 
              id="instructions" 
              placeholder="Add any special handling instructions..." 
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerRef">Customer Reference</Label>
              <Input id="customerRef" placeholder="Customer-supplied reference" value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondRef">Second Reference</Label>
              <Input id="secondRef" placeholder="Optional secondary reference" value={secondRef} onChange={(e) => setSecondRef(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <Input ref={fileInputRef} type="file" multiple accept=".pdf,.xls,.xlsx,image/*" />
            <p className="text-xs text-muted-foreground">PDF, Excel, or images.</p>
          </div>
        </div>

        <DialogFooter>
          <div className="mr-auto text-xs text-muted-foreground">Consignment #: {reference}</div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSubmit(false)}>Save as Draft</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => handleSubmit(true)}>Save & Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

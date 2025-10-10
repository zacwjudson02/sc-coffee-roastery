import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PodViewer } from "@/components/pods/PodViewer";
import { Dialog as BaseDialog, DialogContent as BaseContent, DialogHeader as BaseHeader, DialogTitle as BaseTitle } from "@/components/ui/dialog";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDateAU, formatDateTimeAU } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppData } from "@/hooks/use-appdata";

type CustomerRate = { id: string; description: string; basis: "per_pallet" | "per_space"; amount: number };

function InvoiceTab({ booking, onInvoice }: { booking: any; onInvoice: (id: string, details: { rateBasis: "per_pallet" | "per_space"; unitPrice: number; pallets: number; spaces: number; chargeTo?: string; }) => void }) {
  const { toast } = useToast();
  const [invoiced, setInvoiced] = useState<boolean>(booking.status === "Invoiced");
  const [rateMode, setRateMode] = useState<"per_pallet" | "per_space">("per_pallet");
  const [pallets, setPallets] = useState<number>(booking.pallets || 0);
  const [spaces, setSpaces] = useState<number>(booking.spaces || 0);
  const [unitPrice, setUnitPrice] = useState<number>(Number((booking.rateAmount ?? 0)));
  const [customer, setCustomer] = useState<string>(booking.customer ?? "");
  const [rateSelectOpen, setRateSelectOpen] = useState(false);
  const [newRateOpen, setNewRateOpen] = useState(false);

  const mockRates: CustomerRate[] = [
    { id: "r1", description: "Metro base per pallet", basis: "per_pallet", amount: 45 },
    { id: "r2", description: "Regional per pallet", basis: "per_pallet", amount: 60 },
    { id: "r3", description: "Linehaul per space", basis: "per_space", amount: 120 },
  ];

  const total = rateMode === "per_pallet" ? (pallets * unitPrice) : (spaces * unitPrice);

  return (
    <div className="space-y-4">
      {invoiced ? (
        <div className="rounded border p-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Charge To</div>
              <div className="text-sm">{customer || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rate Basis</div>
              <div className="text-sm">{rateMode === "per_pallet" ? "Per Pallet" : "Per Space"}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Pallets</div>
              <div className="text-sm">{pallets}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Spaces</div>
              <div className="text-sm">{spaces}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Charge</div>
              <div className="text-sm font-medium">${total.toFixed(2)}</div>
            </div>
          </div>
          <div>
            <Button variant="outline" onClick={() => setRateSelectOpen(true)}>Change Rate</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Rate Basis</div>
              <Select value={rateMode} onValueChange={(v) => setRateMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_pallet">Per Pallet</SelectItem>
                  <SelectItem value="per_space">Per Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Unit Price</div>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Charge To</div>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Pallets</div>
              <Input type="number" value={pallets} onChange={(e) => setPallets(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Spaces</div>
              <Input type="number" value={spaces} onChange={(e) => setSpaces(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Total</div>
              <Input readOnly value={`$${total.toFixed(2)}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setRateSelectOpen(true)}>Select Rate</Button>
            <Button variant="outline" onClick={() => setNewRateOpen(true)}>New Rate</Button>
            <Button onClick={() => { onInvoice(booking.id, { rateBasis: rateMode, unitPrice, pallets, spaces, chargeTo: customer }); setInvoiced(true); }}>Send to Invoice</Button>
          </div>
        </div>
      )}

      {/* Rate Selection Modal */}
      <Dialog open={rateSelectOpen} onOpenChange={setRateSelectOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Select Customer Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {mockRates.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <div className="text-sm font-medium">{r.description}</div>
                  <div className="text-xs text-muted-foreground">Basis: {r.basis === "per_pallet" ? "Per Pallet" : "Per Space"} • Unit ${r.amount.toFixed(2)}</div>
                </div>
                <Button size="sm" onClick={() => { setRateMode(r.basis); setUnitPrice(r.amount); setRateSelectOpen(false); }}>Use Rate</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Rate Modal */}
      <Dialog open={newRateOpen} onOpenChange={setNewRateOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create New Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Basis</div>
              <Select value={rateMode} onValueChange={(v) => setRateMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_pallet">Per Pallet</SelectItem>
                  <SelectItem value="per_space">Per Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Unit Price</div>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setNewRateOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast({ title: "Rate created (demo)" }); setNewRateOpen(false); }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type BookingViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any | null;
  onSave: (updated: { id: string; [k: string]: any }) => void;
  onInvoice: (id: string, details?: { rateBasis?: "per_pallet" | "per_space"; unitPrice?: number; pallets?: number; spaces?: number; chargeTo?: string }) => void;
  onUploadPod: (id: string, file: File) => void;
};

export function BookingViewDialog({ open, onOpenChange, booking, onSave, onInvoice, onUploadPod }: BookingViewDialogProps) {
  const { customers } = useAppData();
  const [tab, setTab] = useState<"details" | "pod" | "invoice">("details");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<any | null>(null);
  const current = useMemo(() => form ?? booking, [form, booking]);
  const hasPod = Boolean(booking?.podFile) || Boolean(booking?.podReceived);

  if (!booking) return null;

  function handleSave() {
    if (!current) return;
    onSave({ id: booking.id, ...current });
    onOpenChange(false);
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file) {
      onUploadPod(booking.id, file);
      setTab("pod");
      // clear value so the same file can be re-picked if needed
      e.currentTarget.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>Booking {booking.bookingId}</DialogTitle>
          <DialogDescription>
            Consignment created {booking.createdAt ? formatDateTimeAU(booking.createdAt) : "-"} • Updated {booking.updatedAt ? formatDateTimeAU(booking.updatedAt) : "-"}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-3 mb-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Customer</div>
            <div className="font-medium">{booking.customer}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium">{booking.status}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Invoice Total</div>
            <div className="font-medium">{typeof booking.invoiceTotal === "number" ? `$${booking.invoiceTotal.toFixed(2)}` : "-"}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Button variant={tab === "details" ? "default" : "outline"} size="sm" onClick={() => setTab("details")}>Details</Button>
            <Button variant={tab === "pod" ? "default" : "outline"} size="sm" onClick={() => setTab("pod")}>POD</Button>
            <Button variant={tab === "invoice" ? "default" : "outline"} size="sm" onClick={() => setTab("invoice")} disabled={!hasPod}>Invoice</Button>
          </div>
          {!hasPod && (
            <Alert>
              <AlertTitle>POD required before invoicing</AlertTitle>
              <AlertDescription>Upload or attach a POD to enable the Invoice tab.</AlertDescription>
            </Alert>
          )}

          {tab === "details" && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <Select value={(current.customerId as any) || ""} onValueChange={(v) => {
                      const selected = customers.find((c) => c.id === v);
                      setForm({ ...(current || {}), customerId: v, customer: selected?.company || current.customer });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={current.customer || "Select customer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={current.status} onValueChange={(v) => setForm({ ...(current || {}), status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Allocated">Allocated</SelectItem>
                        <SelectItem value="Invoiced">Invoiced</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Address</Label>
                    <Input value={current.pickup ?? ""} onChange={(e) => setForm({ ...(current || {}), pickup: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dropoff Address</Label>
                    <Input value={current.dropoff ?? ""} onChange={(e) => setForm({ ...(current || {}), dropoff: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pickup Suburb</Label>
                    <Input value={current.pickupSuburb ?? ""} onChange={(e) => setForm({ ...(current || {}), pickupSuburb: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dropoff Suburb</Label>
                    <Input value={current.dropoffSuburb ?? ""} onChange={(e) => setForm({ ...(current || {}), dropoffSuburb: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pallet Type</Label>
                    <Select value={current.palletType ?? ""} onValueChange={(v) => setForm({ ...(current || {}), palletType: v })}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Select value={current.transferType ?? ""} onValueChange={(v) => setForm({ ...(current || {}), transferType: v })}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Select value={current.podMethod ?? ""} onValueChange={(v) => setForm({ ...(current || {}), podMethod: v })}>
                      <SelectTrigger>
                        <SelectValue />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pallets</Label>
                    <Input type="number" value={current.pallets ?? 0} onChange={(e) => setForm({ ...(current || {}), pallets: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Spaces</Label>
                    <Input type="number" value={current.spaces ?? 0} onChange={(e) => setForm({ ...(current || {}), spaces: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Reference</Label>
                    <Input value={current.customerRef ?? ""} onChange={(e) => setForm({ ...(current || {}), customerRef: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Second Reference</Label>
                    <Input value={current.secondRef ?? ""} onChange={(e) => setForm({ ...(current || {}), secondRef: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea rows={3} value={current.specialInstructions ?? ""} onChange={(e) => setForm({ ...(current || {}), specialInstructions: e.target.value })} />
                </div>
            </div>
          )}

          {tab === "pod" && (
             <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <div className="text-sm text-muted-foreground">Upload or view existing POD</div>
                 <div className="flex items-center gap-2 ml-auto">
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFilePicked} />
                  <Button size="sm" onClick={() => fileRef.current?.click()}>Upload POD</Button>
                   <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)}>Email POD</Button>
                 </div>
               </div>
               <div className="h-[520px] border rounded">
                 <PodViewer file={booking.podFile} height={460} />
               </div>
             </div>
           )}

        {tab === "invoice" && hasPod && (
           <InvoiceTab booking={booking} onInvoice={(id, details) => onInvoice(id, details)} />
         )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>

      {/* Email POD Dialog (reusing app email pattern) */}
      <BaseDialog open={emailOpen} onOpenChange={setEmailOpen}>
        <BaseContent className="sm:max-w-[720px]">
          <BaseHeader>
            <BaseTitle>Email POD</BaseTitle>
          </BaseHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">To</div>
                <Input placeholder="email@company.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">CC</div>
                <Input placeholder="cc@company.com" value={emailCc} onChange={(e) => setEmailCc(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Subject</div>
                <Input placeholder={`POD for ${booking.bookingId}`} value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Message</div>
              <BaseTextarea rows={6} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your message..." />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
              <Button onClick={() => setEmailOpen(false)}>Send Email</Button>
            </div>
          </div>
        </BaseContent>
      </BaseDialog>
    </Dialog>
  );
}



import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusChip } from "@/components/shared/StatusChip";
import { EntityModal } from "@/components/shared/EntityModal";
import { isXeroConnected, connectXero, disconnectXero, sendBatchToXero, mapToXeroPayload, sendInvoiceToXero } from "@/lib/xeroDemo";
import { toast } from "@/components/ui/use-toast";
import { useInvoices } from "@/hooks/use-invoices";
import { useAppData } from "@/hooks/use-appdata";
import { BookingViewDialog } from "@/components/bookings/BookingViewDialog";
import { usePodStore } from "@/hooks/use-podstore";
import { formatDateAU, formatCurrency } from "@/lib/utils";

export default function Invoices() {
  const { invoices, createInvoice, markStatus, addLine, removeInvoice, updateInvoice } = useInvoices();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [viewScope, setViewScope] = useState<"active" | "archived" | "all">("active");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [view, setView] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [newDesc, setNewDesc] = useState("");
  const [newQty, setNewQty] = useState<number>(1);
  const [newPrice, setNewPrice] = useState<number>(0);
  const { bookings, updateBooking } = useAppData();
  const { setFile } = usePodStore();
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const filtersDirty = (search.trim().length > 0) || status !== "all" || viewScope !== "active" || !!fromDate || !!toDate;

  const rows = useMemo(() => invoices.map((inv) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    customer: inv.customer,
    date: inv.date,
    amount: formatCurrency(inv.total ?? 0),
    status: inv.status,
    archived: Boolean(inv.archivedAt),
  })), [invoices]);

  const filtered = rows.filter((r) => {
    const matchesStatus = status === "all" || r.status === status;
    const matchesSearch = r.invoiceNo.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase());
    const matchesFrom = !fromDate || invDateISO(r.date) >= fromDate;
    const matchesTo = !toDate || invDateISO(r.date) <= toDate;
    const matchesScope = viewScope === "all" || (viewScope === "active" ? !r.archived : r.archived);
    return matchesStatus && matchesSearch && matchesFrom && matchesTo && matchesScope;
  });

  function invDateISO(display: string): string {
    // display is dd-mm-yyyy, convert to yyyy-mm-dd for comparisons
    const m = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return display;
  }

  function createNewInvoice() {
    const today = new Date().toISOString().slice(0,10);
    const id = createInvoice({ customer: "New Customer", date: today, lines: [], status: "Draft" });
    setView(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Create, send, and track customer invoices</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={async () => {
            try {
              setConnecting(true);
              if (!isXeroConnected()) {
                await connectXero();
                toast({ title: "Connected to Xero" });
              } else {
                await disconnectXero();
                toast({ title: "Disconnected from Xero" });
              }
            } finally {
              setConnecting(false);
            }
          }}>{isXeroConnected() ? "Disconnect Xero" : "Connect Xero"}</Button>
          <Button onClick={createNewInvoice}>New Invoice</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input placeholder="Search by number or customer" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-3" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={viewScope} onValueChange={(v) => setViewScope(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[160px]" />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[160px]" />
        <div className="flex items-center gap-2 ml-1">
          <Button size="sm" variant="outline" onClick={() => {
            const today = new Date().toISOString().slice(0,10);
            setFromDate(today);
            setToDate("");
          }}>Today</Button>
          <Button size="sm" variant="outline" onClick={() => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay()); // Sunday start
            setFromDate(start.toISOString().slice(0,10));
            setToDate("");
          }}>This week</Button>
          <Button size="sm" variant="outline" onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setFromDate(start.toISOString().slice(0,10));
            setToDate("");
          }}>This month</Button>
        </div>
        <Button variant={filtersDirty ? "destructive" : "outline"} onClick={() => { setSearch(""); setStatus("all"); setViewScope("active"); setFromDate(""); setToDate(""); }}>Clear</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2 w-8"><input type="checkbox" onChange={(e) => {
                const checked = e.target.checked;
                const next: Record<string, boolean> = {};
                filtered.forEach((r) => next[r.id] = checked);
                setSelected(next);
              }} /></th>
              <th className="px-4 py-2">Invoice #</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))} /></td>
                <td className="px-4 py-2 font-medium">{r.invoiceNo}</td>
                <td className="px-4 py-2">{r.customer}</td>
                <td className="px-4 py-2">{formatDateAU(r.date)}</td>
                <td className="px-4 py-2">{r.amount}</td>
                <td className="px-4 py-2">
                  {(() => {
                    const inv = invoices.find((x) => x.id === r.id);
                    if (!inv) return <StatusChip status={r.status} />;
                    if (inv.status === "Delivered" && inv.deliveredAt && !inv.archivedAt) {
                      const days = Math.floor((Date.now() - new Date(inv.deliveredAt).getTime()) / (1000 * 60 * 60 * 24));
                      if (days >= 28) {
                        return <StatusChip status={"Needs Review"} />; // red
                      }
                      if (days >= 21) {
                        return <StatusChip status={"Pending"} />; // yellow
                      }
                    }
                    return <StatusChip status={r.status} />;
                  })()}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setView(r.id)}>View</Button>
                  {(() => {
                    const inv = invoices.find((x) => x.id === r.id);
                    if (!inv) return null;
                    if (inv.status === "Draft") return null;
                    if (inv.status === "Confirmed") {
                      return (
                        <Button size="sm" variant="ghost" onClick={() => {
                          const now = new Date().toISOString();
                          markStatus(r.id, "Delivered");
                          updateInvoice(r.id, { deliveredAt: now });
                          toast({ title: "Invoice delivered", description: `${r.invoiceNo} marked as Delivered` });
                        }}>Delivered</Button>
                      );
                    }
                    if (inv.status === "Delivered") {
                      return (
                        <Button size="sm" variant="ghost" onClick={() => {
                          if (!confirm(`Reconcile ${r.invoiceNo}?`)) return;
                          const now = new Date().toISOString();
                          markStatus(r.id, "Paid");
                          updateInvoice(r.id, { archivedAt: now });
                          toast({ title: "Invoice reconciled", description: `${r.invoiceNo} marked as Paid` });
                        }}>Reconcile</Button>
                      );
                    }
                    return null;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Selected: {Object.values(selected).filter(Boolean).length}</div>
        <div className="space-x-2">
          <Button disabled={!isXeroConnected() || sending || Object.values(selected).every((v) => !v)} onClick={async () => {
            setSending(true);
            setLog([]);
            try {
              const pick = filtered.filter((r) => selected[r.id]);
              if (pick.length === 0) return;
              const payloads = pick.map((p) => mapToXeroPayload({ invoiceNo: p.invoiceNo, customer: p.customer, date: p.date, amount: p.amount }));
              const res = await sendBatchToXero(payloads, (i, total, result) => {
                setLog((l) => [`${i}/${total}: ${result.message}`, ...l]);
                // Mark status on success
                if (result.ok) {
                  const inv = pick[i - 1];
                  if (inv?.id) markStatus(inv.id, "Confirmed");
                }
              });
              toast({ title: `Xero: ${res.sent} sent, ${res.failed} failed` });
            } catch (e: any) {
              toast({ title: "Xero send failed", description: e?.message ?? String(e) });
            } finally {
              setSending(false);
            }
          }}>Send Selected to Xero</Button>
        </div>
      </div>

      <div className="rounded-md border p-3 bg-muted/10">
        <div className="text-sm font-medium mb-1">Activity Log</div>
        <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-auto">
          {log.length === 0 ? <div>No activity yet.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      <EntityModal
        open={!!view}
        onOpenChange={(o) => !o && setView(null)}
        title={(() => { const inv = invoices.find((x) => x.id === view); return inv ? inv.invoiceNo : "Invoice"; })()}
        primaryAction={{ label: "Close", onClick: () => setView(null) }}
      >
        {(() => {
          const inv = invoices.find((x) => x.id === view);
          if (!inv) return null;

          // Derive booking-sourced lines (read-only) from bookings store via invoice.source
          const bookingLines = (inv.source ?? []).map((s) => {
            if (s.type !== "booking") return null;
            const b = bookings.find((bk) => bk.id === s.id);
            if (!b) return null;
            const rateBasis = (b.rateBasis ?? "per_pallet") as "per_pallet" | "per_space";
            const quantity = rateBasis === "per_space" ? (b.spaces ?? 0) : (b.pallets ?? 0);
            const unitPrice = b.unitPrice ?? 0;
            const total = quantity * unitPrice;
            const description = `Transport ${b.pickup} → ${b.dropoff}`;
            return { key: b.id, description, quantity, unitPrice, total };
          }).filter(Boolean) as { key: string; description: string; quantity: number; unitPrice: number; total: number }[];

          // Treat invoice.lines as additional/custom lines; hide any duplicates of booking-derived lines
          const customLines = inv.lines.filter((l) => !bookingLines.some((bl) => bl.description === l.description && bl.quantity === l.quantity && bl.unitPrice === l.unitPrice && bl.total === l.total));

          const bookingSubtotal = bookingLines.reduce((s, l) => s + l.total, 0);
          const customSubtotal = customLines.reduce((s, l) => s + l.total, 0);
          const displayTotal = bookingSubtotal + customSubtotal; // display-only; store has its own total

          return (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Customer</div>
                  <div className="font-medium">{inv.customer}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Invoice Date</div>
                  <div className="font-medium">{formatDateAU(inv.date)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium">{inv.status}</div>
            </div>
          </div>
              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Customer</div>
                <div className="text-sm">{inv.customer}</div>
                {inv.customerId && (
                  <div className="text-xs text-muted-foreground">Customer ID: {inv.customerId}</div>
                )}
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    const target = inv.customerId ?? inv.customer;
                    window.location.href = `/customers#${encodeURIComponent(target)}`;
                  }}>View customer</Button>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Booking Lines (read-only)</div>
                {bookingLines.length === 0 ? (
                  <div className="text-muted-foreground">No booking lines.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="px-2 py-1">Description</th>
                        <th className="px-2 py-1">Qty</th>
                        <th className="px-2 py-1">Unit</th>
                        <th className="px-2 py-1">Total</th>
                        <th className="px-2 py-1 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingLines.map((l) => (
                        <tr key={l.key} className="border-t">
                          <td className="px-2 py-1">{l.description}</td>
                          <td className="px-2 py-1">{l.quantity}</td>
                          <td className="px-2 py-1">${l.unitPrice.toFixed(2)}</td>
                          <td className="px-2 py-1 font-medium">${l.total.toFixed(2)}</td>
                          <td className="px-2 py-1 text-right">
                            <Button size="sm" variant="outline" onClick={() => setViewBookingId(l.key)}>View booking</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Additional Charges</div>
                {customLines.length === 0 ? (
                  <div className="text-muted-foreground mb-2">No additional charges.</div>
                ) : (
                  <table className="w-full text-sm mb-3">
                    <thead>
                      <tr className="text-left">
                        <th className="px-2 py-1">Description</th>
                        <th className="px-2 py-1">Qty</th>
                        <th className="px-2 py-1">Unit</th>
                        <th className="px-2 py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customLines.map((l) => (
                        <tr key={l.id} className="border-t">
                          <td className="px-2 py-1">{l.description}</td>
                          <td className="px-2 py-1">{l.quantity}</td>
                          <td className="px-2 py-1">${l.unitPrice.toFixed(2)}</td>
                          <td className="px-2 py-1 font-medium">${l.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} disabled={inv.status !== "Draft"} />
                  <Input type="number" placeholder="Qty" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} disabled={inv.status !== "Draft"} />
                  <Input type="number" placeholder="Unit Price" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} disabled={inv.status !== "Draft"} />
                  <div className="text-sm text-muted-foreground">= {formatCurrency(Math.max(0, Number(newQty)) * Math.max(0, Number(newPrice)))}</div>
                  <Button disabled={inv.status !== "Draft"} onClick={() => {
                    if (!view) return;
                    if (!newDesc || newQty <= 0) return;
                    addLine(view, { description: newDesc, quantity: newQty, unitPrice: newPrice });
                    setNewDesc("");
                    setNewQty(1);
                    setNewPrice(0);
                    toast({ title: "Line added" });
                  }}>Add line</Button>
                </div>
              </div>

              <div className="flex items-start justify-between text-sm">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Tax mode</div>
                  <Select value={(inv.taxInclusive ? "incl" : "excl")} onValueChange={(v) => updateInvoice(inv.id, { taxInclusive: v === "incl" })}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tax Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excl">GST Exclusive</SelectItem>
                      <SelectItem value="incl">GST Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-muted-foreground">Subtotal</div>
                  <div>{formatCurrency(inv.subtotal)}</div>
                  <div className="text-muted-foreground">GST (10%) {inv.taxInclusive ? "incl." : ""}</div>
                  <div>{formatCurrency(inv.tax)}</div>
                  <div className="text-muted-foreground">Total</div>
                  <div className="text-xl font-semibold">{formatCurrency(inv.total)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {inv.status === "Draft" ? (
                  <Button variant="destructive" onClick={() => { if (view) { if (!confirm("Delete draft invoice? This will revert linked bookings.")) return; const invRef = invoices.find((x) => x.id === view); if (invRef?.source) { invRef.source.forEach((s) => { if (s.type === "booking" && s.id) { updateBooking(s.id, { status: "Confirmed", invoiceTotal: undefined }); } }); } removeInvoice(view); toast({ title: "Invoice deleted" }); setView(null); } }}>Delete</Button>
                ) : (
                  <Button variant="outline" onClick={() => { if (!view) return; if (!confirm("Archive this invoice?")) return; updateInvoice(view, { archivedAt: new Date().toISOString() }); toast({ title: "Invoice archived" }); setView(null); }}>Archive</Button>
                )}
                <Button disabled={!isXeroConnected() || (inv.lines.length === 0 && bookingLines.length === 0)} onClick={async () => {
                  try {
                    if (!view) return;
                    const thisInv = invoices.find((x) => x.id === view);
                    if (!thisInv) return;
                    const payload = mapToXeroPayload({ invoiceNo: thisInv.invoiceNo, customer: thisInv.customer, date: thisInv.date, amount: `$${thisInv.total.toFixed(2)}` });
                    await sendInvoiceToXero(payload);
                    markStatus(view, "Confirmed");
                    toast({ title: "Invoice finalized & sent" });
                  } catch (e: any) {
                    toast({ title: "Failed to send", description: e?.message ?? String(e) });
                  }
                }}>Finalize & Send</Button>
              </div>
            </div>
          );
        })()}
        <BookingViewDialog
          open={!!viewBookingId}
          onOpenChange={(o) => !o && setViewBookingId(null)}
          booking={viewBookingId ? (bookings.find((b) => b.id === viewBookingId) as any) ?? null : null}
          onSave={() => setViewBookingId(null)}
          onInvoice={() => setViewBookingId(null)}
          onUploadPod={(id, file) => {
            // noop in invoice modal; we won't upload here. This keeps viewer working.
          }}
        />
      </EntityModal>
    </div>
  );
}



import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusChip } from "@/components/shared/StatusChip";
import { EntityModal } from "@/components/shared/EntityModal";
import { isXeroConnected, connectXero, disconnectXero, sendBatchToXero, mapToXeroPayload } from "@/lib/xeroDemo";
import { toast } from "@/components/ui/use-toast";

type Invoice = {
  id: string;
  invoiceNo: string;
  customer: string;
  date: string;
  amount: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
};

const MOCK: Invoice[] = [
  { id: "1", invoiceNo: "INV-2025-0012", customer: "ABC Logistics", date: "2025-09-28", amount: "$1,240.00", status: "Paid" },
  { id: "2", invoiceNo: "INV-2025-0011", customer: "XYZ Freight", date: "2025-09-25", amount: "$2,060.00", status: "Sent" },
  { id: "3", invoiceNo: "INV-2025-0010", customer: "Global Shipping Co", date: "2025-09-20", amount: "$980.00", status: "Overdue" },
];

export default function Invoices() {
  const [rows, setRows] = useState<Invoice[]>(MOCK);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [view, setView] = useState<Invoice | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const filtered = rows.filter((r) => {
    const matchesStatus = status === "all" || r.status === status;
    const matchesSearch = r.invoiceNo.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase());
    const matchesFrom = !fromDate || r.date >= fromDate;
    const matchesTo = !toDate || r.date <= toDate;
    return matchesStatus && matchesSearch && matchesFrom && matchesTo;
  });

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
          <Button onClick={() => setRows((prev) => [{ id: String(Date.now()), invoiceNo: `INV-2025-${String(prev.length + 13).padStart(4, '0')}`, customer: "New Customer", date: new Date().toISOString().slice(0,10), amount: "$0.00", status: "Draft" }, ...prev])}>New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input placeholder="Search by number or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.amount}</td>
                <td className="px-4 py-2"><StatusChip status={r.status === 'Sent' ? 'Confirmed' : r.status === 'Paid' ? 'Delivered' : r.status === 'Overdue' ? 'Needs Review' : 'Draft'} /></td>
                <td className="px-4 py-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => setView(r)}>View</Button>
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
              });
              toast({ title: `Xero: ${res.sent} sent, ${res.failed} failed` });
              // On success, mark "Sent" for demo
              setRows((prev) => prev.map((r) => selected[r.id] ? { ...r, status: res.failed ? r.status : "Sent" } : r));
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
        title={view ? view.invoiceNo : "Invoice"}
        primaryAction={{ label: "Close", onClick: () => setView(null) }}
      >
        {view && (
          <div className="space-y-2 text-sm">
            <div>Customer: {view.customer}</div>
            <div>Date: {view.date}</div>
            <div>Amount: {view.amount}</div>
            <div>Status: {view.status}</div>
            <div className="rounded-md border p-3 mt-3">
              <div className="font-medium mb-1">Line Items</div>
              <ul className="list-disc pl-5">
                <li>Linehaul • $700.00</li>
                <li>Fuel Surcharge • $100.00</li>
                <li>Other Charges • $440.00</li>
              </ul>
            </div>
          </div>
        )}
      </EntityModal>
    </div>
  );
}



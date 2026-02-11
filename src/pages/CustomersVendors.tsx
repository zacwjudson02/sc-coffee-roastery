import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityModal } from "@/components/shared/EntityModal";
import { useAppData } from "@/hooks/use-appdata";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency, formatDateAU, cn } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DollarSign, TrendingUp, CalendarDays, BarChart2, Receipt, Wallet, Search, XCircle, Filter } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CustomersVendors() {
  const { customers, vendors, bookings, setBookings, addVendor, addCustomer, updateCustomer, removeCustomer, updateVendor, removeVendor } = useAppData();
  const { invoices, setInvoices } = useInvoices() as any; // expose setter for reassignment in demo
  const [profileId, setProfileId] = useState<string | null>(null);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [custOpen, setCustOpen] = useState<null | { mode: "new" } | { mode: "edit"; id: string }>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorType, setVendorType] = useState<string>("all");
  const [customerEmails, setCustomerEmails] = useState<string[]>([]);
  const [vendorEmails, setVendorEmails] = useState<string[]>([]);
  const [vendorEditId, setVendorEditId] = useState<string | null>(null);
  const [reassignForId, setReassignForId] = useState<string | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [newForm, setNewForm] = useState<{ company: string; contact: string; email?: string; phone?: string; extras: Record<string, string>; addresses?: { id: string; label?: string; street?: string; suburb?: string; city?: string; postcode?: string }[] }>(() => ({ company: "", contact: "", email: "", phone: "", extras: {}, addresses: [] }));
  // Smart filters & chips
  const [showArchived, setShowArchived] = useState(false);
  const [chipRecentActivity, setChipRecentActivity] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "recent">("name");
  const [vendorChipRecentPayment, setVendorChipRecentPayment] = useState(false);
  const [vendorChipHasEmail, setVendorChipHasEmail] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const location = useLocation();
  const navigate = useNavigate();

  // Deep-link handling: open customer profile by hash (id or company name)
  useEffect(() => {
    if (!location.hash) return;
    const key = decodeURIComponent(location.hash.slice(1));
    if (!key) return;
    let match = customers.find((c) => c.id === key);
    if (!match) match = customers.find((c) => c.company.trim().toLowerCase() === key.trim().toLowerCase());
    if (match) {
      setProfileId(match.id);
      const el = cardRefs.current[match.id];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        try { el.classList.add("ring-2", "ring-primary"); setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 1200); } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, customers.length]);

  const customerMetrics = useMemo(() => {
    const last30 = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const byId = new Map<string, { bookingCount: number; invoiceCount: number; lifetimeRevenue: number; lastActivity?: number }>();
    customers.forEach((c) => byId.set(c.id, { bookingCount: 0, invoiceCount: 0, lifetimeRevenue: 0 }));
    bookings.forEach((b) => {
      const m = byId.get(b.customerId);
      if (!m) return;
      m.bookingCount += 1;
      const t = new Date(b.date).getTime();
      m.lastActivity = Math.max(m.lastActivity || 0, isNaN(t) ? 0 : t);
    });
    invoices.forEach((inv) => {
      let cid = inv.customerId;
      if (!cid) {
        const match = customers.find((c) => c.company.trim().toLowerCase() === inv.customer.trim().toLowerCase());
        cid = match?.id;
      }
      if (!cid) return;
      const m = byId.get(cid);
      if (!m) return;
      m.invoiceCount += 1;
      m.lifetimeRevenue += (inv.total || 0);
      const t = new Date(inv.date).getTime();
      m.lastActivity = Math.max(m.lastActivity || 0, isNaN(t) ? 0 : t);
    });
    return { byId, last30 };
  }, [customers, bookings, invoices]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const results = customers.filter((c) => {
      if (!showArchived && c.archivedAt) return false;
      const searchHit = !q || [c.company, c.contact, c.email, ...(c.emails || [])].some((v) => v?.toLowerCase().includes(q));
      if (!searchHit) return false;
      const m = customerMetrics.byId.get(c.id);
      if (chipRecentActivity && !(m && (m.lastActivity || 0) >= customerMetrics.last30)) return false;
      return true;
    });
    if (sortBy === "name") return results.sort((a, b) => a.company.localeCompare(b.company));
    if (sortBy === "revenue") return results.sort((a, b) => (customerMetrics.byId.get(b.id)?.lifetimeRevenue || 0) - (customerMetrics.byId.get(a.id)?.lifetimeRevenue || 0));
    // recent
    return results.sort((a, b) => (customerMetrics.byId.get(b.id)?.lastActivity || 0) - (customerMetrics.byId.get(a.id)?.lastActivity || 0));
  }, [customers, customerSearch, showArchived, chipRecentActivity, sortBy, customerMetrics]);

  const vendorTypes = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => { if (v.type) set.add(v.type); });
    return Array.from(set);
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.trim().toLowerCase();
    const last30 = Date.now() - 1000 * 60 * 60 * 24 * 30;
    return vendors.filter((v) => {
      const matchesType = vendorType === "all" || (v.type ?? "").toLowerCase() === vendorType.toLowerCase();
      const matchesSearch = !q || [v.name, v.type, v.contact, v.email, ...(v.emails || [])].some((x) => x?.toLowerCase().includes(q));
      if (!matchesType || !matchesSearch) return false;
      if (vendorChipHasEmail && !(v.email || (v.emails && v.emails.length > 0))) return false;
      if (vendorChipRecentPayment) {
        if (!v.lastPayment) return false;
        const t = new Date(v.lastPayment).getTime();
        if (isNaN(t) || t < last30) return false;
      }
      return true;
    });
  }, [vendors, vendorSearch, vendorType, vendorChipHasEmail, vendorChipRecentPayment]);

  function startEditCustomer(id: string) { 
    setCustOpen({ mode: "edit", id }); 
    const c = customers.find((x) => x.id === id);
    const base = (c?.emails && c.emails.length > 0) ? c.emails : (c?.email ? [c.email] : []);
    setCustomerEmails(base);
  }
  function startNewCustomer() { setCustOpen({ mode: "new" }); setCustomerEmails([]); }
  function saveNewCustomer() {
    const company = (newForm.company || "").trim();
    if (!company) return;
    const id = addCustomer({ company, contact: newForm.contact || "", email: (newForm.email || undefined), phone: (newForm.phone || undefined), addresses: (Array.isArray(newForm.addresses) && newForm.addresses.length ? newForm.addresses : undefined), extras: (Object.keys(newForm.extras || {}).length ? newForm.extras : undefined) });
    setCustOpen(null);
    setProfileId(id);
    setNewForm({ company: "", contact: "", email: "", phone: "", extras: {}, addresses: [] });
  }
  function saveCustomer() {
    const nameEl = document.getElementById("cust.company") as HTMLInputElement | null;
    const contactEl = document.getElementById("cust.contact") as HTMLInputElement | null;
    const emailEl = document.getElementById("cust.email") as HTMLInputElement | null;
    const phoneEl = document.getElementById("cust.phone") as HTMLInputElement | null;
    const addressEl = document.getElementById("cust.address") as HTMLInputElement | null;
    const company = nameEl?.value?.trim();
    const contact = contactEl?.value?.trim() || "";
    const email = emailEl?.value?.trim() || undefined;
    const phone = phoneEl?.value?.trim() || undefined;
    const address = addressEl?.value?.trim() || undefined;
    const emails = (customerEmails.length > 0 ? customerEmails : (email ? [email] : [])).map((e) => e.trim()).filter(Boolean);
    const primaryEmail = emails[0] || email || undefined;
    if (!company) return setCustOpen(null);
    if (custOpen?.mode === "new") {
      const id = addCustomer({ company, contact, email: primaryEmail, emails, phone, address });
      setCustOpen(null);
      setProfileId(id);
    } else if (custOpen?.mode === "edit") {
      updateCustomer(custOpen.id, { company, contact, email: primaryEmail, emails, phone, address });
      setCustOpen(null);
    }
  }

  function deleteCustomer(id: string) {
    if (!confirm("Delete this customer? Linked orders will be orphaned.")) return;
    removeCustomer(id);
    if (profileId === id) setProfileId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers & Vendors</h1>
        <p className="text-muted-foreground">Manage CRM records and supply partners</p>
      </div>
      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <div className="flex flex-col gap-3 mb-2">
            {/* Toolbar aligned to PODs/Bookings */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search company, contact or email" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className={cn("pl-9", (customerSearch.trim().length > 0) && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive")} />
                </div>
                {(customerSearch.trim().length > 0) && (
                  <Button variant="ghost" size="sm" onClick={() => setCustomerSearch("")}> <XCircle className="h-4 w-4 mr-1" /> Clear</Button>
                )}
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="recent">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setShowArchived((s) => !s)}>{showArchived ? "Hide Archived" : "Show Archived"}</Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Button variant={chipRecentActivity ? "secondary" : "outline"} size="sm" onClick={() => setChipRecentActivity((v) => !v)}>Active Last 30d</Button>
                </div>
                <Button onClick={() => { setNewForm({ company: "", contact: "", email: "", phone: "", extras: {}, addresses: [] }); setCustOpen({ mode: "new" }); }}>New Customer</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                ref={(el) => { cardRefs.current[c.id] = el; }}
                className="border rounded-lg bg-card p-4 space-y-2 hover:shadow-sm transition-shadow"
              >
                <div className="font-semibold">{c.company}</div>
                <div className="text-sm text-muted-foreground">{c.contact} • {c.email ?? "-"}</div>
                <div className="text-xs text-muted-foreground">ID: {c.id.slice(0,8)}…</div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" onClick={() => setProfileId(c.id)}>View</Button>
                  {c.archivedAt ? (
                    <Button size="sm" variant="outline" onClick={() => updateCustomer(c.id, { archivedAt: undefined })}>Unarchive</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => {
                      const ok = confirm("Archive this customer? They will be hidden from selection but not deleted.");
                      if (!ok) return;
                      updateCustomer(c.id, { archivedAt: new Date().toISOString() });
                      const next = confirm("Archived. Would you like to reassign their orders and invoices now?");
                      if (next) setReassignForId(c.id);
                    }}>Archive</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="vendors">
          <div className="flex flex-col gap-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <Input placeholder="Search vendor or contact" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
              <Select value={vendorType} onValueChange={setVendorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {vendorTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="md:justify-self-end"><Button onClick={() => { setVendorEmails([]); setVendorOpen(true); }}>Add Vendor</Button></div>
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-left">
                  <TableHead className="px-4 py-2">Vendor</TableHead>
                  <TableHead className="px-4 py-2">Type</TableHead>
                  <TableHead className="px-4 py-2">Contact</TableHead>
                  <TableHead className="px-4 py-2">Last Payment</TableHead>
                  <TableHead className="px-4 py-2">ID</TableHead>
                  <TableHead className="px-4 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((v) => (
                  <TableRow key={v.id} className="border-t">
                    <TableCell className="px-4 py-2">{v.name}</TableCell>
                    <TableCell className="px-4 py-2">{v.type ?? "-"}</TableCell>
                    <TableCell className="px-4 py-2">{v.contact ?? "-"}</TableCell>
                    <TableCell className="px-4 py-2">{v.lastPayment ?? "-"}</TableCell>
                    <TableCell className="px-4 py-2">{v.id.slice(0,8)}…</TableCell>
                    <TableCell className="px-4 py-2 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setVendorEditId(v.id);
                        const base = (v.emails && v.emails.length > 0) ? v.emails : (v.email ? [v.email] : []);
                        setVendorEmails(base);
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete vendor?")) removeVendor(v.id); }}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <EntityModal
        open={!!profileId}
        onOpenChange={(o) => !o && setProfileId(null)}
        title={(() => { const c = customers.find((x) => x.id === profileId); return c ? c.company : "Profile"; })()}
        primaryAction={{ label: "Close", onClick: () => setProfileId(null) }}
      >
        {(() => {
          const c = customers.find((x) => x.id === profileId);
          if (!c) return null;
          return (
            <div className="space-y-3">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  {(() => {
                    // KPI calculations (reused)
                    const today = new Date();
                    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const invs = invoices.filter((inv) => (inv.customerId ? inv.customerId === c.id : inv.customer.trim().toLowerCase() === c.company.trim().toLowerCase()));
                    const lifetimeRevenue = invs.reduce((s, inv) => s + (inv.total || 0), 0);
                    const avgInvoice = invs.length > 0 ? (lifetimeRevenue / invs.length) : 0;
                    const outstandingBalance = invs.filter((inv) => inv.status !== "Paid" && !inv.archivedAt).reduce((s, inv) => s + (inv.total || 0), 0);
                    const lastMonthRevenue = invs.filter((inv) => { const d = new Date(inv.date); return d >= startOfLastMonth && d < startOfThisMonth; }).reduce((s, inv) => s + (inv.total || 0), 0);
                    const custBookings = bookings.filter((b) => b.customerId === c.id);
                    let avgPerWeek = 0;
                    if (custBookings.length > 0) {
                      const firstDateStr = custBookings.map((b) => b.date).sort()[0];
                      const first = new Date(firstDateStr);
                      const weeks = Math.max(1, Math.round((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 7)));
                      avgPerWeek = custBookings.length / weeks;
                    }
                    const lastMonthBookings = custBookings.filter((b) => { const d = new Date(b.date); return d >= startOfLastMonth && d < startOfThisMonth; }).length;
                    return (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="font-medium">Overview</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <KpiCard title="Last Month Revenue" value={formatCurrency(lastMonthRevenue)} icon={CalendarDays} variant="success" />
                            <KpiCard title="Lifetime Revenue" value={formatCurrency(lifetimeRevenue)} icon={TrendingUp} />
                            <KpiCard title="Orders Last Month" value={lastMonthBookings} icon={CalendarDays} />
                            <KpiCard title="Avg Orders / Week" value={avgPerWeek.toFixed(2)} icon={BarChart2} />
                            <KpiCard title="Average Invoice" value={formatCurrency(avgInvoice)} icon={Receipt} />
                            <KpiCard title="Outstanding Balance" value={formatCurrency(outstandingBalance)} icon={Wallet} variant="warning" />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
                <TabsContent value="history">
              <div className="text-sm text-muted-foreground">ID: {c.id}</div>
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Recent Orders</div>
                      <div className="space-x-2">
                        <Button size="sm" onClick={() => navigate(`/demo/bookings?customer=${encodeURIComponent(c.company)}`)}>Open in Orders</Button>
                        {c.archivedAt && (
                          <Button size="sm" variant="outline" onClick={() => setReassignForId(c.id)}>Reassign Records</Button>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const rows = bookings
                        .filter((b) => b.customerId === c.id)
                        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                        .slice(0, 10);
                      if (rows.length === 0) return <div className="text-sm text-muted-foreground">No orders linked yet.</div>;
                      return (
                        <div className="rounded border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-2 py-1">Order</TableHead>
                                <TableHead className="px-2 py-1">Date</TableHead>
                                <TableHead className="px-2 py-1">Pickup</TableHead>
                                <TableHead className="px-2 py-1">Dropoff</TableHead>
                                <TableHead className="px-2 py-1">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rows.map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell className="px-2 py-1 font-medium">{r.bookingId}</TableCell>
                                  <TableCell className="px-2 py-1">{r.date}</TableCell>
                                  <TableCell className="px-2 py-1">{r.pickup}</TableCell>
                                  <TableCell className="px-2 py-1">{r.dropoff}</TableCell>
                                  <TableCell className="px-2 py-1">{r.status}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Recent Invoices</div>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/demo/invoicing?customer=${encodeURIComponent(c.company)}`)}>Open in Invoices</Button>
                      </div>
                    </div>
                    {(() => {
                      const rows = invoices
                        .filter((inv) => (inv.customerId ? inv.customerId === c.id : inv.customer.trim().toLowerCase() === c.company.trim().toLowerCase()))
                        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                        .slice(0, 3);
                      if (rows.length === 0) return <div className="text-sm text-muted-foreground">No invoices for this customer yet.</div>;
                      return (
                        <div className="rounded border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-2 py-1">Invoice #</TableHead>
                                <TableHead className="px-2 py-1">Date</TableHead>
                                <TableHead className="px-2 py-1">Amount</TableHead>
                                <TableHead className="px-2 py-1">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rows.map((inv) => (
                                <TableRow key={inv.id}>
                                  <TableCell className="px-2 py-1 font-medium">{inv.invoiceNo}</TableCell>
                                  <TableCell className="px-2 py-1">{formatDateAU(inv.date)}</TableCell>
                                  <TableCell className="px-2 py-1">{formatCurrency(inv.total)}</TableCell>
                                  <TableCell className="px-2 py-1">{inv.status}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })()}
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  {(() => {
                    // KPI calculations
                    const today = new Date();
                    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

                    const invs = invoices.filter((inv) => (inv.customerId ? inv.customerId === c.id : inv.customer.trim().toLowerCase() === c.company.trim().toLowerCase()));
                    const lifetimeRevenue = invs.reduce((s, inv) => s + (inv.total || 0), 0);
                    const avgInvoice = invs.length > 0 ? (lifetimeRevenue / invs.length) : 0;
                    const outstandingBalance = invs
                      .filter((inv) => inv.status !== "Paid" && !inv.archivedAt)
                      .reduce((s, inv) => s + (inv.total || 0), 0);
                    const lastMonthRevenue = invs.filter((inv) => {
                      const d = new Date(inv.date);
                      return d >= startOfLastMonth && d < startOfThisMonth;
                    }).reduce((s, inv) => s + (inv.total || 0), 0);

                    const custBookings = bookings.filter((b) => b.customerId === c.id);
                    const lastMonthBookings = custBookings.filter((b) => {
                      const d = new Date(b.date);
                      return d >= startOfLastMonth && d < startOfThisMonth;
                    }).length;

                    let avgPerWeek = 0;
                    if (custBookings.length > 0) {
                      const firstDateStr = custBookings.map((b) => b.date).sort()[0];
                      const first = new Date(firstDateStr);
                      const weeks = Math.max(1, Math.round((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 7)));
                      avgPerWeek = custBookings.length / weeks;
                    }

                    // Inline editable details + relationship stats
                    const firstBookingDate = (() => {
                      const related = bookings.filter((b) => b.customerId === c.id);
                      const first = related.map((b) => b.date).sort()[0];
                      return first ? new Date(first) : null;
                    })();
                    const membershipDays = firstBookingDate ? Math.max(1, Math.round((today.getTime() - firstBookingDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                    const membership = firstBookingDate ? `${membershipDays} day(s)` : "-";
                    const lifetimeBookings = bookings.filter((b) => b.customerId === c.id).length;

                    return (
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-card">
                          <div className="px-4 py-3 border-b text-sm flex items-center justify-between">
                            <div className="font-medium">Customer Details</div>
                            <div className="text-xs text-muted-foreground">ID: {c.id.slice(0,8)}… {c.archivedAt && (<span className="ml-2 rounded px-2 py-0.5 border">Archived</span>)}</div>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Company</div>
                              <Input defaultValue={c.company} onBlur={(e) => updateCustomer(c.id, { company: e.target.value || c.company })} />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Contact</div>
                              <Input defaultValue={c.contact} onBlur={(e) => updateCustomer(c.id, { contact: e.target.value || c.contact })} />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Primary Email</div>
                              <Input defaultValue={c.email || ""} onBlur={(e) => updateCustomer(c.id, { email: e.target.value || undefined })} />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Phone</div>
                              <Input defaultValue={c.phone || ""} onBlur={(e) => updateCustomer(c.id, { phone: e.target.value || undefined })} />
                            </div>
                            <div className="md:col-span-2">
                              <div className="text-xs text-muted-foreground mb-1">Addresses</div>
                              <div className="rounded-md border bg-background">
                                <Accordion type="single" collapsible>
                                  {(() => {
                                    const list = c.addresses && c.addresses.length ? c.addresses : [];
                                    return (
                                      <>
                                        {list.map((addr, idx) => (
                                          <AccordionItem key={addr.id || String(idx)} value={`addr-${idx}`}>
                                            <AccordionTrigger>
                                              <div className="text-left">
                                                <div className="text-sm font-medium">{addr.label || `Address ${idx + 1}`}</div>
                                                <div className="text-xs text-muted-foreground">{[addr.street, addr.suburb, addr.city, addr.postcode].filter(Boolean).join(", ") || "(empty)"}</div>
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-1">
                                                <div>
                                                  <div className="text-[11px] text-muted-foreground mb-1">Label</div>
                                                  <Input defaultValue={addr.label || ""} onBlur={(e) => {
                                                    const next = [...list]; next[idx] = { ...addr, label: e.target.value || undefined };
                                                    updateCustomer(c.id, { addresses: next });
                                                  }} />
                                                </div>
                                                <div>
                                                  <div className="text-[11px] text-muted-foreground mb-1">Street</div>
                                                  <Input defaultValue={addr.street || ""} onBlur={(e) => { const next = [...list]; next[idx] = { ...addr, street: e.target.value || undefined }; updateCustomer(c.id, { addresses: next }); }} />
                                                </div>
                                                <div>
                                                  <div className="text-[11px] text-muted-foreground mb-1">Suburb</div>
                                                  <Input defaultValue={addr.suburb || ""} onBlur={(e) => { const next = [...list]; next[idx] = { ...addr, suburb: e.target.value || undefined }; updateCustomer(c.id, { addresses: next }); }} />
                                                </div>
                                                <div>
                                                  <div className="text-[11px] text-muted-foreground mb-1">City</div>
                                                  <Input defaultValue={addr.city || ""} onBlur={(e) => { const next = [...list]; next[idx] = { ...addr, city: e.target.value || undefined }; updateCustomer(c.id, { addresses: next }); }} />
                                                </div>
                                                <div>
                                                  <div className="text-[11px] text-muted-foreground mb-1">Postcode</div>
                                                  <Input defaultValue={addr.postcode || ""} onBlur={(e) => { const next = [...list]; next[idx] = { ...addr, postcode: e.target.value || undefined }; updateCustomer(c.id, { addresses: next }); }} />
                                                </div>
                                                <div className="flex items-end">
                                                  <Button size="sm" variant="destructive" onClick={() => {
                                                    const next = list.filter((_, i) => i !== idx);
                                                    updateCustomer(c.id, { addresses: next });
                                                  }}>Remove</Button>
                                                </div>
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        ))}
                                        <div className="p-2">
                                          <Button size="sm" variant="outline" onClick={() => {
                                            const list = c.addresses && c.addresses.length ? c.addresses : [];
                                            const created = { id: String(Date.now()), label: `Address ${list.length + 1}`, street: "", suburb: "", city: "", postcode: "" };
                                            updateCustomer(c.id, { addresses: [ ...list, created ] });
                                          }}>Add address</Button>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </Accordion>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground mb-1">Additional Fields</div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => { setNewFieldLabel(""); setNewFieldValue(""); setAddFieldOpen(true); }}>Add custom field</Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {Object.entries(c.extras || {}).map(([k, v]) => (
                                  <div key={k} className="rounded border p-2">
                                    <div className="text-[11px] text-muted-foreground mb-1">{k}</div>
                                    <Input defaultValue={v} onBlur={(e) => updateCustomer(c.id, { extras: { ...(c.extras || {}), [k]: e.target.value } })} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
              <div className="rounded-md border p-3">
                          <div className="font-medium mb-2">Relationship</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Customer Since</div><div className="text-lg font-semibold">{firstBookingDate ? formatDateAU(firstBookingDate) : "-"} ({membership})</div></div>
                            <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Lifetime Orders</div><div className="text-lg font-semibold">{lifetimeBookings}</div></div>
                            <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Lifetime Revenue</div><div className="text-lg font-semibold">{formatCurrency(invs.reduce((s, inv) => s + (inv.total || 0), 0))}</div></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </div>
          );
        })()}
      </EntityModal>

      {/* Reassign Records */}
      <EntityModal
        open={!!reassignForId}
        onOpenChange={(o) => !o && setReassignForId(null)}
        title={reassignForId ? `Reassign Records from ${(() => customers.find((x) => x.id === reassignForId)?.company || "Customer")()}` : "Reassign Records"}
        primaryAction={{ label: "Reassign", onClick: () => {
          const sourceId = reassignForId;
          if (!sourceId || !reassignTargetId) return;
          const target = customers.find((x) => x.id === reassignTargetId);
          if (!target) return;
          // Bookings: move by customerId
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = setBookings((prev) => prev.map((b) => (b.customerId === sourceId ? { ...b, customerId: target.id, customerName: target.company } : b)));
          // Invoices: move by customerId or name match
          setInvoices((prev) => prev.map((inv) => {
            if (inv.customerId === sourceId) return { ...inv, customerId: target.id, customer: target.company };
            if (!inv.customerId) {
              const srcName = customers.find((c) => c.id === sourceId)?.company.trim().toLowerCase();
              if (srcName && inv.customer.trim().toLowerCase() === srcName) return { ...inv, customerId: target.id, customer: target.company };
            }
            return inv;
          }));
          setReassignForId(null);
          setReassignTargetId("");
          alert("Records reassigned.");
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setReassignForId(null), variant: "outline" }}
      >
        {(() => {
          const sourceId = reassignForId;
          const src = customers.find((x) => x.id === sourceId);
          const bCount = bookings.filter((b) => b.customerId === sourceId).length;
          const invCount = invoices.filter((inv) => (inv.customerId ? inv.customerId === sourceId : (src ? inv.customer.trim().toLowerCase() === src.company.trim().toLowerCase() : false))).length;
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">From</div>
                  <Input value={src?.company ?? ""} disabled />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">To Customer</div>
                  <Select value={reassignTargetId} onValueChange={setReassignTargetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.filter((c) => c.id !== sourceId).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium mb-1">Summary</div>
                <div className="text-muted-foreground">Orders: {bCount} • Invoices: {invCount}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Invoices matched by customer ID or exact name will be reassigned.</div>
              </div>
            </div>
          );
        })()}
      </EntityModal>

      {/* Add Custom Field (used by Details and New) */}
      <EntityModal
        open={addFieldOpen}
        onOpenChange={setAddFieldOpen}
        title="Add Custom Field"
        primaryAction={{ label: "Add", onClick: () => {
          // Add to either the open customer (Details) or the new customer form
          const label = newFieldLabel.trim();
          const value = newFieldValue.trim();
          if (!label) { setAddFieldOpen(false); return; }
          if (custOpen && custOpen.mode === "new") {
            setNewForm((f) => ({ ...f, extras: { ...(f.extras || {}), [label]: value } }));
          } else if (profileId) {
            const c = customers.find((x) => x.id === profileId);
            if (c) {
              const base = c.extras || {};
              updateCustomer(c.id, { extras: { ...base, [label]: value } });
            }
          }
          setAddFieldOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setAddFieldOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Field Label</div>
            <Input placeholder="e.g., Billing Contact" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Value (optional)</div>
            <Input placeholder="Value" value={newFieldValue} onChange={(e) => setNewFieldValue(e.target.value)} />
          </div>
        </div>
      </EntityModal>

      {/* New Customer Dialog */}
      <EntityModal
        open={!!custOpen && custOpen.mode === "new"}
        onOpenChange={(o) => !o && setCustOpen(null)}
        title="Create Customer"
        primaryAction={{ label: "Create", onClick: saveNewCustomer }}
        secondaryAction={{ label: "Cancel", onClick: () => setCustOpen(null), variant: "outline" }}
      >
        <div className="rounded-lg border bg-card">
          <div className="px-4 py-3 border-b text-sm text-muted-foreground">Basic Info</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Company</div>
              <Input placeholder="Company" value={newForm.company} onChange={(e) => setNewForm((f) => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Contact</div>
              <Input placeholder="Contact" value={newForm.contact} onChange={(e) => setNewForm((f) => ({ ...f, contact: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Primary Email</div>
              <Input placeholder="email@company.com" value={newForm.email || ""} onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Phone</div>
              <Input placeholder="0400 000 000" value={newForm.phone || ""} onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card mt-3">
          <div className="px-4 py-3 border-b text-sm text-muted-foreground flex items-center justify-between">
            <div>Additional Fields</div>
            <Button size="sm" variant="outline" onClick={() => { setNewFieldLabel(""); setNewFieldValue(""); setAddFieldOpen(true); }}>Add custom field</Button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(newForm.extras || {}).map(([k, v]) => (
              <div key={k} className="rounded border p-2">
                <div className="text-[11px] text-muted-foreground mb-1">{k}</div>
                <Input value={v} onChange={(e) => setNewForm((f) => ({ ...f, extras: { ...(f.extras || {}), [k]: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card mt-3">
          <div className="px-4 py-3 border-b text-sm text-muted-foreground">Addresses</div>
          <div className="p-4">
            <Accordion type="single" collapsible>
              {(() => {
                const arr = Array.isArray(newForm.addresses) ? (newForm.addresses as any[]) : [];
                return (
                  <>
                    {arr.map((addr, idx) => (
                      <AccordionItem key={addr.id || String(idx)} value={`new-addr-${idx}`}>
                        <AccordionTrigger>
                          <div className="text-left">
                            <div className="text-sm font-medium">{addr.label || `Address ${idx + 1}`}</div>
                            <div className="text-xs text-muted-foreground">{[addr.street, addr.suburb, addr.city, addr.postcode].filter(Boolean).join(", ") || "(empty)"}</div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-1">
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-1">Label</div>
                              <Input value={addr.label || ""} onChange={(e) => {
                                const next = [...arr]; next[idx] = { ...addr, label: e.target.value || undefined };
                                setNewForm((f) => ({ ...f, addresses: next }));
                              }} />
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-1">Street</div>
                              <Input value={addr.street || ""} onChange={(e) => { const next = [...arr]; next[idx] = { ...addr, street: e.target.value || undefined }; setNewForm((f) => ({ ...f, addresses: next })); }} />
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-1">Suburb</div>
                              <Input value={addr.suburb || ""} onChange={(e) => { const next = [...arr]; next[idx] = { ...addr, suburb: e.target.value || undefined }; setNewForm((f) => ({ ...f, addresses: next })); }} />
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-1">City</div>
                              <Input value={addr.city || ""} onChange={(e) => { const next = [...arr]; next[idx] = { ...addr, city: e.target.value || undefined }; setNewForm((f) => ({ ...f, addresses: next })); }} />
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-1">Postcode</div>
                              <Input value={addr.postcode || ""} onChange={(e) => { const next = [...arr]; next[idx] = { ...addr, postcode: e.target.value || undefined }; setNewForm((f) => ({ ...f, addresses: next })); }} />
                            </div>
                            <div className="flex items-end">
                              <Button size="sm" variant="destructive" onClick={() => { const next = arr.filter((_, i) => i !== idx); setNewForm((f) => ({ ...f, addresses: next })); }}>Remove</Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    <div className="p-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const arr = Array.isArray(newForm.addresses) ? newForm.addresses : [];
                        const created = { id: String(Date.now()), label: `Address ${arr.length + 1}`, street: "", suburb: "", city: "", postcode: "" } as any;
                        setNewForm((f) => ({ ...f, addresses: [...arr, created] }));
                      }}>Add address</Button>
                    </div>
                  </>
                );
              })()}
            </Accordion>
          </div>
        </div>
      </EntityModal>

      <EntityModal
        open={vendorOpen}
        onOpenChange={setVendorOpen}
        title="Add Vendor"
        primaryAction={{ label: "Save", onClick: () => {
          const name = (document.getElementById("vendor-name") as HTMLInputElement)?.value || "New Vendor";
          const type = (document.getElementById("vendor-type") as HTMLInputElement)?.value || undefined;
          const contact = (document.getElementById("vendor-contact") as HTMLInputElement)?.value || undefined;
          const emails = (vendorEmails || []).map((e) => e.trim()).filter(Boolean);
          const email = emails[0];
          addVendor({ name, type, contact, email, emails, lastPayment: new Date().toISOString().slice(0,10) });
          setVendorOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setVendorOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="vendor-name" placeholder="Vendor name" />
          <Input id="vendor-type" placeholder="Type" />
          <Input id="vendor-contact" placeholder="Contact" />
          <div className="col-span-2 space-y-2">
            <div className="text-xs text-muted-foreground">Emails</div>
            {vendorEmails.length === 0 ? (
              <Button size="sm" variant="outline" onClick={() => setVendorEmails([""]) }>Add</Button>
            ) : (
              <div className="space-y-2">
                {vendorEmails.map((val, idx) => (
                  <Input key={idx} placeholder={`Email ${idx + 1}`} value={val} onChange={(e) => setVendorEmails((prev) => prev.map((v, i) => i === idx ? e.target.value : v))} />
                ))}
                <Button size="sm" variant="outline" onClick={() => setVendorEmails((prev) => [...prev, ""]) }>Add</Button>
              </div>
            )}
          </div>
        </div>
      </EntityModal>

      {/* Edit Vendor */}
      <EntityModal
        open={!!vendorEditId}
        onOpenChange={(o) => !o && setVendorEditId(null)}
        title={vendorEditId ? `Edit ${vendors.find((x) => x.id === vendorEditId)?.name ?? "Vendor"}` : "Edit Vendor"}
        primaryAction={{ label: "Save", onClick: () => {
          const id = vendorEditId;
          if (!id) return setVendorEditId(null);
          const nameEl = document.getElementById("edit.vendor-name") as HTMLInputElement | null;
          const typeEl = document.getElementById("edit.vendor-type") as HTMLInputElement | null;
          const contactEl = document.getElementById("edit.vendor-contact") as HTMLInputElement | null;
          const emails = (vendorEmails || []).map((e) => e.trim()).filter(Boolean);
          const email = emails[0];
          updateVendor(id, { name: nameEl?.value || undefined, type: typeEl?.value || undefined, contact: contactEl?.value || undefined, email, emails });
          setVendorEditId(null);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setVendorEditId(null), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="edit.vendor-name" placeholder="Vendor name" defaultValue={(() => vendors.find((x) => x.id === vendorEditId)?.name || "")()} />
          <Input id="edit.vendor-type" placeholder="Type" defaultValue={(() => vendors.find((x) => x.id === vendorEditId)?.type || "")()} />
          <Input id="edit.vendor-contact" placeholder="Contact" defaultValue={(() => vendors.find((x) => x.id === vendorEditId)?.contact || "")()} />
          <div className="col-span-2 space-y-2">
            <div className="text-xs text-muted-foreground">Emails</div>
            {vendorEmails.length === 0 ? (
              <Button size="sm" variant="outline" onClick={() => setVendorEmails([""]) }>Add</Button>
            ) : (
              <div className="space-y-2">
                {vendorEmails.map((val, idx) => (
                  <Input key={idx} placeholder={`Email ${idx + 1}`} value={val} onChange={(e) => setVendorEmails((prev) => prev.map((v, i) => i === idx ? e.target.value : v))} />
                ))}
                <Button size="sm" variant="outline" onClick={() => setVendorEmails((prev) => [...prev, ""]) }>Add</Button>
              </div>
            )}
          </div>
        </div>
      </EntityModal>
    </div>
  );
}





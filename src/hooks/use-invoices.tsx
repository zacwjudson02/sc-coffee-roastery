import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { uuid } from "@/lib/utils";

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
};

export type InvoiceStatus = "Draft" | "Confirmed" | "Delivered" | "Paid" | "Overdue";

export type Invoice = {
  id: string; // internal id
  invoiceNo: string; // human readable number like INV-2025-0012
  customerId?: string;
  customer: string;
  date: string; // YYYY-MM-DD
  lines: InvoiceLine[];
  subtotal: number;
  tax?: number; // GST amount
  total: number; // subtotal + tax (if exclusive)
  taxInclusive?: boolean; // true = line unit prices include GST
  status: InvoiceStatus;
  archivedAt?: string;
  deliveredAt?: string;
  // Optional linkage back to bookings
  source?: { type: "booking"; id: string; bookingId?: string }[];
};

type InvoicesState = {
  invoices: Invoice[];
  setInvoices: (updater: (prev: Invoice[]) => Invoice[]) => void;
  createInvoice: (payload: Omit<Invoice, "id" | "invoiceNo" | "subtotal" | "total"> & { invoiceNo?: string }) => string;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  addLine: (invoiceId: string, line: Omit<InvoiceLine, "id" | "total"> & { id?: string }) => void;
  updateLine: (invoiceId: string, lineId: string, patch: Partial<Omit<InvoiceLine, "id">>) => void;
  removeLine: (invoiceId: string, lineId: string) => void;
  markStatus: (invoiceId: string, status: InvoiceStatus) => void;
  generateNextInvoiceNo: () => string;
  findOrCreateDraftByCustomer: (customerId: string | undefined, customerName: string, date: string) => { id: string; created: boolean };
};

const LS_KEY = "smh.invoices";

function seedInvoices(): Invoice[] {
  const id = (prefix = "inv") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const today = new Date().toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  return [
    {
      id: id(), invoiceNo: "INV-2026-0001", customer: "Noosa Heads Cafe", date: twoWeeksAgo,
      lines: [
        { id: id("ln"), description: "Delivery SC Roastery HQ → Noosa Cafe Strip (5 pallets)", quantity: 5, unitPrice: 55, total: 275 },
      ],
      subtotal: 275, tax: 27.50, total: 302.50, taxInclusive: false, status: "Paid" as InvoiceStatus, archivedAt: lastWeek,
    },
    {
      id: id(), invoiceNo: "INV-2026-0002", customer: "Mooloolaba Espresso Bar", date: lastWeek,
      lines: [
        { id: id("ln"), description: "Delivery SC Roastery HQ → Mooloolaba Esplanade (8 pallets)", quantity: 8, unitPrice: 45, total: 360 },
      ],
      subtotal: 360, tax: 36.00, total: 396.00, taxInclusive: false, status: "Delivered" as InvoiceStatus, deliveredAt: lastWeek,
    },
    {
      id: id(), invoiceNo: "INV-2026-0003", customer: "Coolum Beach Cafe", date: lastWeek,
      lines: [
        { id: id("ln"), description: "Delivery SC Roastery HQ → Coolum Beach (3 pallets)", quantity: 3, unitPrice: 50, total: 150 },
      ],
      subtotal: 150, tax: 15.00, total: 165.00, taxInclusive: false, status: "Confirmed" as InvoiceStatus,
    },
    {
      id: id(), invoiceNo: "INV-2026-0004", customer: "Caloundra Bakehouse", date: today,
      lines: [
        { id: id("ln"), description: "Delivery SC Roastery HQ → Caloundra Main St (4 pallets)", quantity: 4, unitPrice: 40, total: 160 },
        { id: id("ln"), description: "Extra handling - fragile single origin beans", quantity: 1, unitPrice: 25, total: 25 },
      ],
      subtotal: 185, tax: 18.50, total: 203.50, taxInclusive: false, status: "Draft" as InvoiceStatus,
    },
    {
      id: id(), invoiceNo: "INV-2026-0005", customer: "Peregian Beach Kiosk", date: today,
      lines: [
        { id: id("ln"), description: "Delivery SC Roastery HQ → Peregian Beach Kiosk (2 pallets)", quantity: 2, unitPrice: 50, total: 100 },
      ],
      subtotal: 100, tax: 10.00, total: 110.00, taxInclusive: false, status: "Draft" as InvoiceStatus,
    },
  ];
}

function loadFromStorage(): Invoice[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedInvoices();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return seedInvoices();
    if (arr.length === 0) return seedInvoices();
    return arr;
  } catch {
    return seedInvoices();
  }
}

function computeTotals(lines: InvoiceLine[], taxInclusive?: boolean): { subtotal: number; tax: number; total: number } {
  const raw = lines.reduce((sum, l) => sum + l.total, 0);
  const GST_RATE = 0.1;
  if (taxInclusive) {
    const tax = Number((raw - raw / (1 + GST_RATE)).toFixed(2));
    const subtotal = Number((raw - tax).toFixed(2));
    const total = Number(raw.toFixed(2));
    return { subtotal, tax, total };
  }
  const tax = Number((raw * GST_RATE).toFixed(2));
  const subtotal = Number(raw.toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { subtotal, tax, total };
}

function pad(n: number, width = 4) {
  const s = String(n);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

const InvoicesContext = createContext<InvoicesState | null>(null);

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(loadFromStorage());
  const [invoices, setInvoices] = useState<Invoice[]>(initial.current);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  const generateNextInvoiceNo = useCallback(() => {
    // Find max numeric suffix for current year
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    let max = 0;
    invoices.forEach((inv) => {
      if (inv.invoiceNo.startsWith(prefix)) {
        const tail = inv.invoiceNo.slice(prefix.length);
        const num = parseInt(tail, 10);
        if (!isNaN(num)) max = Math.max(max, num);
      }
    });
    return `${prefix}${pad(max + 1)}`;
  }, [invoices]);

  const recalc = useCallback((inv: Invoice): Invoice => {
    const { subtotal, tax, total } = computeTotals(inv.lines, inv.taxInclusive);
    return { ...inv, subtotal, tax, total };
  }, []);

  const createInvoice = useCallback<InvoicesState["createInvoice"]>((payload) => {
    const id = uuid();
    const invoiceNo = payload.invoiceNo ?? generateNextInvoiceNo();
    const lines = payload.lines ?? [];
    const base: Invoice = recalc({
      id,
      invoiceNo,
      customerId: payload.customerId,
      customer: payload.customer,
      date: payload.date,
      lines,
      subtotal: 0,
      tax: 0,
      total: 0,
      taxInclusive: payload.taxInclusive ?? false,
      status: payload.status ?? "Draft",
      source: payload.source,
    });
    setInvoices((prev) => [base, ...prev]);
    return id;
  }, [generateNextInvoiceNo, recalc]);

  const updateInvoice = useCallback<InvoicesState["updateInvoice"]>((id, patch) => {
    setInvoices((prev) => prev.map((x) => (x.id === id ? recalc({ ...x, ...patch }) : x)));
  }, [recalc]);

  const removeInvoice = useCallback<InvoicesState["removeInvoice"]>((id) => {
    setInvoices((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addLine = useCallback<InvoicesState["addLine"]>((invoiceId, line) => {
    const id = line.id ?? uuid();
    const total = (line.quantity ?? 0) * (line.unitPrice ?? 0);
    setInvoices((prev) => prev.map((x) => (x.id === invoiceId ? recalc({ ...x, lines: [...x.lines, { ...line, id, total }] }) : x)));
  }, [recalc]);

  const updateLine = useCallback<InvoicesState["updateLine"]>((invoiceId, lineId, patch) => {
    setInvoices((prev) => prev.map((x) => {
      if (x.id !== invoiceId) return x;
      const nextLines = x.lines.map((l) => {
        if (l.id !== lineId) return l;
        const quantity = patch.quantity ?? l.quantity;
        const unitPrice = patch.unitPrice ?? l.unitPrice;
        const total = quantity * unitPrice;
        return { ...l, ...patch, total };
      });
      return recalc({ ...x, lines: nextLines });
    }));
  }, [recalc]);

  const removeLine = useCallback<InvoicesState["removeLine"]>((invoiceId, lineId) => {
    setInvoices((prev) => prev.map((x) => (x.id === invoiceId ? recalc({ ...x, lines: x.lines.filter((l) => l.id !== lineId) }) : x)));
  }, [recalc]);

  const markStatus = useCallback<InvoicesState["markStatus"]>((invoiceId, status) => {
    setInvoices((prev) => prev.map((x) => (x.id === invoiceId ? { ...x, status } : x)));
  }, []);

  const findOrCreateDraftByCustomer = useCallback<InvoicesState["findOrCreateDraftByCustomer"]>((customerId, customerName, date) => {
    const nameKey = customerName.trim().toLowerCase();
    const found = invoices.find((inv) => inv.status === "Draft" && (
      (customerId && inv.customerId === customerId) || (!customerId && !inv.customerId && inv.customer.trim().toLowerCase() === nameKey)
    ));
    if (found) {
      // If matched by name and we now have a UUID, backfill it for future strict matches
      if (customerId && !found.customerId) {
        setInvoices((prev) => prev.map((x) => (x.id === found.id ? { ...x, customerId } : x)));
      }
      return { id: found.id, created: false };
    }
    const id = createInvoice({ customerId, customer: customerName, date, lines: [], status: "Draft" });
    return { id, created: true };
  }, [invoices, createInvoice]);

  const value: InvoicesState = useMemo(() => ({
    invoices,
    setInvoices: (u) => setInvoices((prev) => u(prev)),
    createInvoice,
    updateInvoice,
    removeInvoice,
    addLine,
    updateLine,
    removeLine,
    markStatus,
    generateNextInvoiceNo,
    findOrCreateDraftByCustomer,
  }), [invoices, createInvoice, updateInvoice, removeInvoice, addLine, updateLine, removeLine, markStatus, generateNextInvoiceNo, findOrCreateDraftByCustomer]);

  return (
    <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoicesContext);
  if (!ctx) throw new Error("useInvoices must be used within InvoicesProvider");
  return ctx;
}



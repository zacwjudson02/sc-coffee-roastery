import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { uuid } from "@/lib/utils";

export type UUID = string; // supabase-style UUIDs

export type Customer = {
  id: UUID;
  company: string;
  contact: string;
  email?: string;
  emails?: string[];
  phone?: string;
  address?: string; // legacy single-line address
  addresses?: { id: string; label?: string; street?: string; suburb?: string; city?: string; postcode?: string }[];
  archivedAt?: string;
  extras?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type Vendor = {
  id: UUID;
  name: string;
  type?: string;
  contact?: string;
  email?: string;
  emails?: string[];
  lastPayment?: string;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: UUID;
  bookingId: string;
  customerId: UUID;
  customerName: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: "Draft" | "Confirmed" | "Allocated" | "Invoiced" | "Completed";
  driver?: string;
  pickupSuburb?: string;
  dropoffSuburb?: string;
  pallets?: number;
  spaces?: number;
  chargeTo?: "Sender" | "Receiver" | "Third Party";
  palletType?: string;
  transferType?: string;
  podMethod?: string;
  podReceived?: boolean;
  customerRef?: string;
  secondRef?: string;
  unitPrice?: number;
  rateBasis?: "per_pallet" | "per_space";
  invoiceTotal?: number;
  createdAt: string;
  updatedAt: string;
};

type AppData = {
  customers: Customer[];
  vendors: Vendor[];
  bookings: Booking[];
};

type AppDataState = AppData & {
  setCustomers: (u: (prev: Customer[]) => Customer[]) => void;
  setVendors: (u: (prev: Vendor[]) => Vendor[]) => void;
  setBookings: (u: (prev: Booking[]) => Booking[]) => void;
  addCustomer: (input: Omit<Customer, "id" | "createdAt" | "updatedAt">) => UUID;
  updateCustomer: (id: UUID, patch: Partial<Customer>) => void;
  removeCustomer: (id: UUID) => void;
  addVendor: (input: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => UUID;
  updateVendor: (id: UUID, patch: Partial<Vendor>) => void;
  removeVendor: (id: UUID) => void;
  addBooking: (input: Omit<Booking, "id" | "createdAt" | "updatedAt">) => UUID;
  updateBooking: (id: UUID, patch: Partial<Booking>) => void;
};

const LS_KEY = "smh.appdata";

function seed(): AppData {
  const now = new Date().toISOString();
  const c1: Customer = { id: uuid(), company: "ABC Logistics", contact: "Emma Lee", email: "emma@abc.com", createdAt: now, updatedAt: now };
  const c2: Customer = { id: uuid(), company: "XYZ Freight", contact: "Tom Nguyen", email: "tom@xyz.com", createdAt: now, updatedAt: now };
  const c3: Customer = { id: uuid(), company: "Global Shipping Co", contact: "Mia Chen", email: "mia@global.com", createdAt: now, updatedAt: now };
  const customers = [c1, c2, c3];

  const vendors: Vendor[] = [
    { id: uuid(), name: "TyreWorks", type: "Tyres", contact: "0412 000 111", lastPayment: "2025-09-20", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Rapid Repairs", type: "Repairs", contact: "0413 222 333", lastPayment: "2025-09-15", createdAt: now, updatedAt: now },
    { id: uuid(), name: "FuelMax", type: "Fuel", contact: "0414 444 555", lastPayment: "2025-09-28", createdAt: now, updatedAt: now },
  ];

  const bookings: Booking[] = [
    { id: uuid(), bookingId: "BK-2024-0150", customerId: c1.id, customerName: c1.company, pickup: "Melbourne Warehouse", dropoff: "Sydney CBD", date: "2024-10-02", status: "Confirmed", driver: "John Smith", pickupSuburb: "Melbourne", dropoffSuburb: "Sydney", pallets: 6, spaces: 6, chargeTo: "Sender", palletType: "Chep", transferType: "Metro", podMethod: "Paper", podReceived: false, customerRef: "PO-1001", secondRef: "REF-A1", unitPrice: 50, rateBasis: "per_pallet", invoiceTotal: 300, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "BK-2024-0149", customerId: c2.id, customerName: c2.company, pickup: "Brisbane Port", dropoff: "Gold Coast", date: "2024-10-02", status: "Invoiced", driver: "Sarah Jones", pickupSuburb: "Brisbane", dropoffSuburb: "Gold Coast", pallets: 10, spaces: 10, chargeTo: "Receiver", palletType: "Standard", transferType: "Regional", podMethod: "Digital", podReceived: true, customerRef: "PO-2002", secondRef: "REF-B2", unitPrice: 45, rateBasis: "per_pallet", invoiceTotal: 450, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "BK-2024-0148", customerId: c3.id, customerName: c3.company, pickup: "Adelaide Depot", dropoff: "Melbourne", date: "2024-10-02", status: "Allocated", driver: "Mike Brown", pickupSuburb: "Adelaide", dropoffSuburb: "Melbourne", pallets: 4, spaces: 4, chargeTo: "Third Party", palletType: "Loscam", transferType: "Linehaul", podMethod: "Photo", podReceived: false, customerRef: "PO-3003", secondRef: "REF-C3", unitPrice: 40, rateBasis: "per_pallet", invoiceTotal: 160, createdAt: now, updatedAt: now },
  ];

  return { customers, vendors, bookings };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return seed();
    return { customers: parsed.customers ?? [], vendors: parsed.vendors ?? [], bookings: parsed.bookings ?? [] } as AppData;
  } catch {
    return seed();
  }
}

const AppDataContext = createContext<AppDataState | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(load());
  const [customers, setCustomers] = useState<Customer[]>(initial.current.customers);
  const [vendors, setVendors] = useState<Vendor[]>(initial.current.vendors);
  const [bookings, setBookings] = useState<Booking[]>(initial.current.bookings);

  // One-time dev helper: coerce all booking dates to 2025-10-11 for Runsheets testing
  useEffect(() => {
    const FLAG = "smh.dateCoerced.2025-10-11";
    try {
      if (localStorage.getItem(FLAG)) return;
      const target = "2025-10-11";
      setBookings((prev) => prev.map((b) => ({ ...b, date: target })));
      localStorage.setItem(FLAG, "1");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ customers, vendors, bookings }));
    } catch {}
  }, [customers, vendors, bookings]);

  const addCustomer: AppDataState["addCustomer"] = useCallback((input) => {
    const now = new Date().toISOString();
    const id = uuid();
    setCustomers((prev) => [{ id, ...input, createdAt: now, updatedAt: now }, ...prev]);
    return id;
  }, []);

  const updateCustomer: AppDataState["updateCustomer"] = useCallback((id, patch) => {
    const now = new Date().toISOString();
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now } : c)));
  }, []);

  const addVendor: AppDataState["addVendor"] = useCallback((input) => {
    const now = new Date().toISOString();
    const id = uuid();
    setVendors((prev) => [{ id, ...input, createdAt: now, updatedAt: now }, ...prev]);
    return id;
  }, []);

  const updateVendor: AppDataState["updateVendor"] = useCallback((id, patch) => {
    const now = new Date().toISOString();
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: now } : v)));
  }, []);

  const removeVendor: AppDataState["removeVendor"] = useCallback((id) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const addBooking: AppDataState["addBooking"] = useCallback((input) => {
    const now = new Date().toISOString();
    const id = uuid();
    setBookings((prev) => [{ id, ...input, createdAt: now, updatedAt: now }, ...prev]);
    return id;
  }, []);

  const updateBooking: AppDataState["updateBooking"] = useCallback((id, patch) => {
    const now = new Date().toISOString();
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now } : b)));
  }, []);

  const removeCustomer: AppDataState["removeCustomer"] = useCallback((id) => {
    // Remove the customer, and orphan any linked bookings by clearing customerId while preserving customerName
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setBookings((prev) => prev.map((b) => (b.customerId === id ? { ...b, customerId: "" } : b)));
  }, []);

  const value: AppDataState = useMemo(() => ({
    customers,
    vendors,
    bookings,
    setCustomers: (u) => setCustomers((prev) => u(prev)),
    setVendors: (u) => setVendors((prev) => u(prev)),
    setBookings: (u) => setBookings((prev) => u(prev)),
    addCustomer,
    updateCustomer,
    removeCustomer,
    addVendor,
    updateVendor,
    removeVendor,
    addBooking,
    updateBooking,
  }), [customers, vendors, bookings, addCustomer, updateCustomer, removeCustomer, addVendor, updateVendor, removeVendor, addBooking, updateBooking]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}



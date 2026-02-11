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
  const today = new Date().toISOString().slice(0, 10);
  const c1: Customer = { id: uuid(), company: "Noosa Heads Cafe", contact: "Emma Lee", email: "emma@noosacafe.com.au", createdAt: now, updatedAt: now };
  const c2: Customer = { id: uuid(), company: "Mooloolaba Espresso Bar", contact: "Tom Nguyen", email: "tom@mooloolabaespresso.com.au", createdAt: now, updatedAt: now };
  const c3: Customer = { id: uuid(), company: "Caloundra Bakehouse", contact: "Mia Chen", email: "mia@caloundrabakehouse.com.au", createdAt: now, updatedAt: now };
  const c4: Customer = { id: uuid(), company: "Coolum Beach Cafe", contact: "Jade Harper", email: "jade@coolumcafe.com.au", createdAt: now, updatedAt: now };
  const c5: Customer = { id: uuid(), company: "Peregian Beach Kiosk", contact: "Luca Rossi", email: "luca@peregiankiosk.com.au", createdAt: now, updatedAt: now };
  const c6: Customer = { id: uuid(), company: "Alexandra Headland Brew", contact: "Sophie Ward", email: "sophie@alexbrew.com.au", createdAt: now, updatedAt: now };
  const c7: Customer = { id: uuid(), company: "Kawana Coffee Co", contact: "Ryan Blake", email: "ryan@kawanacoffee.com.au", createdAt: now, updatedAt: now };
  const c8: Customer = { id: uuid(), company: "Buderim Village Roast", contact: "Nina Okoro", email: "nina@buderimroast.com.au", createdAt: now, updatedAt: now };
  const customers = [c1, c2, c3, c4, c5, c6, c7, c8];

  const vendors: Vendor[] = [
    { id: uuid(), name: "Green Bean Imports", type: "Green Beans", contact: "0412 000 111", lastPayment: "2026-01-20", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Packaging Plus", type: "Packaging", contact: "0413 222 333", lastPayment: "2026-01-15", createdAt: now, updatedAt: now },
    { id: uuid(), name: "CoastFleet Couriers", type: "Courier", contact: "0414 444 555", lastPayment: "2026-01-28", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Sunshine Milk Supply", type: "Dairy", contact: "0415 666 777", lastPayment: "2026-02-05", createdAt: now, updatedAt: now },
  ];

  const bookings: Booking[] = [
    // Today's orders — these align with the pre-seeded runsheets in use-resources
    { id: uuid(), bookingId: "ORD-2026-0201", customerId: c1.id, customerName: c1.company, pickup: "SC Roastery HQ", dropoff: "Noosa Cafe Strip", date: today, status: "Allocated", driver: "Jake Brennan", pickupSuburb: "Warana", dropoffSuburb: "Noosa Heads", pallets: 6, spaces: 6, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: false, customerRef: "PO-1001", secondRef: "REF-A1", unitPrice: 55, rateBasis: "per_pallet", invoiceTotal: 330, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0202", customerId: c2.id, customerName: c2.company, pickup: "SC Roastery HQ", dropoff: "Mooloolaba Esplanade", date: today, status: "Allocated", driver: "Lily Tran", pickupSuburb: "Warana", dropoffSuburb: "Mooloolaba", pallets: 10, spaces: 10, chargeTo: "Receiver", palletType: "Standard", transferType: "Local", podMethod: "Digital", podReceived: false, customerRef: "PO-2002", secondRef: "REF-B2", unitPrice: 45, rateBasis: "per_pallet", invoiceTotal: 450, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0203", customerId: c3.id, customerName: c3.company, pickup: "SC Roastery HQ", dropoff: "Caloundra Main St", date: today, status: "Allocated", driver: "Sam Keogh", pickupSuburb: "Warana", dropoffSuburb: "Caloundra", pallets: 4, spaces: 4, chargeTo: "Third Party", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: false, customerRef: "PO-3003", secondRef: "REF-C3", unitPrice: 40, rateBasis: "per_pallet", invoiceTotal: 160, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0204", customerId: c4.id, customerName: c4.company, pickup: "SC Roastery HQ", dropoff: "Coolum Beach", date: today, status: "Confirmed", driver: "Reece Murray", pickupSuburb: "Warana", dropoffSuburb: "Coolum", pallets: 3, spaces: 3, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: false, customerRef: "PO-4004", secondRef: "REF-D4", unitPrice: 50, rateBasis: "per_pallet", invoiceTotal: 150, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0205", customerId: c5.id, customerName: c5.company, pickup: "SC Roastery HQ", dropoff: "Peregian Beach Kiosk", date: today, status: "Allocated", driver: "Jake Brennan", pickupSuburb: "Warana", dropoffSuburb: "Peregian Beach", pallets: 2, spaces: 2, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Digital", podReceived: false, customerRef: "PO-5005", secondRef: "REF-E5", unitPrice: 50, rateBasis: "per_pallet", invoiceTotal: 100, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0206", customerId: c6.id, customerName: c6.company, pickup: "SC Roastery HQ", dropoff: "Alexandra Headland", date: today, status: "Allocated", driver: "Lily Tran", pickupSuburb: "Warana", dropoffSuburb: "Alexandra Headland", pallets: 3, spaces: 3, chargeTo: "Receiver", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: false, customerRef: "PO-6006", secondRef: "REF-F6", unitPrice: 45, rateBasis: "per_pallet", invoiceTotal: 135, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0207", customerId: c7.id, customerName: c7.company, pickup: "SC Roastery HQ", dropoff: "Kawana Waters", date: today, status: "Allocated", driver: "Sam Keogh", pickupSuburb: "Warana", dropoffSuburb: "Kawana", pallets: 5, spaces: 5, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Digital", podReceived: false, customerRef: "PO-7007", secondRef: "REF-G7", unitPrice: 40, rateBasis: "per_pallet", invoiceTotal: 200, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0208", customerId: c8.id, customerName: c8.company, pickup: "SC Roastery HQ", dropoff: "Buderim Village", date: today, status: "Confirmed", pickupSuburb: "Warana", dropoffSuburb: "Buderim", pallets: 8, spaces: 8, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: false, customerRef: "PO-8008", secondRef: "REF-H8", unitPrice: 35, rateBasis: "per_pallet", invoiceTotal: 280, createdAt: now, updatedAt: now },
    // Historical completed orders
    { id: uuid(), bookingId: "ORD-2026-0195", customerId: c1.id, customerName: c1.company, pickup: "SC Roastery HQ", dropoff: "Noosa Cafe Strip", date: "2026-02-04", status: "Completed", driver: "Jake Brennan", pickupSuburb: "Warana", dropoffSuburb: "Noosa Heads", pallets: 5, spaces: 5, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: true, customerRef: "PO-0995", unitPrice: 55, rateBasis: "per_pallet", invoiceTotal: 275, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0196", customerId: c2.id, customerName: c2.company, pickup: "SC Roastery HQ", dropoff: "Mooloolaba Esplanade", date: "2026-02-04", status: "Invoiced", driver: "Lily Tran", pickupSuburb: "Warana", dropoffSuburb: "Mooloolaba", pallets: 8, spaces: 8, chargeTo: "Receiver", palletType: "Standard", transferType: "Local", podMethod: "Digital", podReceived: true, customerRef: "PO-0996", unitPrice: 45, rateBasis: "per_pallet", invoiceTotal: 360, createdAt: now, updatedAt: now },
    { id: uuid(), bookingId: "ORD-2026-0197", customerId: c4.id, customerName: c4.company, pickup: "SC Roastery HQ", dropoff: "Coolum Beach", date: "2026-02-06", status: "Completed", driver: "Reece Murray", pickupSuburb: "Warana", dropoffSuburb: "Coolum", pallets: 3, spaces: 3, chargeTo: "Sender", palletType: "Standard", transferType: "Local", podMethod: "Photo", podReceived: true, customerRef: "PO-0997", unitPrice: 50, rateBasis: "per_pallet", invoiceTotal: 150, createdAt: now, updatedAt: now },
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

  // One-time dev helper: coerce all booking dates to today for demo testing
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const FLAG = `smh.dateCoerced.${today}`;
    try {
      if (localStorage.getItem(FLAG)) return;
      setBookings((prev) => prev.map((b) => ({ ...b, date: today })));
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



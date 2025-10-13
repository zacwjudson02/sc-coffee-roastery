import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { uuid } from "@/lib/utils";

export type Driver = {
  id: string;
  name: string;
  phone?: string;
  status: "Active" | "Inactive" | "License Expired";
  licenseExpiry?: string;
  color?: string;
};

export type Vehicle = {
  id: string;
  rego: string;
  type: string;
  capacity?: string;
  status: "Available" | "In Service";
  nextService?: string;
};

export type Shift = {
  id: string;
  date: string; // YYYY-MM-DD
  driverId: string;
  vehicleId?: string;
  start?: string; // HH:mm
  end?: string;   // HH:mm
  status?: "planned" | "in_progress" | "completed" | "cancelled";
  notes?: string;
};

export type RunJob = {
  id: string;
  bookingId: string;
  pickup: string;
  dropoff: string;
  pickupSuburb?: string;
  dropoffSuburb?: string;
  pallets?: number;
  spaces?: number;
  palletType?: string;
  transferMethod?: string;
  suburb?: string;
};

export type RunSheet = {
  id: string;
  shiftId: string; // 1:1 with shift
  date: string;
  driverId: string;
  jobs: RunJob[];
};

type ResourceState = {
  drivers: Driver[];
  vehicles: Vehicle[];
  shifts: Shift[];
  runsheets: RunSheet[];
  setDrivers: (updater: (prev: Driver[]) => Driver[]) => void;
  setVehicles: (updater: (prev: Vehicle[]) => Vehicle[]) => void;
  setShifts: (updater: (prev: Shift[]) => Shift[]) => void;
  setRunsheets: (updater: (prev: RunSheet[]) => RunSheet[]) => void;
  addDriver: (d: Omit<Driver, "id"> & { id?: string }) => string;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  removeDriver: (id: string) => void;
  addVehicle: (v: Omit<Vehicle, "id"> & { id?: string }) => string;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  addShift: (s: Omit<Shift, "id"> & { id?: string }) => string;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  // Runsheet helpers
  ensureShift: (date: string, driverId: string) => string;
  ensureRunsheet: (shiftId: string) => string;
  addJobsToRunsheet: (shiftId: string, jobs: RunJob[]) => void;
  moveJobBetweenRunsheets: (fromShiftId: string, toShiftId: string, jobId: string, toIndex: number) => void;
  getRunsheetBy: (date: string, driverId: string) => RunSheet | null;
  deleteRunsheet: (shiftId: string) => void;
  driverColorMap: Record<string, string>;
};

const LS_KEY = "smh.resources";

function seedDefaults() {
  const drivers: Driver[] = [
    { id: uuid(), name: "John Smith", phone: "0400 111 222", status: "Active", licenseExpiry: "2025-12-01", color: "#FF6B6B" },
    { id: uuid(), name: "Sarah Jones", phone: "0400 333 444", status: "Active", licenseExpiry: "2026-03-15", color: "#7C3AED" },
    { id: uuid(), name: "Mike Brown", phone: "0400 555 666", status: "License Expired", licenseExpiry: "2024-07-01", color: "#4ECDC4" },
    { id: uuid(), name: "Priya Patel", phone: "0400 777 888", status: "Active", licenseExpiry: "2026-08-20", color: "#3B82F6" },
  ];
  const vehicles: Vehicle[] = [
    { id: uuid(), rego: "ABC-123", type: "Rigid", capacity: "6T", status: "Available", nextService: "2025-10-05" },
    { id: uuid(), rego: "XYZ-789", type: "Prime Mover", capacity: "24T", status: "In Service", nextService: "2025-10-10" },
  ];
  const shifts: Shift[] = [];
  const runsheets: RunSheet[] = [];
  return { drivers, vehicles, shifts, runsheets };
}

function loadFromStorage(): { drivers: Driver[]; vehicles: Vehicle[]; shifts: Shift[]; runsheets: RunSheet[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedDefaults();
    const parsed = JSON.parse(raw);
    return {
      drivers: Array.isArray(parsed?.drivers) ? parsed.drivers : seedDefaults().drivers,
      vehicles: Array.isArray(parsed?.vehicles) ? parsed.vehicles : seedDefaults().vehicles,
      shifts: Array.isArray(parsed?.shifts) ? parsed.shifts : [],
      runsheets: Array.isArray(parsed?.runsheets) ? parsed.runsheets : [],
    };
  } catch {
    return seedDefaults();
  }
}

const ResourceContext = createContext<ResourceState | null>(null);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(loadFromStorage());
  const [drivers, setDrivers] = useState<Driver[]>(initial.current.drivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initial.current.vehicles);
  const [shifts, setShifts] = useState<Shift[]>(initial.current.shifts);
  const [runsheets, setRunsheets] = useState<RunSheet[]>(initial.current.runsheets);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ drivers, vehicles, shifts, runsheets }));
    } catch {}
  }, [drivers, vehicles, shifts, runsheets]);

  // One-time dev helper: coerce all shift and runsheet dates to 2025-10-11 for Runsheets testing
  useEffect(() => {
    const FLAG = "smh.resources.dateCoerced.2025-10-11";
    try {
      if (localStorage.getItem(FLAG)) return;
      const target = "2025-10-11";
      setShifts((prev) => prev.map((s) => ({ ...s, date: target })));
      setRunsheets((prev) => prev.map((r) => ({ ...r, date: target })));
      localStorage.setItem(FLAG, "1");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maintain legacy driverColors map for other pages (e.g., Bookings allocation tint)
  useEffect(() => {
    const map: Record<string, string> = {};
    drivers.forEach((d) => { if (d.color) map[d.name] = d.color; });
    try { localStorage.setItem("driverColors", JSON.stringify(map)); } catch {}
  }, [drivers]);

  const addDriver = useCallback((d: Omit<Driver, "id"> & { id?: string }) => {
    const id = d.id ?? uuid();
    setDrivers((prev) => [{ id, ...d }, ...prev]);
    return id;
  }, []);

  const updateDriver = useCallback((id: string, patch: Partial<Driver>) => {
    setDrivers((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const removeDriver = useCallback((id: string) => {
    setDrivers((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addVehicle = useCallback((v: Omit<Vehicle, "id"> & { id?: string }) => {
    const id = v.id ?? uuid();
    setVehicles((prev) => [{ id, ...v }, ...prev]);
    return id;
  }, []);

  const updateVehicle = useCallback((id: string, patch: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addShift = useCallback((s: Omit<Shift, "id"> & { id?: string }) => {
    const id = s.id ?? uuid();
    setShifts((prev) => [{ id, ...s }, ...prev]);
    return id;
  }, []);

  const updateShift = useCallback((id: string, patch: Partial<Shift>) => {
    setShifts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const removeShift = useCallback((id: string) => {
    setShifts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Runsheet helpers
  const ensureShift = useCallback((date: string, driverId: string) => {
    let found = shifts.find((s) => s.date === date && s.driverId === driverId);
    if (found) return found.id;
    const id = uuid();
    const created: Shift = { id, date, driverId, status: "planned" };
    setShifts((prev) => [created, ...prev]);
    return id;
  }, [shifts]);

  const ensureRunsheet = useCallback((shiftId: string) => {
    const existing = runsheets.find((r) => r.shiftId === shiftId);
    if (existing) return existing.id;
    const shift = shifts.find((s) => s.id === shiftId);
    const id = uuid();
    const created: RunSheet = { id, shiftId, date: shift?.date || new Date().toISOString().slice(0,10), driverId: shift?.driverId || "", jobs: [] };
    setRunsheets((prev) => [created, ...prev]);
    return id;
  }, [runsheets, shifts]);

  const addJobsToRunsheet = useCallback((shiftId: string, jobs: RunJob[]) => {
    setRunsheets((prev) => prev.map((r) => r.shiftId === shiftId ? { ...r, jobs: [...r.jobs, ...jobs] } : r));
  }, []);

  const moveJobBetweenRunsheets = useCallback((fromShiftId: string, toShiftId: string, jobId: string, toIndex: number) => {
    setRunsheets((prev) => {
      const copy = prev.map((r) => ({ ...r, jobs: [...r.jobs] }));
      const from = copy.find((r) => r.shiftId === fromShiftId);
      const to = copy.find((r) => r.shiftId === toShiftId);
      if (!from || !to) return prev;
      const idx = from.jobs.findIndex((j) => j.id === jobId);
      if (idx === -1) return prev;
      const [job] = from.jobs.splice(idx, 1);
      to.jobs.splice(toIndex, 0, job);
      return copy;
    });
  }, []);

  const getRunsheetBy = useCallback((date: string, driverId: string) => {
    const shift = shifts.find((s) => s.date === date && s.driverId === driverId);
    if (!shift) return null;
    return runsheets.find((r) => r.shiftId === shift.id) ?? null;
  }, [runsheets, shifts]);

  const deleteRunsheet = useCallback((shiftId: string) => {
    setRunsheets((prev) => prev.filter((r) => r.shiftId !== shiftId));
  }, []);

  const driverColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    drivers.forEach((d) => { if (d.color) map[d.name] = d.color; });
    return map;
  }, [drivers]);

  const value: ResourceState = {
    drivers,
    vehicles,
    shifts,
    runsheets,
    setDrivers: (u) => setDrivers((prev) => u(prev)),
    setVehicles: (u) => setVehicles((prev) => u(prev)),
    setShifts: (u) => setShifts((prev) => u(prev)),
    setRunsheets: (u) => setRunsheets((prev) => u(prev)),
    addDriver,
    updateDriver,
    removeDriver,
    addVehicle,
    updateVehicle,
    removeVehicle,
    addShift,
    updateShift,
    removeShift,
    ensureShift,
    ensureRunsheet,
    addJobsToRunsheet,
    moveJobBetweenRunsheets,
    getRunsheetBy,
    deleteRunsheet,
    driverColorMap,
  };

  return (
    <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error("useResources must be used within ResourceProvider");
  return ctx;
}



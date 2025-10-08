import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityModal } from "@/components/shared/EntityModal";
import { StatusChip } from "@/components/shared/StatusChip";
import { Input } from "@/components/ui/input";
import { useResources } from "@/hooks/use-resources";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShiftViewDialog } from "@/components/shifts/ShiftViewDialog";

type Staff = { name: string; role: string; phone: string; status: "Active" | "Inactive" | "License Expired"; licenseExpiry: string; startDate?: string; color?: string };
type VehicleRow = { rego: string; type: string; capacity: string; status: "Available" | "In Service"; nextService: string };

export default function Resources() {
  const { drivers, vehicles, shifts, addDriver, updateDriver, addVehicle, updateVehicle, addShift } = useResources();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);
  const [staffOpen, setStaffOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [viewShift, setViewShift] = useState<{ date: string; driverId: string } | null>(null);
  const [editDriverName, setEditDriverName] = useState<string | null>(null);
  const [editVehicleRego, setEditVehicleRego] = useState<string | null>(null);

  // Filters
  const [staffSearch, setStaffSearch] = useState("");
  const [staffStatus, setStaffStatus] = useState<string>("all");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState<string>("all");
  const [shiftDate, setShiftDate] = useState<string>("");
  const [shiftDriver, setShiftDriver] = useState<string>("all");

  const dueSoon = useMemo(() => (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }, []);

  // Bridge store → local display models (preserving existing UI without full refactor yet)
  useEffect(() => {
    const s: Staff[] = drivers.map((d) => ({
      name: d.name,
      role: "Driver",
      phone: d.phone || "",
      status: d.status,
      licenseExpiry: d.licenseExpiry || "",
      color: d.color,
    }));
    setStaff(s);
  }, [drivers]);

  useEffect(() => {
    const rows: VehicleRow[] = vehicles.map((v) => ({
      rego: v.rego,
      type: v.type,
      capacity: v.capacity || "",
      status: v.status,
      nextService: v.nextService || "",
    }));
    setVehicleRows(rows);
  }, [vehicles]);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = !staffSearch || [s.name, s.role, s.phone].some((v) => v?.toLowerCase().includes(staffSearch.toLowerCase()));
    const matchesStatus = staffStatus === "all" || s.status === staffStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredVehicles = vehicleRows.filter((v) => {
    const matchesSearch = !vehicleSearch || [v.rego, v.type, v.capacity].some((x) => x?.toLowerCase().includes(vehicleSearch.toLowerCase()));
    const matchesStatus = vehicleStatus === "all" || v.status === vehicleStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredShifts = (shifts || []).filter((s) => {
    const matchesDate = !shiftDate || s.date === shiftDate;
    const dName = drivers.find((d) => d.id === s.driverId)?.name || "";
    const matchesDriver = shiftDriver === "all" || dName === shiftDriver;
    return matchesDate && matchesDriver;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff & Resources</h1>
        <p className="text-muted-foreground">Manage your drivers, vehicles, and shifts</p>
      </div>
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <div className="flex flex-col gap-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input placeholder="Search name, role or phone" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} />
              <Select value={staffStatus} onValueChange={setStaffStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="License Expired">License Expired</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={() => setStaffOpen(true)}>Add Driver</Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Colour</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">License Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>No staff match your filters.</td>
                  </tr>
                )}
                {filteredStaff.map((s) => (
                  <tr key={s.name} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setEditDriverName(s.name)}>
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2">{s.role}</td>
                    <td className="px-4 py-2">{s.phone}</td>
                    <td className="px-4 py-2">
                      {s.role.toLowerCase() === "driver" ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: s.color || "#e5e7eb" }} />
                          <input
                            type="color"
                            value={s.color || "#000000"}
                            onChange={(e) => {
                              setStaff((prev) => prev.map((p) => p.name === s.name ? { ...p, color: e.target.value } : p));
                              // propagate back to store
                              const match = drivers.find((d) => d.name === s.name);
                              if (match) updateDriver(match.id, { color: e.target.value });
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2"><StatusChip status={s.status} /></td>
                    <td className={`${dueSoon(s.licenseExpiry) ? 'text-red-600' : ''} px-4 py-2`}>{s.licenseExpiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="vehicles">
          <div className="flex flex-col gap-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input placeholder="Search rego, type or capacity" value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} />
              <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Service">In Service</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
            <Button onClick={() => setVehicleOpen(true)}>Add Vehicle</Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Rego</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Capacity</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Next Service</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-muted-foreground" colSpan={5}>No vehicles match your filters.</td>
                  </tr>
                )}
                {filteredVehicles.map((v) => (
                  <tr key={v.rego} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setEditVehicleRego(v.rego)}>
                    <td className="px-4 py-2">{v.rego}</td>
                    <td className="px-4 py-2">{v.type}</td>
                    <td className="px-4 py-2">{v.capacity}</td>
                  <td className="px-4 py-2"><StatusChip status={v.status} /></td>
                    <td className={`px-4 py-2 ${dueSoon(v.nextService) ? 'text-red-600' : ''}`}>{v.nextService}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="shifts">
          <div className="flex flex-col gap-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
              <Select value={shiftDriver} onValueChange={setShiftDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={() => setShiftOpen(true)}>Create Shift</Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Driver</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Start</th>
                  <th className="px-4 py-2">End</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredShifts.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-muted-foreground" colSpan={7}>No shifts to display.</td>
                  </tr>
                )}
                {filteredShifts.map((s) => {
                  const d = drivers.find((x) => x.id === s.driverId);
                  const v = vehicles.find((x) => x.id === s.vehicleId);
                  return (
                    <tr key={s.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setViewShift({ date: s.date, driverId: s.driverId })}>
                      <td className="px-4 py-2">{s.date}</td>
                      <td className="px-4 py-2">{d?.name ?? "-"}</td>
                      <td className="px-4 py-2">{v?.rego ?? "-"}</td>
                      <td className="px-4 py-2">{s.start ?? "-"}</td>
                      <td className="px-4 py-2">{s.end ?? "-"}</td>
                      <td className="px-4 py-2">
                        <StatusChip status={(s.status === 'in_progress' ? 'In Progress' : s.status === 'completed' ? 'Completed' : s.status === 'cancelled' ? 'Cancelled' : 'Planned')} />
                      </td>
                      <td className="px-4 py-2">{s.notes ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <EntityModal
        open={staffOpen}
        onOpenChange={setStaffOpen}
        title="Add Driver"
        primaryAction={{ label: "Save", onClick: () => {
          const nameEl = document.getElementById("driver.name") as HTMLInputElement | null;
          const phoneEl = document.getElementById("driver.phone") as HTMLInputElement | null;
          const expEl = document.getElementById("driver.license") as HTMLInputElement | null;
          const colorEl = document.getElementById("driver.color") as HTMLInputElement | null;
          const statusEl = document.getElementById("driver.status") as HTMLInputElement | null;
          const name = nameEl?.value?.trim();
          if (!name) return setStaffOpen(false);
          addDriver({ name, phone: phoneEl?.value || "", licenseExpiry: expEl?.value || undefined, color: colorEl?.value || undefined, status: (statusEl?.value as any) || "Active" });
          setStaffOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setStaffOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="driver.name" placeholder="Name" />
          <div className="grid grid-cols-2 gap-2">
            <Input id="driver.phone" placeholder="Phone" />
            <Input id="driver.license" type="date" placeholder="License Expiry" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select defaultValue="Active">
              <SelectTrigger id="driver.status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="License Expired">License Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input id="driver.color" type="color" />
          </div>
        </div>
      </EntityModal>

      <EntityModal
        open={vehicleOpen}
        onOpenChange={setVehicleOpen}
        title="Add Vehicle"
        primaryAction={{ label: "Save", onClick: () => {
          const regoEl = document.getElementById("veh.rego") as HTMLInputElement | null;
          const typeEl = document.getElementById("veh.type") as HTMLInputElement | null;
          const capEl = document.getElementById("veh.capacity") as HTMLInputElement | null;
          const nsEl = document.getElementById("veh.service") as HTMLInputElement | null;
          const statusEl = document.getElementById("veh.status") as HTMLInputElement | null;
          const rego = regoEl?.value?.trim();
          if (!rego) return setVehicleOpen(false);
          addVehicle({ rego, type: typeEl?.value || "", capacity: capEl?.value || "", nextService: nsEl?.value || undefined, status: ((statusEl?.value as any) || "Available") });
          setVehicleOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setVehicleOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="veh.rego" placeholder="Rego" />
          <Input id="veh.type" placeholder="Type" />
          <Input id="veh.capacity" placeholder="Capacity" />
          <Input id="veh.service" type="date" placeholder="Next Service" />
          <Select defaultValue="Available">
            <SelectTrigger id="veh.status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="In Service">In Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </EntityModal>

      {/* Edit Driver */}
      <EntityModal
        open={!!editDriverName}
        onOpenChange={(o) => !o && setEditDriverName(null)}
        title={editDriverName ? `Edit ${editDriverName}` : "Edit Driver"}
        primaryAction={{ label: "Save", onClick: () => {
          const name = editDriverName;
          if (!name) return setEditDriverName(null);
          const phoneEl = document.getElementById("edit.driver.phone") as HTMLInputElement | null;
          const expEl = document.getElementById("edit.driver.license") as HTMLInputElement | null;
          const statusEl = document.getElementById("edit.driver.status") as HTMLInputElement | null;
          const colorEl = document.getElementById("edit.driver.color") as HTMLInputElement | null;
          const match = drivers.find((d) => d.name === name);
          if (match) updateDriver(match.id, { phone: phoneEl?.value || undefined, licenseExpiry: expEl?.value || undefined, status: (statusEl?.value as any) || match.status, color: colorEl?.value || match.color });
          setEditDriverName(null);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setEditDriverName(null), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="edit.driver.phone" placeholder="Phone" defaultValue={(() => drivers.find((d) => d.name === editDriverName)?.phone || "")()} />
          <Input id="edit.driver.license" type="date" placeholder="License Expiry" defaultValue={(() => drivers.find((d) => d.name === editDriverName)?.licenseExpiry || "")()} />
          <Select defaultValue={(() => drivers.find((d) => d.name === editDriverName)?.status || "Active")()}>
            <SelectTrigger id="edit.driver.status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="License Expired">License Expired</SelectItem>
            </SelectContent>
          </Select>
          <Input id="edit.driver.color" type="color" defaultValue={(() => drivers.find((d) => d.name === editDriverName)?.color || "#000000")()} />
        </div>
      </EntityModal>

      {/* Edit Vehicle */}
      <EntityModal
        open={!!editVehicleRego}
        onOpenChange={(o) => !o && setEditVehicleRego(null)}
        title={editVehicleRego ? `Edit ${editVehicleRego}` : "Edit Vehicle"}
        primaryAction={{ label: "Save", onClick: () => {
          const rego = editVehicleRego;
          if (!rego) return setEditVehicleRego(null);
          const typeEl = document.getElementById("edit.veh.type") as HTMLInputElement | null;
          const capEl = document.getElementById("edit.veh.capacity") as HTMLInputElement | null;
          const nsEl = document.getElementById("edit.veh.service") as HTMLInputElement | null;
          const statusEl = document.getElementById("edit.veh.status") as HTMLInputElement | null;
          const match = vehicles.find((v) => v.rego === rego);
          if (match) updateVehicle(match.id, { type: typeEl?.value || match.type, capacity: capEl?.value || match.capacity, nextService: nsEl?.value || match.nextService, status: (statusEl?.value as any) || match.status });
          setEditVehicleRego(null);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setEditVehicleRego(null), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="edit.veh.type" placeholder="Type" defaultValue={(() => vehicles.find((v) => v.rego === editVehicleRego)?.type || "")()} />
          <Input id="edit.veh.capacity" placeholder="Capacity" defaultValue={(() => vehicles.find((v) => v.rego === editVehicleRego)?.capacity || "")()} />
          <Input id="edit.veh.service" type="date" placeholder="Next Service" defaultValue={(() => vehicles.find((v) => v.rego === editVehicleRego)?.nextService || "")()} />
          <Select defaultValue={(() => vehicles.find((v) => v.rego === editVehicleRego)?.status || "Available")()}>
            <SelectTrigger id="edit.veh.status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="In Service">In Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </EntityModal>

      {/* Create Shift */}
      <EntityModal
        open={shiftOpen}
        onOpenChange={setShiftOpen}
        title="Create Shift"
        primaryAction={{ label: "Save", onClick: () => {
          const dateEl = document.getElementById("shift.date") as HTMLInputElement | null;
          const startEl = document.getElementById("shift.start") as HTMLInputElement | null;
          const endEl = document.getElementById("shift.end") as HTMLInputElement | null;
          const notesEl = document.getElementById("shift.notes") as HTMLInputElement | null;
          const driverEl = document.getElementById("shift.driver") as HTMLInputElement | null;
          const vehicleEl = document.getElementById("shift.vehicle") as HTMLInputElement | null;
          const date = dateEl?.value || "";
          const driverName = driverEl?.value || "";
          const vehicleRego = vehicleEl?.value || "";
          const d = drivers.find((x) => x.name === driverName);
          const v = vehicles.find((x) => x.rego === vehicleRego);
          if (!date || !d) return setShiftOpen(false);
          addShift({ date, driverId: d.id, vehicleId: v?.id, start: startEl?.value || undefined, end: endEl?.value || undefined, status: "planned", notes: notesEl?.value || undefined });
          setShiftOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setShiftOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input id="shift.date" type="date" />
          <Select>
            <SelectTrigger id="shift.driver">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: d.color || "#e5e7eb" }} />
                    <span>{d.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger id="shift.vehicle">
              <SelectValue placeholder="Vehicle (optional)" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.rego}>{v.rego} • {v.type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input id="shift.start" placeholder="Start (e.g., 06:00)" />
          <Input id="shift.end" placeholder="End (e.g., 14:00)" />
          <Input id="shift.notes" placeholder="Notes" />
        </div>
      </EntityModal>

      {/* View Shift */}
      <ShiftViewDialog
        open={!!viewShift}
        onOpenChange={(o) => !o && setViewShift(null)}
        shift={(() => {
          if (!viewShift) return null;
          const match = shifts.find((x) => x.date === viewShift.date && x.driverId === viewShift.driverId);
          return match ?? null;
        })()}
      />
    </div>
  );
}



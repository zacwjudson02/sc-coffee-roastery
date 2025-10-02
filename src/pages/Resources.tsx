import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityModal } from "@/components/shared/EntityModal";
import { StatusChip } from "@/components/shared/StatusChip";
import { Input } from "@/components/ui/input";

type Staff = { name: string; role: string; phone: string; status: "Active" | "Inactive" | "License Expired"; licenseExpiry: string; startDate?: string };
type Vehicle = { rego: string; type: string; capacity: string; status: "Available" | "In Service"; nextService: string };

const STAFF: Staff[] = [
  { name: "John Smith", role: "Driver", phone: "0400 111 222", status: "Active", licenseExpiry: "2025-12-01" },
  { name: "Sarah Jones", role: "Dispatcher", phone: "0400 333 444", status: "Active", licenseExpiry: "2026-03-15" },
  { name: "Mike Brown", role: "Driver", phone: "0400 555 666", status: "License Expired", licenseExpiry: "2024-07-01" },
];

const VEHICLES: Vehicle[] = [
  { rego: "ABC-123", type: "Rigid", capacity: "6T", status: "Available", nextService: "2025-10-05" },
  { rego: "XYZ-789", type: "Prime Mover", capacity: "24T", status: "In Service", nextService: "2025-10-10" },
];

export default function Resources() {
  const [staff, setStaff] = useState<Staff[]>(STAFF);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [staffOpen, setStaffOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const dueSoon = useMemo(() => (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff & Resources</h1>
        <p className="text-muted-foreground">Manage your drivers and vehicles</p>
      </div>
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setStaffOpen(true)}>Add Staff</Button>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">License Expiry</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.name} className="border-t">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.role}</td>
                    <td className="px-4 py-2">{s.phone}</td>
                    <td className="px-4 py-2"><StatusChip status={s.status} /></td>
                    <td className={`${dueSoon(s.licenseExpiry) ? 'text-red-600' : ''} px-4 py-2`}>{s.licenseExpiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="vehicles">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setVehicleOpen(true)}>Add Vehicle</Button>
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
                {vehicles.map((v) => (
                  <tr key={v.rego} className="border-t">
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
      </Tabs>

      <EntityModal
        open={staffOpen}
        onOpenChange={setStaffOpen}
        title="Add Staff"
        primaryAction={{ label: "Save", onClick: () => setStaffOpen(false) }}
        secondaryAction={{ label: "Cancel", onClick: () => setStaffOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Name" />
          <Input placeholder="Role" />
          <Input placeholder="Phone" />
          <Input type="date" placeholder="Start Date" />
          <Input type="date" placeholder="License Expiry" />
        </div>
      </EntityModal>

      <EntityModal
        open={vehicleOpen}
        onOpenChange={setVehicleOpen}
        title="Add Vehicle"
        primaryAction={{ label: "Save", onClick: () => setVehicleOpen(false) }}
        secondaryAction={{ label: "Cancel", onClick: () => setVehicleOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Rego" />
          <Input placeholder="Type" />
          <Input placeholder="Capacity" />
          <Input type="date" placeholder="Next Service" />
        </div>
      </EntityModal>
    </div>
  );
}



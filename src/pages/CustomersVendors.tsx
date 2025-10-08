import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityModal } from "@/components/shared/EntityModal";

type Customer = { company: string; contact: string; email: string; totalBookings: number; totalInvoiced: string };
type Vendor = { name: string; type: string; contact: string; lastPayment: string; linkedInvoices: number };

const CUSTOMERS: Customer[] = [
  { company: "ABC Logistics", contact: "Emma Lee", email: "emma@abc.com", totalBookings: 142, totalInvoiced: "$320k" },
  { company: "XYZ Freight", contact: "Tom Nguyen", email: "tom@xyz.com", totalBookings: 88, totalInvoiced: "$190k" },
  { company: "Global Shipping Co", contact: "Mia Chen", email: "mia@global.com", totalBookings: 63, totalInvoiced: "$145k" },
];

const VENDORS: Vendor[] = [
  { name: "TyreWorks", type: "Tyres", contact: "0412 000 111", lastPayment: "2025-09-20", linkedInvoices: 12 },
  { name: "Rapid Repairs", type: "Repairs", contact: "0413 222 333", lastPayment: "2025-09-15", linkedInvoices: 7 },
  { name: "FuelMax", type: "Fuel", contact: "0414 444 555", lastPayment: "2025-09-28", linkedInvoices: 24 },
];

export default function CustomersVendors() {
  const [profile, setProfile] = useState<Customer | null>(null);
  const [vendorOpen, setVendorOpen] = useState(false);

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CUSTOMERS.map((c) => (
              <div key={c.company} className="border rounded-lg bg-card p-4 space-y-2">
                <div className="font-semibold">{c.company}</div>
                <div className="text-sm text-muted-foreground">{c.contact} • {c.email}</div>
                <div className="text-sm">Bookings: {c.totalBookings} • Invoiced: {c.totalInvoiced}</div>
                <div className="pt-2">
                  <Button size="sm" onClick={() => setProfile(c)}>View Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="vendors">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setVendorOpen(true)}>Add Vendor</Button>
          </div>
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Last Payment</th>
                  <th className="px-4 py-2">Linked Invoices</th>
                </tr>
              </thead>
              <tbody>
                {VENDORS.map((v) => (
                  <tr key={v.name} className="border-t">
                    <td className="px-4 py-2">{v.name}</td>
                    <td className="px-4 py-2">{v.type}</td>
                    <td className="px-4 py-2">{v.contact}</td>
                    <td className="px-4 py-2">{v.lastPayment}</td>
                    <td className="px-4 py-2">{v.linkedInvoices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <EntityModal
        open={!!profile}
        onOpenChange={(o) => !o && setProfile(null)}
        title={profile ? profile.company : "Profile"}
        primaryAction={{ label: "Close", onClick: () => setProfile(null) }}
      >
        {profile && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Contact: {profile.contact} • {profile.email}</div>
            <div className="rounded-md border p-3">
              <div className="font-medium mb-1">Linked Bookings</div>
              <ul className="list-disc pl-5 text-sm">
                <li>BK-2024-0150 • Confirmed</li>
                <li>BK-2024-0148 • Allocated</li>
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium mb-1">Notes</div>
              <p className="text-sm">Key customer since 2021. Prefers early morning deliveries.</p>
            </div>
          </div>
        )}
      </EntityModal>

      <EntityModal
        open={vendorOpen}
        onOpenChange={setVendorOpen}
        title="Add Vendor"
        primaryAction={{ label: "Save", onClick: () => setVendorOpen(false) }}
        secondaryAction={{ label: "Cancel", onClick: () => setVendorOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Vendor name" />
          <input className="border rounded px-3 py-2" placeholder="Type" />
          <input className="border rounded px-3 py-2" placeholder="Contact" />
          <input className="border rounded px-3 py-2" placeholder="Last Payment" />
        </div>
      </EntityModal>
    </div>
  );
}




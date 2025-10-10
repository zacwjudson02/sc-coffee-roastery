import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityModal } from "@/components/shared/EntityModal";
import { useAppData } from "@/hooks/use-appdata";

export default function CustomersVendors() {
  const { customers, vendors, addVendor } = useAppData();
  const [profileId, setProfileId] = useState<string | null>(null);
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
            {customers.map((c) => (
              <div key={c.id} className="border rounded-lg bg-card p-4 space-y-2">
                <div className="font-semibold">{c.company}</div>
                <div className="text-sm text-muted-foreground">{c.contact} • {c.email ?? "-"}</div>
                <div className="text-sm">ID: {c.id.slice(0,8)}…</div>
                <div className="pt-2">
                  <Button size="sm" onClick={() => setProfileId(c.id)}>View Profile</Button>
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
                  <th className="px-4 py-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-4 py-2">{v.name}</td>
                    <td className="px-4 py-2">{v.type ?? "-"}</td>
                    <td className="px-4 py-2">{v.contact ?? "-"}</td>
                    <td className="px-4 py-2">{v.lastPayment ?? "-"}</td>
                    <td className="px-4 py-2">{v.id.slice(0,8)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div className="text-sm text-muted-foreground">Contact: {c.contact} • {c.email ?? "-"}</div>
              <div className="text-sm text-muted-foreground">ID: {c.id}</div>
              <div className="rounded-md border p-3">
                <div className="font-medium mb-1">Linked Bookings</div>
                <div className="text-sm">(Demo) Connect to bookings by `customerId`.</div>
              </div>
            </div>
          );
        })()}
      </EntityModal>

      <EntityModal
        open={vendorOpen}
        onOpenChange={setVendorOpen}
        title="Add Vendor"
        primaryAction={{ label: "Save", onClick: () => {
          // Demo-only simple capture
          const name = (document.getElementById("vendor-name") as HTMLInputElement)?.value || "New Vendor";
          const type = (document.getElementById("vendor-type") as HTMLInputElement)?.value || undefined;
          const contact = (document.getElementById("vendor-contact") as HTMLInputElement)?.value || undefined;
          addVendor({ name, type, contact, lastPayment: new Date().toISOString().slice(0,10) });
          setVendorOpen(false);
        } }}
        secondaryAction={{ label: "Cancel", onClick: () => setVendorOpen(false), variant: "outline" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <input id="vendor-name" className="border rounded px-3 py-2" placeholder="Vendor name" />
          <input id="vendor-type" className="border rounded px-3 py-2" placeholder="Type" />
          <input id="vendor-contact" className="border rounded px-3 py-2" placeholder="Contact" />
          <input className="border rounded px-3 py-2" placeholder="Last Payment (auto on save)" disabled />
        </div>
      </EntityModal>
    </div>
  );
}





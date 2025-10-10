import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ResourceProvider } from "@/hooks/use-resources";
import { InvoicesProvider } from "@/hooks/use-invoices";
import { AppDataProvider } from "@/hooks/use-appdata";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PodStoreProvider } from "@/hooks/use-podstore";
import { EventsProvider } from "@/hooks/use-events";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Runsheets from "./pages/Runsheets";
import PODs from "./pages/PODs";
import Resources from "./pages/Resources";
import CustomersVendors from "./pages/CustomersVendors";
import Invoices from "./pages/Invoices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ResourceProvider>
        <AppDataProvider>
          <InvoicesProvider>
            <PodStoreProvider>
              <EventsProvider>
                <SidebarProvider>
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/runsheets" element={<Runsheets />} />
                        <Route path="/pods" element={<PODs />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/customers" element={<CustomersVendors />} />
                        <Route path="/invoicing" element={<Invoices />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </SidebarProvider>
              </EventsProvider>
            </PodStoreProvider>
          </InvoicesProvider>
        </AppDataProvider>
      </ResourceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

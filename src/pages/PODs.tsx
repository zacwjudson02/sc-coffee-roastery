import { useMemo, useState } from "react";
import { UploadWithOCR, OcrResult } from "@/components/shared/UploadWithOCR";
import { SupabaseTable } from "@/components/shared/SupabaseTable";
import { StatusChip } from "@/components/shared/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignPodDialog, AssignChoice } from "@/components/pods/AssignPodDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Layers, Scissors, Search, Upload, XCircle, Mail, Undo2, CalendarDays, Users, PlayCircle } from "lucide-react";
import { PodViewer } from "@/components/pods/PodViewer";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PingingButton } from "@/components/pods/PingingButton";
import { PodDemoWorkflow } from "@/components/pods/PodDemoWorkflow";

type PodRow = {
  id?: string;
  bookingId: string;
  fileName: string;
  matchPercent: number;
  matchStatus: "Assigned" | "Needs Review";
  uploadedAt: string;
  confirmed: boolean;
  notes?: string;
  file?: File;
  driver?: string;
  customer?: string;
  runNumber?: string;
  status?: "Pending" | "Assigned" | "Needs Review" | "Archived";
};

export default function PODs() {
  const [rows, setRows] = useState<PodRow[]>([
    {
      id: "seed-1",
      bookingId: "BK-2024-0150",
      fileName: "POD-BK-2024-0150.pdf",
      matchPercent: 96,
      matchStatus: "Assigned",
      uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      confirmed: true,
      customer: "ABC Logistics",
      driver: "John Smith",
      runNumber: "RS-1001",
      status: "Assigned",
      // demo only: show invoice present
      // @ts-expect-error demo field used by table
      invoiceId: "INV-2025-0012",
    },
    {
      id: "seed-2",
      bookingId: "BK-2024-0149",
      fileName: "POD-BK-2024-0149.jpg",
      matchPercent: 78,
      matchStatus: "Needs Review",
      uploadedAt: new Date(Date.now() - 3600_000).toISOString().slice(0, 16).replace("T", " "),
      confirmed: false,
      customer: "XYZ Freight",
      driver: "Sarah Jones",
      runNumber: "RS-1002",
      status: "Pending",
    },
    {
      id: "seed-3",
      bookingId: "BK-UNKNOWN",
      fileName: "unknown-pod.pdf",
      matchPercent: 42,
      matchStatus: "Needs Review",
      uploadedAt: new Date(Date.now() - 7200_000).toISOString().slice(0, 16).replace("T", " "),
      confirmed: false,
      customer: "Unmatched",
      status: "Pending",
    },
  ]);
  const [preview, setPreview] = useState<PodRow | null>(null);
  const [assignFor, setAssignFor] = useState<PodRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [demoWorkflowOpen, setDemoWorkflowOpen] = useState(false);
  const [showDemoPing, setShowDemoPing] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [noteFor, setNoteFor] = useState<PodRow | null>(null);
  const [noteText, setNoteText] = useState("");
  const [rangeMode, setRangeMode] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailIncludeCurrent, setEmailIncludeCurrent] = useState(true);
  const [emailFiles, setEmailFiles] = useState<File[]>([]);
  const [adv, setAdv] = useState({
    bookingIdLike: "",
    fileLike: "",
    minPercent: "",
    maxPercent: "",
    confirmed: "all" as "all" | "yes" | "no",
    invoicePresent: "all" as "all" | "yes" | "no",
    driverLike: "",
    runNumberLike: "",
    statuses: { Pending: false, Assigned: false, "Needs Review": false, Archived: false } as Record<string, boolean>,
    sortBy: "uploadedAt" as "uploadedAt" | "matchPercent" | "fileName" | "bookingId" | "status",
    sortDir: "desc" as "asc" | "desc",
  });

  function handleUpload(results: OcrResult[]) {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const mapped: PodRow[] = results.map((r) => ({
      id: `${r.file.name}-${r.file.size}-${r.file.lastModified}`,
      bookingId: r.extractedBookingId ?? "BK-UNKNOWN",
      fileName: r.file.name,
      matchPercent: r.matchPercent,
      matchStatus: r.matchStatus === "Matched" ? "Assigned" : r.matchStatus,
      uploadedAt: now,
      confirmed: r.matchStatus === "Matched",
      file: r.file,
      customer: r.extractedBookingId ? "Matched Customer" : undefined,
      driver: undefined,
      status: r.matchStatus === "Matched" ? "Assigned" : "Pending",
    }));
    setRows((prev) => [...mapped, ...prev]);
    setUploadOpen(false);
  }

  function handleDemoWorkflowComplete(demoPods: Array<{
    bookingId: string;
    fileName: string;
    matchPercent: number;
    file: File;
    status: string;
  }>) {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const mapped: PodRow[] = demoPods.map((p) => ({
      id: `${p.file.name}-${p.file.size}-${p.file.lastModified}`,
      bookingId: p.bookingId,
      fileName: p.fileName,
      matchPercent: p.matchPercent,
      matchStatus: p.status === "Assigned" ? "Assigned" : "Needs Review",
      uploadedAt: now,
      confirmed: p.status === "Assigned",
      file: p.file,
      customer: getCustomerForBooking(p.bookingId),
      driver: getDriverForBooking(p.bookingId),
      runNumber: getRunNumberForBooking(p.bookingId),
      status: p.status as any,
    }));
    setRows((prev) => [...mapped, ...prev]);
    setShowDemoPing(false);
  }

  function getCustomerForBooking(bookingId: string): string {
    const map: Record<string, string> = {
      "BK-2024-0150": "ABC Logistics",
      "BK-2024-0149": "XYZ Freight",
      "BK-2024-0148": "Global Shipping Co",
    };
    return map[bookingId] || "Unknown Customer";
  }

  function getDriverForBooking(bookingId: string): string {
    const map: Record<string, string> = {
      "BK-2024-0150": "John Smith",
      "BK-2024-0149": "Sarah Jones",
      "BK-2024-0148": "Mike Wilson",
    };
    return map[bookingId] || undefined as any;
  }

  function getRunNumberForBooking(bookingId: string): string {
    const map: Record<string, string> = {
      "BK-2024-0150": "RS-1001",
      "BK-2024-0149": "RS-1002",
      "BK-2024-0148": "RS-1003",
    };
    return map[bookingId] || undefined as any;
  }

  const customers = useMemo(() => Array.from(new Set(rows.map((r) => r.customer).filter(Boolean))) as string[], [rows]);
  const filtered = rows.filter((r) => {
    const matchesQuery = [r.bookingId, r.customer, r.fileName].some((v) => (v ?? "").toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter || r.matchStatus === statusFilter;
    const matchesCustomer = customerFilter === "all" || r.customer === customerFilter;
    const uploadedDate = r.uploadedAt.slice(0, 10);
    const matchesDate = rangeMode
      ? (!fromDate || uploadedDate >= fromDate) && (!toDate || uploadedDate <= toDate)
      : (!fromDate || uploadedDate === fromDate);
    // Advanced filters
    const matchesBookingIdLike = !adv.bookingIdLike || (r.bookingId ?? "").toLowerCase().includes(adv.bookingIdLike.toLowerCase());
    const matchesFileLike = !adv.fileLike || (r.fileName ?? "").toLowerCase().includes(adv.fileLike.toLowerCase());
    const mp = Number(r.matchPercent ?? 0);
    const matchesMin = !adv.minPercent || mp >= Number(adv.minPercent);
    const matchesMax = !adv.maxPercent || mp <= Number(adv.maxPercent);
    const matchesConfirmed = adv.confirmed === "all" || (adv.confirmed === "yes" ? r.confirmed : !r.confirmed);
    const matchesInvoice = adv.invoicePresent === "all" || (adv.invoicePresent === "yes" ? Boolean((r as any).invoiceId) : !Boolean((r as any).invoiceId));
    const matchesDriver = !adv.driverLike || (r.driver ?? "").toLowerCase().includes(adv.driverLike.toLowerCase());
    const matchesRun = !adv.runNumberLike || (r.runNumber ?? "").toLowerCase().includes(adv.runNumberLike.toLowerCase());
    const statusChecks = Object.entries(adv.statuses).filter(([, v]) => v).map(([k]) => k);
    const normalizedStatus = String(r.status ?? r.matchStatus) === "Matched" ? "Assigned" : String(r.status ?? r.matchStatus);
    const matchesStatusAdv = statusChecks.length === 0 || statusChecks.includes(normalizedStatus);
    return (
      matchesQuery && matchesStatus && matchesCustomer && matchesDate &&
      matchesBookingIdLike && matchesFileLike && matchesMin && matchesMax && matchesConfirmed && matchesInvoice && matchesDriver && matchesRun && matchesStatusAdv
    );
  });

  // Sorting
  const displayed = [...filtered].sort((a, b) => {
    const dir = adv.sortDir === "asc" ? 1 : -1;
    switch (adv.sortBy) {
      case "matchPercent":
        return ((a.matchPercent ?? 0) - (b.matchPercent ?? 0)) * dir;
      case "fileName":
        return (a.fileName ?? "").localeCompare(b.fileName ?? "") * dir;
      case "bookingId":
        return (a.bookingId ?? "").localeCompare(b.bookingId ?? "") * dir;
      case "status":
        return String(a.status ?? a.matchStatus).localeCompare(String(b.status ?? b.matchStatus)) * dir;
      default:
        return (a.uploadedAt ?? "").localeCompare(b.uploadedAt ?? "") * dir;
    }
  });

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
  const allDisplayedSelected = filtered.length > 0 && filtered.every((r) => selected[r.id ?? r.fileName] === true);
  const anySelected = selectedIds.length > 0;
  const hasDateFilter = Boolean(fromDate) || (rangeMode && Boolean(toDate));
  const advActive = useMemo(() => {
    const statusActive = Object.values(adv.statuses).some(Boolean);
    return (
      adv.bookingIdLike || adv.fileLike || adv.minPercent || adv.maxPercent ||
      adv.confirmed !== "all" || adv.invoicePresent !== "all" || adv.driverLike || adv.runNumberLike ||
      statusActive || adv.sortBy !== "uploadedAt" || adv.sortDir !== "desc"
    );
  }, [adv]);
  const [advOpen, setAdvOpen] = useState(false);

  // KPI metrics (demo)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRows = rows.filter((r) => r.uploadedAt.slice(0, 10) === todayStr);
  const assignedPODs = rows.filter((r) => (r.bookingId && r.bookingId !== "BK-UNKNOWN") || String(r.status ?? r.matchStatus) === "Assigned").length;
  const unassignedPODs = Math.max(0, rows.length - assignedPODs);
  const uniqueBookingsToday = new Set(
    todayRows.filter((r) => r.bookingId && r.bookingId.startsWith("BK-")).map((r) => r.bookingId)
  ).size;
  const assignedBookingsToday = new Set(
    todayRows.filter((r) => r.bookingId && r.bookingId !== "BK-UNKNOWN").map((r) => r.bookingId)
  ).size;
  const percentAssignedToday = uniqueBookingsToday > 0 ? Math.round((assignedBookingsToday / uniqueBookingsToday) * 100) : 0;
  const ocrAvgToday = todayRows.length > 0 ? Math.round(todayRows.reduce((a, b) => a + (b.matchPercent ?? 0), 0) / todayRows.length) : 0;

  function toggleAllDisplayed(checked: boolean | string) {
    const value = Boolean(checked);
    const update: Record<string, boolean> = { ...selected };
    filtered.forEach((r) => {
      const key = r.id ?? r.fileName;
      update[key] = value;
    });
    setSelected(update);
  }

  function mergeSelected() {
    if (selectedIds.length < 2) return;
    const chosen = rows.filter((r) => selectedIds.includes((r.id ?? r.fileName) as string));
    if (chosen.length < 2) return;
    // create a demo PDF-like blob as merged file
    const mergedContent = `Merged PODs\n\n${chosen.map((c, i) => `Part ${i + 1}: ${c.fileName} (${c.bookingId})`).join("\n")}`;
    const mergedBlob = new Blob([mergedContent], { type: "application/pdf" });
    const mergedFile = new File([mergedBlob], `Merged-${chosen.length}-PODs.pdf`, { type: "application/pdf" });

    const merged: PodRow = {
      ...chosen[0],
      id: `merged-${Date.now()}`,
      fileName: mergedFile.name,
      matchPercent: Math.round(chosen.reduce((a, b) => a + b.matchPercent, 0) / chosen.length),
      notes: ["Merged:", ...chosen.map((c) => c.fileName)].join("\n"),
      status: "Pending",
      file: mergedFile,
    };
    setRows((prev) => [merged, ...prev.filter((r) => !selectedIds.includes((r.id ?? r.fileName) as string))]);
    setSelected({});
  }

  function splitSelected() {
    if (selectedIds.length !== 1) return;
    const targetId = selectedIds[0];
    const item = rows.find((r) => (r.id ?? r.fileName) === targetId);
    if (!item) return;
    const partA: PodRow = { ...item, id: `${targetId}-A`, fileName: `${item.fileName}-partA` };
    const partB: PodRow = { ...item, id: `${targetId}-B`, fileName: `${item.fileName}-partB` };
    setRows((prev) => [partA, partB, ...prev.filter((r) => (r.id ?? r.fileName) !== targetId)]);
    setSelected({});
  }

  function exportSelected() {
    const bundle = rows.filter((r) => selectedIds.includes((r.id ?? r.fileName) as string));
    const content = `POD Bundle\nCount: ${bundle.length}\nFiles:\n${bundle.map((b) => `- ${b.fileName} (${b.bookingId})`).join("\n")}`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `POD-bundle-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PODs</h1>
        <p className="text-muted-foreground">Upload proof of delivery and match to bookings</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <KpiCard title="Assigned PODs" value={assignedPODs} icon={Upload} variant="success" />
        <KpiCard title="Unassigned PODs" value={unassignedPODs} icon={XCircle} variant="urgent" />
        <KpiCard title="Bookings Today (demo)" value={uniqueBookingsToday} icon={CalendarDays} />
        <KpiCard title="% Bookings Assigned" value={`${percentAssignedToday}%`} icon={Layers} variant="success" />
        <KpiCard title="OCR % Today" value={`${ocrAvgToday}%`} icon={Filter} variant="warning" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search booking, file, customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={cn("pl-9", (searchQuery.trim().length > 0) && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive")} />
          </div>
          {(searchQuery.trim().length > 0) && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}> <XCircle className="h-4 w-4 mr-1" /> Clear</Button>
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={cn("min-w-[160px]", (statusFilter !== "all") && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive") }>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Needs Review">Needs Review</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className={cn("min-w-[160px]", (customerFilter !== "all") && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive") }>
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="Date"
            className={cn(
              "w-[150px]",
              hasDateFilter && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive"
            )}
          />
          {rangeMode && (
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To"
              className={cn(
                "w-[150px]",
                hasDateFilter && "border-destructive ring-1 ring-destructive/40 bg-destructive/5 text-destructive"
              )}
            />
          )}
          <Button variant="outline" onClick={() => setRangeMode((m) => !m)}>
            {rangeMode ? "Single Day" : "Search Range"}
          </Button>
          {hasDateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setRangeMode(false);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" /> Clear Date
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const today = new Date().toISOString().slice(0,10);
            setFromDate(today);
            setToDate("");
            setRangeMode(false);
            setStatusFilter("Pending");
          }}>Unmatched Today</Button>
          
          {showDemoPing ? (
            <PingingButton 
              onClick={() => setDemoWorkflowOpen(true)}
              icon={PlayCircle}
              isPinging={true}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Demo POD Workflow
            </PingingButton>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setDemoWorkflowOpen(true)}
            >
              <PlayCircle className="h-4 w-4 mr-2" /> Demo POD Workflow
            </Button>
          )}
          
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload PODs
          </Button>
          <Button
            variant="outline"
            className={cn(advActive && "border-destructive text-destructive")}
            onClick={() => {
              if (advActive) {
                setAdv({
                  bookingIdLike: "",
                  fileLike: "",
                  minPercent: "",
                  maxPercent: "",
                  confirmed: "all",
                  invoicePresent: "all",
                  driverLike: "",
                  runNumberLike: "",
                  statuses: { Pending: false, Assigned: false, "Needs Review": false, Archived: false },
                  sortBy: "uploadedAt",
                  sortDir: "desc",
                });
                setAdvOpen(false);
              } else {
                setAdvOpen(true);
              }
            }}
          >
            {advActive ? "Clear Filters" : "More Filters"}
          </Button>
          <Sheet open={advOpen} onOpenChange={setAdvOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Booking ID contains</div>
                    <Input placeholder="BK-..." value={adv.bookingIdLike} onChange={(e) => setAdv((v) => ({ ...v, bookingIdLike: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">File name contains</div>
                    <Input placeholder="pod.pdf" value={adv.fileLike} onChange={(e) => setAdv((v) => ({ ...v, fileLike: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Min OCR %</div>
                    <Input type="number" min={0} max={100} placeholder="0" value={adv.minPercent} onChange={(e) => setAdv((v) => ({ ...v, minPercent: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Max OCR %</div>
                    <Input type="number" min={0} max={100} placeholder="100" value={adv.maxPercent} onChange={(e) => setAdv((v) => ({ ...v, maxPercent: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Confirmed?</div>
                    <Select value={adv.confirmed} onValueChange={(v: any) => setAdv((s) => ({ ...s, confirmed: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Invoice Present?</div>
                    <Select value={adv.invoicePresent} onValueChange={(v: any) => setAdv((s) => ({ ...s, invoicePresent: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Driver contains</div>
                    <Input placeholder="Driver name" value={adv.driverLike} onChange={(e) => setAdv((v) => ({ ...v, driverLike: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Run number contains</div>
                    <Input placeholder="Run #" value={adv.runNumberLike} onChange={(e) => setAdv((v) => ({ ...v, runNumberLike: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Statuses</div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pending", "Assigned", "Needs Review", "Archived"].map((label) => (
                      <label key={label} className="text-sm flex items-center gap-2">
                        <input type="checkbox" checked={adv.statuses[label]} onChange={(e) => setAdv((v) => ({ ...v, statuses: { ...v.statuses, [label]: e.target.checked } }))} /> {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Sort By</div>
                    <Select value={adv.sortBy} onValueChange={(v: any) => setAdv((s) => ({ ...s, sortBy: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uploadedAt">Date Uploaded</SelectItem>
                        <SelectItem value="matchPercent">OCR %</SelectItem>
                        <SelectItem value="fileName">File Name</SelectItem>
                        <SelectItem value="bookingId">Booking ID</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Direction</div>
                    <Select value={adv.sortDir} onValueChange={(v: any) => setAdv((s) => ({ ...s, sortDir: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setAdv({
                    bookingIdLike: "",
                    fileLike: "",
                    minPercent: "",
                    maxPercent: "",
                    confirmed: "all",
                    invoicePresent: "all",
                    driverLike: "",
                    runNumberLike: "",
                    statuses: { Pending: false, Assigned: false, "Needs Review": false, Archived: false },
                    sortBy: "uploadedAt",
                    sortDir: "desc",
                  })}>Reset</Button>
                  <Button onClick={() => setAdvOpen(false)}>Apply</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b text-sm flex items-center justify-between">
          <div className="text-muted-foreground">{anySelected ? `${selectedIds.length} selected` : `Recent Uploads`}</div>
          <div className="space-x-2">
            {selectedIds.length >= 2 && (
              <Button size="sm" variant="outline" onClick={mergeSelected}><Layers className="h-4 w-4 mr-1" /> Merge</Button>
            )}
            {selectedIds.length === 1 && (
              <Button size="sm" variant="outline" onClick={splitSelected}><Scissors className="h-4 w-4 mr-1" /> Split</Button>
            )}
            <Button size="sm" onClick={exportSelected} disabled={!anySelected}><Download className="h-4 w-4 mr-1" /> Export Bundle</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2 w-8">
                  <Checkbox checked={allDisplayedSelected} onCheckedChange={toggleAllDisplayed} aria-label="Select all" />
                </th>
                <th className="px-4 py-2">Booking ID</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">OCR Match %</th>
                <th className="px-4 py-2">Match Status</th>
                <th className="px-4 py-2">Date Uploaded</th>
                <th className="px-4 py-2">Confirmed?</th>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                    <Checkbox checked={!!selected[(r.id ?? r.fileName) as string]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [(r.id ?? r.fileName) as string]: Boolean(v) }))} />
                  </td>
                  <td className="px-4 py-2">{r.bookingId}</td>
                  <td className="px-4 py-2 underline cursor-pointer" onClick={() => setPreview(r)}>{r.fileName}</td>
                  <td className="px-4 py-2">{r.matchPercent}%</td>
                  <td className="px-4 py-2"><StatusChip status={(String(r.status ?? r.matchStatus) === "Matched" ? "Assigned" : (r.status ?? r.matchStatus)) as any} /></td>
                  <td className="px-4 py-2">{r.uploadedAt}</td>
                  <td className="px-4 py-2">{r.confirmed ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{(r as any).invoiceId ?? "-"}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(r)}>Preview</Button>
                      {r.matchStatus === "Needs Review" && (
                        <Button size="sm" onClick={() => setAssignFor(r)}>Assign</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setNoteFor(r); setNoteText(r.notes ?? ""); }}>Add Note</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-[1100px]">
          {preview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Large preview only */}
              <div className="border rounded-md overflow-hidden">
                <div className="px-3 py-2 text-sm border-b">Preview</div>
                <PodViewer file={preview.file} height={420} />
              </div>

              {/* Right: Actions + Booking Details stack */}
              <div className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                  <div className="px-3 py-2 text-sm border-b">Actions</div>
                  <div className="p-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)}><Mail className="h-4 w-4 mr-1" /> Email</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const targetId = (preview.id ?? preview.fileName) as string;
                      const item = rows.find((r) => (r.id ?? r.fileName) === targetId);
                      if (!item) return;
                      const partA: PodRow = { ...item, id: `${targetId}-A`, fileName: `${item.fileName}-partA` };
                      const partB: PodRow = { ...item, id: `${targetId}-B`, fileName: `${item.fileName}-partB` };
                      setRows((prev) => [partA, partB, ...prev.filter((r) => (r.id ?? r.fileName) !== targetId)]);
                      setPreview(null);
                    }}><Scissors className="h-4 w-4 mr-1" /> Split</Button>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                  <div className="px-3 py-2 text-sm border-b flex items-center justify-between gap-2">
                    <div>Booking Details</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setRows((prev) => prev.map((r) => (r.fileName === preview.fileName ? { ...r, bookingId: "BK-UNKNOWN", confirmed: false, status: "Pending", matchStatus: "Needs Review" } : r)));
                      }}><Undo2 className="h-4 w-4 mr-1" /> Unassign</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const day = preview.uploadedAt.slice(0,10);
                        setFromDate(day);
                        setToDate("");
                        setRangeMode(false);
                      }}><CalendarDays className="h-4 w-4 mr-1" /> Same Day</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        if (!preview.customer) return;
                        setCustomerFilter(preview.customer);
                      }} disabled={!preview.customer}><Users className="h-4 w-4 mr-1" /> Same Customer</Button>
                    </div>
                  </div>
                <div className="p-3">
                  <SupabaseTable
                    tableName="bookings"
                    columns={[
                      { key: "bookingId", header: "Booking ID" },
                      { key: "customer", header: "Customer" },
                      { key: "pickup", header: "Pickup" },
                      { key: "dropoff", header: "Dropoff" },
                    ]}
                    data={[{
                      bookingId: preview.bookingId,
                      customer: "Demo Customer",
                      pickup: "From OCR/PDF",
                      dropoff: "From DB",
                    }]}
                  />
                  <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => setPreview({ ...preview, confirmed: true, matchStatus: "Assigned", status: "Assigned" as any })}>Confirm Assign</Button>
                    <Button size="sm" variant="outline" onClick={() => setPreview(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Demo Workflow */}
      <PodDemoWorkflow
        open={demoWorkflowOpen}
        onOpenChange={setDemoWorkflowOpen}
        onComplete={handleDemoWorkflowComplete}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Upload PODs</DialogTitle>
          </DialogHeader>
          <UploadWithOCR onUpload={handleUpload} />
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Email POD</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">To</div>
                <Input placeholder="email@company.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">CC</div>
                <Input placeholder="cc@company.com" value={emailCc} onChange={(e) => setEmailCc(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Subject</div>
                <Input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Message</div>
              <Textarea rows={6} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your message..." />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={emailIncludeCurrent} onChange={(e) => setEmailIncludeCurrent(e.target.checked)} />
                Include current POD
              </label>
              <div className="ml-auto">
                <input id="email-attachments" type="file" multiple className="hidden" onChange={(e) => setEmailFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("email-attachments")?.click()}>Add Attachments</Button>
              </div>
            </div>

            { (emailFiles.length > 0 || (emailIncludeCurrent && preview)) && (
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground mb-1">Attachments</div>
                <div className="flex flex-wrap gap-2">
                  {emailIncludeCurrent && preview && (
                    <span className="text-xs px-2 py-1 rounded bg-muted">{preview.fileName}</span>
                  )}
                  {emailFiles.map((f, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded bg-muted inline-flex items-center gap-1">
                      {f.name}
                      <button className="text-muted-foreground hover:text-foreground" onClick={() => setEmailFiles((prev) => prev.filter((_, i) => i !== idx))}>×</button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">Note: Email clients launched via mailto cannot auto-attach files. Your client will open with subject/message; please attach files before sending.</div>
              </div>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!preview) return;
              const to = encodeURIComponent(emailTo.trim());
              const cc = encodeURIComponent(emailCc.trim());
              const subj = encodeURIComponent(emailSubject || `POD ${preview.fileName}`);
              const attachList: string[] = [];
              if (emailIncludeCurrent) attachList.push(preview.fileName);
              attachList.push(...emailFiles.map((f) => f.name));
              const bodyParts = [emailBody || "", attachList.length ? `\n\nAttachments to include:\n- ${attachList.join("\n- ")}` : ""];
              const body = encodeURIComponent(bodyParts.filter(Boolean).join("\n"));
              const mailto = `mailto:${to}?${cc ? `cc=${cc}&` : ""}subject=${subj}&body=${body}`;
              window.open(mailto);
              setEmailOpen(false);
            }}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={!!noteFor} onOpenChange={(o) => !o && setNoteFor(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Admin Note</DialogTitle>
          </DialogHeader>
          <Textarea rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add context, exceptions, customer comms..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteFor(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!noteFor) return;
              setRows((prev) => prev.map((r) => ((r.id ?? r.fileName) === (noteFor.id ?? noteFor.fileName) ? { ...r, notes: noteText } : r)));
              setNoteFor(null);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignPodDialog
        open={!!assignFor}
        onOpenChange={(o) => !o && setAssignFor(null)}
        fileName={assignFor?.fileName ?? ""}
        file={assignFor?.file}
        choices={(
          [
            { bookingId: "BK-2024-0150", customer: "ABC Logistics", pickup: "Melbourne Warehouse", dropoff: "Sydney CBD", date: "2024-10-02" },
            { bookingId: "BK-2024-0149", customer: "XYZ Freight", pickup: "Brisbane Port", dropoff: "Gold Coast", date: "2024-10-02" },
            { bookingId: "BK-2024-0148", customer: "Global Shipping Co", pickup: "Adelaide Depot", dropoff: "Melbourne", date: "2024-10-02" },
            { bookingId: "BK-2024-0147", customer: "Fast Track Transport", pickup: "Perth Hub", dropoff: "Fremantle", date: "2024-10-03" },
          ] as AssignChoice[]
        )}
        onAssign={(bookingId) => {
          if (!assignFor) return;
          setRows((prev) => prev.map((r) => (r.fileName === assignFor.fileName ? { ...r, bookingId, confirmed: true, matchStatus: "Assigned", status: "Assigned" as any } : r)));
          setAssignFor(null);
        }}
      />
    </div>
  );
}



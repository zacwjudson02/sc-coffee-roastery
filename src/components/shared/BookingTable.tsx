import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/shared/StatusChip";
import { ArrowUpDown } from "lucide-react";

export type BookingRow = {
  id: string;
  bookingId: string;
  customer: string;
  pickup: string;
  dropoff: string;
  status: string;
  driver?: string;
  date?: string;
};

type SortKey = keyof Pick<BookingRow, "bookingId" | "customer" | "pickup" | "dropoff" | "status" | "driver" | "date">;

type BookingTableProps = {
  data: BookingRow[];
  onView?: (row: BookingRow) => void;
  onAllocate?: (row: BookingRow) => void;
  pageSize?: number;
};

export function BookingTable({ data, onView, onAllocate, pageSize = 10 }: BookingTableProps) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const va = (a[sortKey] ?? "").toString().toLowerCase();
      const vb = (b[sortKey] ?? "").toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const start = page * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("bookingId")}>Booking ID <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("customer")}>Customer <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("pickup")}>Pickup <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("dropoff")}>Dropoff <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>Date <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("driver")}>Driver <ArrowUpDown className="inline h-3 w-3 ml-1" /></TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.bookingId}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell>{row.pickup}</TableCell>
              <TableCell>{row.dropoff}</TableCell>
              <TableCell>{row.date ?? "-"}</TableCell>
              <TableCell>{row.driver ?? "-"}</TableCell>
              <TableCell>
                <StatusChip status={row.status} />
              </TableCell>
              <TableCell className="text-right space-x-1">
                {onAllocate && (
                  <Button variant="ghost" size="sm" onClick={() => onAllocate(row)}>
                    Allocate
                  </Button>
                )}
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(row)}>
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between p-3">
        <div className="text-sm text-muted-foreground">
          Showing {start + 1}-{Math.min(start + pageSize, sorted.length)} of {sorted.length}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Prev
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}




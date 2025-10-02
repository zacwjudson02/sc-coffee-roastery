import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SupabaseTableProps<T> = {
  tableName: string;
  columns: { key: keyof T; header: string }[];
  data: T[];
};

export function SupabaseTable<T extends Record<string, any>>({ tableName, columns, data }: SupabaseTableProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 text-sm text-muted-foreground border-b">Table: {tableName} (Supabase ready)</div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={String(c.key)}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((c) => (
                <TableCell key={String(c.key)}>{String(row[c.key] ?? "-")}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}




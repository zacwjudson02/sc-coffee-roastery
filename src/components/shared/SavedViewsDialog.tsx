import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SavedView = {
  id: string;
  name: string;
  payload: any;
};

type Column = { key: string; label: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: any;
  onApply: (payload: any) => void;
  storageKey?: string;
  columnSets?: Record<string, Column[]>; // { Admin: [...], Allocation: [...], Customer Service: [...] }
  selectedColumns?: string[];
};

export function SavedViewsDialog({ open, onOpenChange, current, onApply, storageKey = "bookings.savedViews", columnSets, selectedColumns = [] }: Props) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [builderName, setBuilderName] = useState("");
  const [builderBase, setBuilderBase] = useState<string>("");
  const [builderCols, setBuilderCols] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setViews(JSON.parse(raw));
    } catch {}
  }, [open, storageKey]);

  // initialize builder for new view when dialog opens
  useEffect(() => {
    if (!open) return;
    setMode("list");
  }, [open]);

  function persist(next: SavedView[]) {
    setViews(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }

  function startNew() {
    const base = current?.base ?? "Admin";
    setBuilderBase(base);
    const options = columnSets?.[base] ?? [];
    const next: Record<string, boolean> = {};
    options.forEach((c) => { next[c.key] = selectedColumns.includes(c.key); });
    setBuilderCols(next);
    setBuilderName("");
    setMode("new");
  }

  function saveNew() {
    const id = String(Date.now());
    const name = builderName.trim() || `View ${views.length + 1}`;
    const payload = {
      ...current,
      base: builderBase,
      columns: (columnSets?.[builderBase] || []).filter((c) => builderCols[c.key]).map((c) => c.key),
    };
    persist([{ id, name, payload }, ...views]);
    setMode("list");
  }

  function beginEdit(viewId: string) {
    const v = views.find((x) => x.id === viewId);
    if (!v) return;
    setSelectedId(viewId);
    const base = v.payload?.base ?? "Admin";
    setBuilderBase(base);
    const options = columnSets?.[base] ?? [];
    const next: Record<string, boolean> = {};
    options.forEach((c) => { next[c.key] = (v.payload?.columns || []).includes(c.key); });
    setBuilderCols(next);
    setBuilderName(v.name);
    setMode("edit");
  }

  function updateSelected() {
    const idx = views.findIndex((x) => x.id === selectedId);
    if (idx < 0) return;
    const base = builderBase || "Admin";
    const options = columnSets?.[base] ?? [];
    const nextCols = options.filter((c) => builderCols[c.key]).map((c) => c.key);
    const updated = [...views];
    updated[idx] = {
      ...updated[idx],
      name: builderName || updated[idx].name,
      payload: {
        ...(updated[idx].payload || {}),
        base,
        columns: nextCols,
      },
    };
    persist(updated);
    setMode("list");
  }

  function applySelected() {
    const v = views.find((x) => x.id === selectedId);
    if (v) onApply(v.payload);
    onOpenChange(false);
  }

  function remove(id: string) {
    persist(views.filter((v) => v.id !== id));
    if (selectedId === id) setSelectedId("");
  }

  const builderColumns = (columnSets?.[builderBase || current?.base || "Admin"] || []);
  const selectAll = () => {
    const next: Record<string, boolean> = {};
    builderColumns.forEach((c) => { next[c.key] = true; });
    setBuilderCols(next);
  };
  const clearAll = () => {
    const next: Record<string, boolean> = {};
    builderColumns.forEach((c) => { next[c.key] = false; });
    setBuilderCols(next);
  };
  const toggleBuilder = (key: string) => setBuilderCols((p) => ({ ...p, [key]: !p[key] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit Views</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {mode === "list" && (
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Saved Views</div>
              <Button size="sm" onClick={startNew}>New View</Button>
            </div>
          )}

          {mode === "new" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">View name</div>
                  <Input placeholder="View name" value={builderName} onChange={(e) => setBuilderName(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <div className="mr-auto hidden md:flex items-center gap-2 text-xs text-muted-foreground">{Object.values(builderCols).filter(Boolean).length} selected</div>
                  <Button variant="outline" size="sm" onClick={clearAll}>Clear</Button>
                  <Button variant="outline" size="sm" onClick={selectAll}>Select all</Button>
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {builderColumns.map((c) => {
                    const active = !!builderCols[c.key];
                    return (
                      <Button
                        key={c.key}
                        variant={active ? "secondary" : "outline"}
                        size="sm"
                        className={`justify-start w-full ${active ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-muted"}`}
                        onClick={() => toggleBuilder(c.key)}
                        aria-pressed={active}
                        role="checkbox"
                        aria-checked={active}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleBuilder(c.key); } }}
                      >
                        <span className={`mr-2 inline-block h-3 w-3 rounded-sm border ${active ? "bg-primary border-primary" : "bg-transparent border-border"}`} />
                        {c.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="text-right space-x-2">
                <Button variant="outline" onClick={() => setMode("list")}>Cancel</Button>
                <Button onClick={saveNew}>Save</Button>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rename view</div>
                  <Input placeholder="View name" value={builderName} onChange={(e) => setBuilderName(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <div className="mr-auto hidden md:flex items-center gap-2 text-xs text-muted-foreground">{Object.values(builderCols).filter(Boolean).length} selected</div>
                  <Button variant="outline" size="sm" onClick={clearAll}>Clear</Button>
                  <Button variant="outline" size="sm" onClick={selectAll}>Select all</Button>
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {builderColumns.map((c) => {
                    const active = !!builderCols[c.key];
                    return (
                      <Button
                        key={c.key}
                        variant={active ? "secondary" : "outline"}
                        size="sm"
                        className={`justify-start w-full ${active ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-muted"}`}
                        onClick={() => toggleBuilder(c.key)}
                        aria-pressed={active}
                        role="checkbox"
                        aria-checked={active}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleBuilder(c.key); } }}
                      >
                        <span className={`mr-2 inline-block h-3 w-3 rounded-sm border ${active ? "bg-primary border-primary" : "bg-transparent border-border"}`} />
                        {c.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="text-right space-x-2">
                <Button variant="outline" onClick={() => setMode("list")}>Cancel</Button>
                <Button onClick={updateSelected}>Update</Button>
              </div>
            </div>
          )}

          {mode === "list" && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Saved Views</div>
            <div className="rounded border divide-y">
              {views.length === 0 && <div className="p-3 text-sm text-muted-foreground">No saved views yet.</div>}
              {views.map((v) => (
                <div key={v.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{v.name}</div>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onApply(v.payload)}>Apply</Button>
                      <Button size="sm" variant="outline" onClick={() => beginEdit(v.id)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(v.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {mode === "list" && <Button disabled={!selectedId} onClick={applySelected}>Apply Selected</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



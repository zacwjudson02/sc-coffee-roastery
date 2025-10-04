import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Column = { key: string; label: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  visible: string[];
  onApply: (visible: string[]) => void;
};

export function ColumnManagerDialog({ open, onOpenChange, columns, visible, onApply }: Props) {
  const [local, setLocal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    columns.forEach((c) => { next[c.key] = visible.includes(c.key); });
    setLocal(next);
  }, [columns, visible, open]);

  function toggle(key: string, value: boolean | string) {
    setLocal((p) => ({ ...p, [key]: Boolean(value) }));
  }

  function apply() {
    const selected = columns.filter((c) => local[c.key]).map((c) => c.key);
    onApply(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Columns</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {columns.map((c) => (
            <label key={c.key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={!!local[c.key]} onCheckedChange={(v) => toggle(c.key, v)} />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={apply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



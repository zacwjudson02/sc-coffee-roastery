import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OcrResult = {
  file: File;
  matchPercent: number;
  matchStatus: "Matched" | "Needs Review";
  extractedBookingId?: string;
};

type UploadWithOCRProps = {
  onUpload?: (results: OcrResult[]) => void;
  className?: string;
};

export function UploadWithOCR({ onUpload, className }: UploadWithOCRProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const simulateOcr = useCallback(async (files: File[]): Promise<OcrResult[]> => {
    function inferBookingId(name: string) {
      const m = name.match(/BK[-_]?\d{4}[-_]?\d{3,}/i);
      return m ? m[0].replace(/[_]/g, "-").toUpperCase() : undefined;
    }
    return files.map((file) => {
      const inferred = inferBookingId(file.name);
      const matchPercent = inferred ? 92 + Math.floor(Math.random() * 8) : 40 + Math.floor(Math.random() * 30);
      return {
        file,
        matchPercent,
        matchStatus: matchPercent >= 80 ? "Matched" : "Needs Review",
        extractedBookingId: inferred,
      };
    });
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const results = await simulateOcr(list);
    onUpload?.(results);
  }, [onUpload, simulateOcr]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center bg-muted/20",
        dragActive ? "border-accent" : "border-border",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <p className="text-sm text-muted-foreground">Drag and drop files here, or</p>
      <div className="mt-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Choose Files
        </Button>
      </div>
    </div>
  );
}




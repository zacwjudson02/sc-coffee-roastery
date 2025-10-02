import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

type PodViewerProps = {
  file?: File;
  height?: number;
};

export function PodViewer({ file, height = 420 }: PodViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const isImage = file ? file.type.startsWith("image/") : false;

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b bg-muted/40 sticky top-0 z-10">
        <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}><ZoomOut className="h-4 w-4" /></Button>
        <div className="text-xs w-14 text-center">{Math.round(zoom * 100)}%</div>
        <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}><ZoomIn className="h-4 w-4" /></Button>
        <div className="mx-2 w-px h-5 bg-border" />
        <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r - 90) % 360)}><RotateCcw className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw className="h-4 w-4" /></Button>
        <div className="mx-2 w-px h-5 bg-border" />
        <Button variant="outline" size="sm" disabled={!url} onClick={() => url && download(url, file?.name || "pod.pdf")}><Download className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-hidden" style={{ height }}>
        <div className="h-full w-full overflow-auto bg-muted/10 flex items-center justify-center">
          {!file && <span className="text-xs text-muted-foreground">No file selected</span>}
          {file && isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={file.name}
              src={url ?? undefined}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                display: "block",
              }}
            />
          )}
          {file && !isImage && (
            <div className="h-full w-full overflow-auto">
              <iframe
                title={file.name}
                src={url ?? undefined}
                className="w-full h-full rounded"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: "top left" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function download(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



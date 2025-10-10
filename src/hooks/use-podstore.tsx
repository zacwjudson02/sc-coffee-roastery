import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type PodStoreState = {
  setFile: (key: string, file: File) => void;
  getFile: (key: string) => File | undefined;
  removeFile: (key: string) => void;
};

const PodStoreContext = createContext<PodStoreState | null>(null);

export function PodStoreProvider({ children }: { children: React.ReactNode }) {
  const filesRef = useRef<Map<string, File>>(new Map());
  const [, setVersion] = useState(0);

  const setFile = useCallback<PodStoreState["setFile"]>((key, file) => {
    filesRef.current.set(key, file);
    setVersion((v) => v + 1);
  }, []);

  const getFile = useCallback<PodStoreState["getFile"]>((key) => {
    return filesRef.current.get(key);
  }, []);

  const removeFile = useCallback<PodStoreState["removeFile"]>((key) => {
    filesRef.current.delete(key);
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo<PodStoreState>(() => ({ setFile, getFile, removeFile }), [setFile, getFile, removeFile]);

  return <PodStoreContext.Provider value={value}>{children}</PodStoreContext.Provider>;
}

export function usePodStore() {
  const ctx = useContext(PodStoreContext);
  if (!ctx) throw new Error("usePodStore must be used within PodStoreProvider");
  return ctx;
}



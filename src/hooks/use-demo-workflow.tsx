import { createContext, useContext, useState, ReactNode } from "react";

type DemoWorkflowContextType = {
  openPodWorkflow: () => void;
  podWorkflowOpen: boolean;
  setPodWorkflowOpen: (open: boolean) => void;
};

const DemoWorkflowContext = createContext<DemoWorkflowContextType | undefined>(undefined);

export function DemoWorkflowProvider({ children }: { children: ReactNode }) {
  const [podWorkflowOpen, setPodWorkflowOpen] = useState(false);

  const openPodWorkflow = () => {
    setPodWorkflowOpen(true);
  };

  return (
    <DemoWorkflowContext.Provider value={{ openPodWorkflow, podWorkflowOpen, setPodWorkflowOpen }}>
      {children}
    </DemoWorkflowContext.Provider>
  );
}

export function useDemoWorkflow() {
  const context = useContext(DemoWorkflowContext);
  if (!context) {
    throw new Error("useDemoWorkflow must be used within DemoWorkflowProvider");
  }
  return context;
}

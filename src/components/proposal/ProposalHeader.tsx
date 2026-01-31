import { motion } from "framer-motion";

interface ProposalHeaderProps {
  clientName?: string;
  proposalDate?: string;
}

const ProposalHeader = ({
  clientName = "Client Name",
  proposalDate = new Date().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
}: ProposalHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 md:py-6 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="flex items-center gap-4 md:gap-6">
        <img 
          src="/Factory Freight Connection Logo.png" 
          alt="Factory Freight Connections" 
          className="h-14 md:h-16 w-auto"
        />
        <span className="text-base md:text-lg font-semibold text-foreground hidden sm:inline">
          Proposal for {clientName}
        </span>
      </div>
      <span className="text-sm md:text-base font-medium text-muted-foreground">{proposalDate}</span>
    </motion.header>
  );
};

export default ProposalHeader;

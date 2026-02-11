import { useState, useEffect } from "react";
import proposalGuide from "@/lib/proposalGuide";
import WelcomeOverlay from "@/components/proposal/WelcomeOverlay";
import ProposalStoryOverlay from "@/components/proposal/ProposalStoryOverlay";
import HeroSection from "@/components/roastery/HeroSection";
import RealitySection from "@/components/roastery/RealitySection";
import TransportStory from "@/components/roastery/TransportStory";
import CoffeeTranslation from "@/components/roastery/CoffeeTranslation";
import WhatThisIsNot from "@/components/roastery/WhatThisIsNot";
import ClosingSection from "@/components/roastery/ClosingSection";

const Proposal = () => {
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    proposalGuide.start();
    return () => {
      proposalGuide.stop();
    };
  }, []);

  return (
    <div className="proposal-theme relative min-h-screen w-full">
      <WelcomeOverlay />
      <ProposalStoryOverlay open={showStory} onClose={() => setShowStory(false)} />

      <main className="overflow-hidden">
        <HeroSection onWalkThrough={() => setShowStory(true)} />
        <RealitySection />
        <TransportStory />
        <CoffeeTranslation />
        <WhatThisIsNot />
        <ClosingSection />
      </main>
    </div>
  );
};

export default Proposal;

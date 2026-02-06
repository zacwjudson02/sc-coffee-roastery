import { motion } from "framer-motion";
import ProposalHeader from "@/components/proposal/ProposalHeader";
import ProposalSection, { itemVariants } from "@/components/proposal/ProposalSection";
import ProgressNav from "@/components/proposal/ProgressNav";
import BulletList from "@/components/proposal/BulletList";
import { useState, useEffect } from "react";
import proposalGuide from "@/lib/proposalGuide";
import WelcomeOverlay from "@/components/proposal/WelcomeOverlay";
import ProposalStoryOverlay from "@/components/proposal/ProposalStoryOverlay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Globe } from "lucide-react";

const sections = [
  { id: "executive", label: "Executive Summary" },
  { id: "about", label: "Current Reality" },
  { id: "pain-points", label: "Key Pain Points" },
  { id: "future-state", label: "Future State" },
  { id: "system-overview", label: "System Overview" },
  { id: "out-of-scope", label: "Out of Scope" },
  { id: "roi", label: "ROI & Leverage" },
  { id: "deployment", label: "Deployment Plan" },
  { id: "training", label: "Training" },
];

const Proposal = () => {
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    // Initialize the proposal guide
    proposalGuide.start();

    // Cleanup on unmount
    return () => {
      proposalGuide.stop();
    };
  }, []);

  return (
    <div className="proposal-theme relative min-h-screen">
      <WelcomeOverlay />
      <ProposalStoryOverlay open={showStory} onClose={() => setShowStory(false)} />
      
      <ProposalHeader clientName="Menz Transport" />
      <ProgressNav sections={sections} />

      {/* Hero / Title */}
      <ProposalSection id="intro" className="pt-32" data-section>
        <div data-read>
          <motion.h1 variants={itemVariants} className="mb-8 mt-12">
            Menz Transport System Proposal
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl font-medium mb-6 max-w-3xl"
          >
            One operations platform. Built to match how MENZ already works.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8"
          >
            This proposal outlines a practical transport operations system designed to remove admin drag, tighten invoicing, and give management clear visibility across jobs, PODs, and revenue — without disrupting day-to-day operations.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-base text-muted-foreground font-medium"
          >
            Built by transport operators, for transport operators.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button 
                size="lg"
                onClick={() => setShowStory(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-7 shadow-lg hover:shadow-xl transition-all rounded-full hover:scale-105 transform duration-200 w-full sm:w-auto gap-2"
            >
                <Play className="w-5 h-5 fill-current" />
                Walk Through the Strategy
            </Button>
            
            <Link to="/demo">
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 font-semibold text-lg px-8 py-7 rounded-full hover:bg-accent/10 transition-all hover:scale-105 transform duration-200 w-full sm:w-auto"
              >
                See Clickthrough Demo
              </Button>
            </Link>

            <Link to="/landing">
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 font-semibold text-lg px-8 py-7 rounded-full hover:bg-accent/10 transition-all hover:scale-105 transform duration-200 w-full sm:w-auto gap-2"
              >
                <Globe className="w-5 h-5" />
                See Public Landing Page
              </Button>
            </Link>
          </motion.div>
        </div>
      </ProposalSection>

      {/* Executive Summary */}
      <ProposalSection id="executive" withAccent data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Executive Summary
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8">
            Why This Exists
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-6 max-w-3xl">
            Most transport businesses don't fail because of lack of work — they get slowed down by admin chaos. Bookings in one place, PODs in another, invoices always catching up. Systems grow organically, not by design.
          </motion.p>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 max-w-3xl">
            This system consolidates bookings, job tracking, PODs, and invoicing into one controlled workflow that mirrors how MENZ already operates.
          </motion.p>

          <motion.h3 variants={itemVariants} className="text-xl font-semibold mb-6">
            What This Delivers
          </motion.h3>
          <BulletList
            items={[
              "Reduced admin workload",
              "Faster, more predictable invoicing",
              "Real-time visibility over jobs and cashflow",
              "One system, one set of numbers, no guesswork",
            ]}
          />
        </div>
      </ProposalSection>

      {/* Current Reality */}
      <ProposalSection id="about" data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Current Reality
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8">
            How Operations Typically Run Today
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-6 max-w-3xl">
            Based on our experience in transport operations, most businesses at this scale face similar pressure points:
          </motion.p>
          <BulletList
            items={[
              "Bookings and schedules finalised under time pressure",
              "Last-minute changes not always reflected everywhere",
              "PODs collected physically or across multiple channels",
              "Invoicing delayed while paperwork is chased and verified",
              "End-of-period invoicing turns into a scramble",
            ]}
          />
          <motion.p variants={itemVariants} className="text-muted-foreground mt-8 max-w-3xl">
            These gaps don't show up as one big failure — they show up as constant friction.
          </motion.p>
        </div>
      </ProposalSection>

      {/* Key Pain Points */}
      <ProposalSection id="pain-points" withAccent data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Key Pain Points
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-12">
            Where Time and Control Are Lost
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div 
              variants={itemVariants} 
              className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
            >
              <p className="text-muted-foreground">
                Manual data entry across spreadsheets and emails
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
            >
              <p className="text-muted-foreground">
                Missing or delayed PODs holding up invoices
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
            >
              <p className="text-muted-foreground">
                Duplicate handling of the same job data
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
            >
              <p className="text-muted-foreground">
                Limited visibility once trucks are on the road
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300 md:col-span-2"
            >
              <p className="text-muted-foreground">
                Admin dependency concentrated on one or two people
              </p>
            </motion.div>
          </div>

          <motion.p 
            variants={itemVariants} 
            className="mt-12 text-muted-foreground max-w-3xl mx-auto text-center"
          >
            None of this is unusual — but it is expensive over time.
          </motion.p>
        </div>
      </ProposalSection>

      {/* Future State Vision */}
      <ProposalSection id="future-state" data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Future State Vision
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8">
            After Implementation
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 max-w-3xl">
            The system introduces a controlled, end-to-end flow:
          </motion.p>

          <BulletList
            items={[
              "Jobs entered once, tracked through completion",
              "PODs captured and stored against the job",
              "Invoices generated directly from completed work",
              "Management visibility without chasing paperwork",
            ]}
          />

          <motion.p variants={itemVariants} className="text-muted-foreground mt-12 max-w-3xl font-medium">
            The goal isn't more software — it's less noise.
          </motion.p>
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-16"
        >
          <motion.img 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src="/before-after-infographic.png" 
            alt="Operational Shift: From Chaos to Control"
            className="w-full rounded-xl shadow-2xl max-w-6xl mx-auto"
          />
          <p className="text-center text-sm text-muted-foreground mt-4 uppercase tracking-wide">
            Operational Shift: From Chaos to Control
          </p>
        </motion.div>
      </ProposalSection>

      {/* System Overview */}
      <ProposalSection id="system-overview" data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4 text-center"
          >
            System Overview
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8 text-center">
            What's Included in the Core MVP
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 max-w-3xl mx-auto text-center">
            One screen showing jobs, status, and performance.
          </motion.p>
        </div>

        {/* Feature Tiles - Single Row (Swapped to be above image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold text-base">Booking & Job Management</h4>
            <p className="text-sm text-muted-foreground">
              Log once. Flow through dispatch to completion.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold text-base">POD Capture & Storage</h4>
            <p className="text-sm text-muted-foreground">
              Digitally captured, tagged, and retrievable.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold text-base">Invoicing Logic</h4>
            <p className="text-sm text-muted-foreground">
              Generated directly from completed jobs.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold text-base">Customer Records</h4>
            <p className="text-sm text-muted-foreground">
              Centralised customer and rate information.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold text-base">Basic Reporting</h4>
            <p className="text-sm text-muted-foreground">
              Clear operational and financial visibility.
            </p>
          </motion.div>
        </div>

        {/* Featured Image - Full Width (Swapped to be below tiles) */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="/system-overview-infographic.png" 
            alt="System Architecture - Core Components and Data Flow"
            className="w-full max-w-6xl mx-auto rounded-xl shadow-2xl"
          />
        </motion.div>
      </ProposalSection>

      {/* Optional & Out-of-Scope */}
      <ProposalSection id="out-of-scope" withAccent data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4 text-center"
          >
            Not Included in MVP
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8 text-center">
            Deliberately Excluded from MVP
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
            To keep rollout controlled and low-risk, the following are excluded from phase one but available later:
          </motion.p>
        </div>

        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <img 
            src="/out-of-scope-infographic.png" 
            alt="Out-of-Scope for MVP - Clear Upgrade Path for Future Phases"
            className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div 
            variants={itemVariants} 
            className="p-6 border border-border rounded-lg"
          >
            <h4 className="text-primary mb-2 font-semibold">GPS tracking</h4>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="p-6 border border-border rounded-lg"
          >
            <h4 className="text-primary mb-2 font-semibold">Cold chain proof & compliance</h4>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="p-6 border border-border rounded-lg"
          >
            <h4 className="text-primary mb-2 font-semibold">Automated allocation</h4>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="p-6 border border-border rounded-lg"
          >
            <h4 className="text-primary mb-2 font-semibold">Driver mobile app</h4>
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="text-muted-foreground mt-12 max-w-3xl mx-auto text-center">
          This keeps the initial system focused on back-office stability and adoption.
        </motion.p>
      </ProposalSection>

      {/* ROI & Leverage */}
      <ProposalSection id="roi" data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4 text-center"
          >
            ROI & Leverage Breakdown
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-12 text-center">
            What You Gain
          </motion.h2>
        </div>

        {/* Featured Image - Full Width */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="/roi-leverage-infographic.png" 
            alt="ROI & Leverage Overview - Measurable Benefits and Time Savings"
            className="w-full max-w-6xl mx-auto rounded-xl shadow-2xl"
          />
        </motion.div>

        {/* Benefit Tiles - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold">Admin Hours Saved</h4>
            <p className="text-sm text-muted-foreground">
              Manual entry reduced. Office time shifts to oversight.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold">Faster Invoicing</h4>
            <p className="text-sm text-muted-foreground">
              Jobs flow straight to billing. Cash hits faster.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold">Reduced Errors</h4>
            <p className="text-sm text-muted-foreground">
              One set of numbers. Fewer mistakes.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
          >
            <h4 className="text-primary mb-3 font-semibold">Management Clarity</h4>
            <p className="text-sm text-muted-foreground">
              Decisions made on facts, not assumptions.
            </p>
          </motion.div>
        </div>
      </ProposalSection>

      {/* Deployment & Implementation Plan */}
      <ProposalSection id="deployment" withAccent data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Deployment & Implementation Plan
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-8">
            Controlled 4-Week Rollout
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 max-w-3xl">
            Week 1: System setup, core configuration, data import.<br/>
            Week 2: Workflow alignment to match MENZ operations.<br/>
            Week 3: Parallel running with existing process.<br/>
            Week 4: Go-live, monitoring, final adjustments.
          </motion.p>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-12 max-w-3xl font-medium">
            No switch is flipped until the system proves itself.
          </motion.p>
        </div>

        {/* Timeline Image - Featured prominently */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="/deployment-timeline-infographic.png" 
            alt="4-Week Rollout Timeline - Structured Implementation with Parallel Running Phase"
            className="w-full rounded-xl shadow-2xl"
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left column */}
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Parallel Running & Safety</h3>
              <p className="text-muted-foreground mb-4 font-medium">How Risk Is Managed</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Old and new systems run side-by-side</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>No risk to jobs, invoices, or cashflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Issues logged and resolved in real time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Figures verified before full cutover</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-4 italic">
                Straightforward, controlled, no cowboy moves.
              </p>
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Go-Live Criteria</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Team trained and confident</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Jobs flowing end-to-end without workarounds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Invoices generating correctly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Green light from management</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </ProposalSection>

      {/* Training & Enablement */}
      <ProposalSection id="training" className="pb-32" data-section>
        <div data-read>
          <motion.p
            variants={itemVariants}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Training & Enablement
          </motion.p>
          <motion.h2 variants={itemVariants} className="mb-6">
            We Train Your Team
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8 max-w-3xl">
            We don't hand over software and disappear.
          </motion.p>

          <BulletList
            items={[
              "Admin training: bookings, PODs, invoicing",
              "Ops training: dispatch and job updates",
              "Management walkthrough: reporting and oversight",
              "Custom guides and short videos",
              "Ongoing support and documentation",
            ]}
          />

          <motion.p variants={itemVariants} className="text-muted-foreground mt-10 max-w-3xl font-medium">
            The system only works if it gets used — training is part of the build.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-20 pt-12 border-t border-border max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl font-semibold mb-6">Next Step</h3>
          <p className="text-lg text-muted-foreground mb-8">
            If this direction makes sense, the next step is a working session to confirm scope, timing, and rollout details.
          </p>
          <p className="text-base text-muted-foreground font-medium">
            No pressure. No lock-in. Just clarity.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <span className="text-foreground font-medium">contact@factoryfreightconnections.com</span>
          </p>
        </motion.div>
      </ProposalSection>
    </div>
  );
};

export default Proposal;

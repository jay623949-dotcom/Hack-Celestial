'use client';

import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Hero from '../components/hero/Hero';
import OperationalStrip from '../components/analytics/OperationalStrip';
import CoreProblem from '../components/operations/CoreProblem';
import ProductExplanation from '../components/operations/ProductExplanation';
import AgentSection from '../components/agents/AgentSection';
import MultiAgentConsensus from '../components/consensus/MultiAgentConsensus';
import LiveIncidentSection from '../components/incidents/LiveIncidentSection';
import HumanControl from '../components/operations/HumanControl';
import LiveExecution from '../components/execution/LiveExecution';
import HowItWorks from '../components/operations/HowItWorks';
import OperationalUseCases from '../components/operations/OperationalUseCases';
import WhyResort360 from '../components/operations/WhyResort360';
import FAQ from '../components/faq/FAQ';
import FinalCTA from '../components/cta/FinalCTA';
import Footer from '../components/footer/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* 01. Sticky Minimal Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 02. Hero with Integrated Real Command Center Mockup */}
        <Hero />

        {/* 03. Trust / Context Operational Capabilities Strip */}
        <OperationalStrip />

        {/* 04. The Core Problem: Departmental Fragmentation */}
        <CoreProblem />

        {/* 05. Product Explanation: Signals to Decision */}
        <ProductExplanation />

        {/* 06. Specialized AI Agents */}
        <AgentSection />

        {/* 07. Multi-Agent Consensus */}
        <MultiAgentConsensus />

        {/* 08. Live Incident Command Center Simulation */}
        <LiveIncidentSection />

        {/* 09. Human Control: AI Recommends. Managers Decide. */}
        <HumanControl />

        {/* 10. Real-Time Execution Timeline */}
        <LiveExecution />

        {/* 11. Six-Stage Operational Pipeline: How It Works */}
        <HowItWorks />

        {/* 12. Real-World Hospitality Use Cases */}
        <OperationalUseCases />

        {/* 13. Four Principles: Why Resort 360 */}
        <WhyResort360 />

        {/* 14. Frequently Asked Questions */}
        <FAQ />

        {/* 15. Final Restrained Call to Action */}
        <FinalCTA />
      </main>

      {/* 16. Enterprise Footer */}
      <Footer />
    </div>
  );
}

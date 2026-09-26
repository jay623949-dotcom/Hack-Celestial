'use client';

import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Hero from '../components/hero/Hero';
import ProblemSection from '../components/sections/ProblemSection';
import ProcessFlow from '../components/sections/ProcessFlow';
import AgentsSection from '../components/sections/AgentsSection';
import CoreScenarioSection from '../components/sections/CoreScenarioSection';
import HumanControlSection from '../components/sections/HumanControlSection';
import ExecutionTimeline from '../components/sections/ExecutionTimeline';
import UseCasesGrid from '../components/sections/UseCasesGrid';
import WhySection from '../components/sections/WhySection';
import CtaSection from '../components/sections/CtaSection';
import Footer from '../components/footer/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* 01. Minimal Sticky Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 02. Hero with Large Whitespace & Subtle Product Visualization */}
        <Hero />

        {/* 03. Section 2: The Real Problem (Four Streams Converging) */}
        <ProblemSection />

        {/* 04. Section 3: What Resort 360 Does (Horizontal 6-Step Flow) */}
        <ProcessFlow />

        {/* 05. Section 4: Multi-Agent Intelligence (Four Perspectives → Consensus) */}
        <AgentsSection />

        {/* 06. Section 5: The Core Product Moment (10:40 AM VIP incident → Move VIP to 505) */}
        <CoreScenarioSection />

        {/* 07. Section 6: Human Control (AI recommends. Managers decide.) */}
        <HumanControlSection />

        {/* 08. Section 7: Real-Time Execution (10:42 to 10:48 Timeline) */}
        <ExecutionTimeline />

        {/* 09. Section 8: Realistic Hospitality Use Cases (Editorial Grid) */}
        <UseCasesGrid />

        {/* 10. Section 9: Why Resort 360 (Four Differentiators) */}
        <WhySection />

        {/* 11. Section 10: Final Large Minimal CTA */}
        <CtaSection />
      </main>

      {/* 12. Minimal Premium Footer */}
      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import OdooHero from '../components/hero/OdooHero';
import CtaSection from '../components/sections/CtaSection';
import ModuleGrid from '../components/grid/ModuleGrid';
import ProblemSection from '../components/sections/ProblemSection';
import ProcessFlow from '../components/sections/ProcessFlow';
import AgentsSection from '../components/sections/AgentsSection';
import CoreScenarioSection from '../components/sections/CoreScenarioSection';
import HumanControlSection from '../components/sections/HumanControlSection';
import ExecutionTimeline from '../components/sections/ExecutionTimeline';
import UseCasesGrid from '../components/sections/UseCasesGrid';
import WhySection from '../components/sections/WhySection';
import FinalCTA from '../components/cta/FinalCTA';
import Footer from '../components/footer/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-odoo-teal/20 selection:text-odoo-teal">
      <main className="flex-1">
        {/* 01. Odoo-Style Hero with SVG Marker Scribble & Typing Animation: "Turn Resort Complexity Into Coordinated Intelligence" */}
        <OdooHero />

        {/* 02. Massive Editorial Section: "Your resort already has the people. The data. The systems. What it needs is one operational picture." */}
        <CtaSection />

        {/* 03. Odoo-Style 6-Column App Icon Module Grid */}
        <ModuleGrid />

        {/* 04. Section 2: The Real Problem */}
        <ProblemSection />

        {/* 05. Section 3: Process Flow */}
        <ProcessFlow />

        {/* 06. Section 4: Multi-Agent Swarm Intelligence */}
        <AgentsSection />

        {/* 07. Section 5: Core Incident Moment */}
        <CoreScenarioSection />

        {/* 08. Section 6: Human Control */}
        <HumanControlSection />

        {/* 09. Section 7: Execution Timeline */}
        <ExecutionTimeline />

        {/* 10. Section 8: Hospitality Use Cases */}
        <UseCasesGrid />

        {/* 11. Section 9: Differentiators */}
        <WhySection />

        {/* 12. Final Closing Call to Action */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

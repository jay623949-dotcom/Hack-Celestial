'use client';

import React from 'react';
import OdooHero from '../components/hero/OdooHero';
import ModuleGrid from '../components/grid/ModuleGrid';
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-odoo-teal/20 selection:text-odoo-teal">
      <main className="flex-1">
        {/* 01. Odoo-Style Hero with SVG Marker Scribble & Typing Animation */}
        <OdooHero />

        {/* 02. Odoo-Style 6-Column App Icon Module Grid */}
        <ModuleGrid />

        {/* 03. Section 2: The Real Problem */}
        <ProblemSection />

        {/* 04. Section 3: Process Flow */}
        <ProcessFlow />

        {/* 05. Section 4: Multi-Agent Swarm Intelligence */}
        <AgentsSection />

        {/* 06. Section 5: Core Incident Moment */}
        <CoreScenarioSection />

        {/* 07. Section 6: Human Control */}
        <HumanControlSection />

        {/* 08. Section 7: Execution Timeline */}
        <ExecutionTimeline />

        {/* 09. Section 8: Hospitality Use Cases */}
        <UseCasesGrid />

        {/* 10. Section 9: Differentiators */}
        <WhySection />

        {/* 11. Section 10: Final CTA */}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}


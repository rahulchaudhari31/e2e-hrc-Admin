import React from 'react';
import { Toaster } from 'react-hot-toast';

import AboutHeroSection from '../components/about/AboutHeroSection';
import WhoWeAreSection from '../components/about/WhoWeAreSection';
import BridgingTheGapSection from '../components/about/BridgingTheGapSection';
import JourneyManagement from '../components/about/JourneyManagement';
import WhyChooseE2ESection from '../components/about/WhyChooseE2ESection';
import MissionVisionSection from '../components/about/MissionVisionSection';
import TestimonialsSection from '../components/about/TestimonialsSection';

export default function AboutUsManagement() {
  return (
    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">About Us Page Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all the content blocks displayed on the About Us page independently.
        </p>
      </div>

      {/* ── Sections (Self-Contained) ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <AboutHeroSection />
        <WhoWeAreSection />
        <BridgingTheGapSection />
        <JourneyManagement />
        <WhyChooseE2ESection />
        <MissionVisionSection />
        <TestimonialsSection />
      </div>
    </div>
  );
}
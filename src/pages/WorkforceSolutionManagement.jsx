import { Toaster } from 'react-hot-toast';
import WorkforceSolutionHero from '../components/WorkforceSolutionManagement/WorkforceSolutionHero';
import OurWorkforceSolutions from '../components/WorkforceSolutionManagement/OurWorkforceSolutions';
import HowWeWorkSectionManager from '../components/WorkforceSolutionManagement/HowWeWorkSectionManager';
import HowWeWorkStepsManager from '../components/WorkforceSolutionManagement/HowWeWorkStepsManager';
import WorkforceSolutionFAQManager from '../components/WorkforceSolutionManagement/WorkforceSolutionFAQManager';
import WorkforceSolutionCTAManager from '../components/WorkforceSolutionManagement/WorkforceSolutionCTAManager';
import TestimonialSectionManager from '../components/WorkforceSolutionManagement/TestimonialSectionManager';
import TestimonialCardsManager from '../components/WorkforceSolutionManagement/TestimonialCardsManager';

export default function WorkforceSolutionManagement() {
  return (
    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workforce Solution Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the workforce solution hero section and its stats cards.
        </p>
      </div>

      <WorkforceSolutionHero />
      <OurWorkforceSolutions />
      
      {/* How We Work Section */}
      <div className="mt-12 relative">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">How We Work</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the section header and steps displayed on the website.</p>
        </div>

        <HowWeWorkSectionManager />
        <HowWeWorkStepsManager />
      </div>

      {/* FAQ and CTA Section */}
      <div className="mt-12 relative">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">FAQ & CTA</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the frequently asked questions and call-to-action displayed on the website.</p>
        </div>

        <WorkforceSolutionFAQManager />
        <div className="mt-8">
          <WorkforceSolutionCTAManager />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-12 relative">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the section header and testimonial cards displayed on the website.</p>
        </div>

        <TestimonialSectionManager />
        <TestimonialCardsManager />
      </div>
    </div>
  );
}

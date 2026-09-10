import EmployerHeroSection from '../components/employer/EmployerHeroSection';
import EmployerHowWeWorkSection from '../components/employer/EmployerHowWeWorkSection';
import EmployerFAQSection from '../components/employer/EmployerFAQSection';
import EmployerCTASection from '../components/employer/EmployerCTASection';
import EmployerTestimonialsAdmin from '../components/employer/EmployerTestimonialsAdmin';

export default function EmployerManagement() {
  return (
    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employer Page Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage employer hero, How We Work, FAQ, CTA, and Testimonials independently.
        </p>
      </div>

      <div className="space-y-6">
        <EmployerHeroSection />
        <EmployerHowWeWorkSection />
        <EmployerFAQSection />
        <EmployerCTASection />
        <EmployerTestimonialsAdmin />
      </div>
    </div>
  );
}

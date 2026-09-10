import { Toaster } from 'react-hot-toast';

import EmployeeHeroSection from '../components/employee/EmployeeHeroSection';
import EmployeeJourneyServicesWrapper from '../components/employee/EmployeeJourneyServicesWrapper';
import EmployeeWhyChooseWrapper from '../components/employee/EmployeeWhyChooseWrapper';
import EmployeeFAQManager from '../components/employee/EmployeeFAQManager';
import EmployeeTestimonialManagement from '../components/employee/testimonials/EmployeeTestimonialManagement';
import EmployeeCTAManager from '../components/employee/EmployeeCTAManager';


export default function EmployeeManagement() {
  return (
    <div className="max-w-6xl mx-auto pb-20 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employee page content dynamically</p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* EmployeeHeroSection is fully self-contained — manages its own state and API calls */}
        <EmployeeHeroSection />

        {/* EmployeeJourneyServicesWrapper is also self-contained */}
        <EmployeeJourneyServicesWrapper />

        {/* EmployeeWhyChooseWrapper is also self-contained */}
        <EmployeeWhyChooseWrapper />

        {/* Employee FAQ Section */}
        <EmployeeFAQManager />

        {/* Employee CTA Section */}
        <EmployeeCTAManager />

         {/* Employee Testimonial Section */}
        <EmployeeTestimonialManagement />
      </div>
    </div>
  );
}

import React from 'react';
import { Toaster } from 'react-hot-toast';

import FooterCompanySection from '../components/footer/FooterCompanySection';
import FooterContactSection from '../components/footer/FooterContactSection';
import FooterNavigationSection from '../components/footer/FooterNavigationSection';
import FooterOfficeLocationSection from '../components/footer/FooterOfficeLocationSection';

export default function FooterPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Footer Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the footer company info, contact details, navigation links, and office locations independently.
        </p>
      </div>

      <div className="space-y-6">
        <FooterCompanySection />
        <FooterContactSection />
        <FooterNavigationSection />
        <FooterOfficeLocationSection />
      </div>
    </div>
  );
}

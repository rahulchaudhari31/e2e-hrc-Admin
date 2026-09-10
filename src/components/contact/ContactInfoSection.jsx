import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ContactInfoSection({ data, onChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const [errors, setErrors] = useState({});

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange('contactInfo', {
      ...data,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
        </div>
        <div className="flex items-center gap-4">
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Card Title <span className="text-red-500">*</span></label>
                <input type="text" name="contactCardTitle" value={data?.contactCardTitle || ''} onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Get In Touch" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input type="text" name="phoneNumber" value={data?.phoneNumber || ''} onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. +1 (555) 123-4567" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="emailAddress" value={data?.emailAddress || ''} onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. info@example.com" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                <textarea name="officeAddress" value={data?.officeAddress || ''} onChange={handleFormChange} rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Primary office address..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Text</label>
                <input type="text" name="supportText" value={data?.supportText || ''} onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. 24/7 Support available" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" checked={data?.isActive ?? true} onChange={handleFormChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                  <span className="text-sm text-gray-600">{(data?.isActive ?? true) ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

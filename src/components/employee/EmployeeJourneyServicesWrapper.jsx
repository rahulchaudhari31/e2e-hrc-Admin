import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmployeeJourneySectionManager from './EmployeeJourneySectionManager';
import EmployeeJourneyCardsManager from './EmployeeJourneyCardsManager';

export default function EmployeeJourneyServicesWrapper() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Employee Journey Services</h2>
        </div>
        <div className="flex items-center gap-4">
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex flex-col">
          <EmployeeJourneySectionManager />
          <EmployeeJourneyCardsManager />
        </div>
      )}
    </div>
  );
}

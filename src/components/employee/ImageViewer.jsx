import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageViewer({ imageUrl, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-700" />
        </button>
        <img
          src={imageUrl}
          alt="Full view"
          className="w-full h-full object-contain max-h-[90vh]"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke=%22%23999%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16M9 20h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z%22/%3E%3C/svg%3E';
          }}
        />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Download, FileText, Calendar, Mail, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import type { ExportFormat } from '@/services/voyage/ItineraryService';

interface ExportMenuProps {
  itineraryId: string;
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: Error) => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ itineraryId, onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { exportItinerary, isExporting } = useItineraryStore();

  const handleExport = async (format: ExportFormat) => {
    try {
      await exportItinerary(itineraryId, format);
      setIsOpen(false);
      onSuccess?.(format);

      // Show success toast
      if (format === 'email') {
        alert('Email sent successfully! Check your inbox.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      onError?.(error as Error);
      alert(`Failed to export as ${format}. Please try again.`);
    }
  };

  const exportOptions = [
    {
      format: 'pdf' as ExportFormat,
      label: 'Export as PDF',
      description: 'Download a printable PDF document',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      format: 'ical' as ExportFormat,
      label: 'Add to Calendar',
      description: 'Download iCal file for your calendar',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      format: 'email' as ExportFormat,
      label: 'Email Summary',
      description: 'Send itinerary to your email',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export</span>
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Export Itinerary</h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose how you'd like to export your itinerary
              </p>
            </div>

            <div className="p-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${option.bgColor}`}
                  >
                    <div className={`p-2 rounded-lg bg-white ${option.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 text-sm">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;

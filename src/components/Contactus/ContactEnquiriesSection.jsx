import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, Download, Loader2, Inbox,MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllContactEnquiries,
  getContactEnquiryById,
  updateContactEnquiryStatus,
  deleteContactEnquiry,
} from '../../services/contactUs/contactEnquiryService';

const EMPTY_FORM = {};

// Map backend I AM values to display text
const iamDisplayMap = {
  employer: 'Employer Looking for Talent',
  job_seeker: 'Job Seeker / Candidate',
  recruitment_partner: 'Recruitment Partner',
  other: 'Other',
};

const getIamDisplayText = (value) => {
  return iamDisplayMap[value] || value || '—';
};

// Map backend status values to display styles
const statusStyles = {
  new: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  read: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  replied: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
};

export default function ContactEnquiriesSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Load enquiries on mount
  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const response = await getAllContactEnquiries();
      const items = Array.isArray(response?.data) ? response.data : [];
      setEnquiries(items);
      
      // Emit event for sidebar green dot notification
      const newCount = items.filter((eq) => eq.status === 'new').length;
      window.dispatchEvent(
        new CustomEvent('contact-enquiries-count-changed', {
          detail: { count: newCount },
        })
      );
      localStorage.setItem('contactEnquiriesNewCount', newCount.toString());
    } catch (err) {
      toast.error(err.message || 'Failed to load contact enquiries');
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open enquiry details modal
  const handleViewEnquiry = async (enquiry) => {
    try {
      const detail = await getContactEnquiryById(enquiry._id);
      const enquiryData = detail?.data || detail;
      setSelectedEnquiry(enquiryData);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to load enquiry details');
    }
  };

  // Update enquiry status
  const handleUpdateStatus = async (enquiryId, newStatus) => {
    if (statusUpdating) return;
    setStatusUpdating(enquiryId);
    try {
      const response = await updateContactEnquiryStatus(enquiryId, newStatus);
      toast.success('Status updated successfully');

      // Update local state
      setEnquiries((prev) => {
        const updated = prev.map((eq) =>
          eq._id === enquiryId
            ? { ...eq, status: newStatus, updatedAt: new Date().toISOString() }
            : eq
        );
        
        // Emit event for sidebar green dot notification
        const newCount = updated.filter((eq) => eq.status === 'new').length;
        window.dispatchEvent(
          new CustomEvent('contact-enquiries-count-changed', {
            detail: { count: newCount },
          })
        );
        localStorage.setItem('contactEnquiriesNewCount', newCount.toString());
        
        return updated;
      });

      // Update selected enquiry if viewing details
      if (selectedEnquiry?._id === enquiryId) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteContactEnquiry(deletingId);
      toast.success('Enquiry deleted successfully');

      // Remove from list
      setEnquiries((prev) => prev.filter((eq) => eq._id !== deletingId));

      // Close modal if viewing deleted enquiry
      if (selectedEnquiry?._id === deletingId) {
        setIsViewModalOpen(false);
        setSelectedEnquiry(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete enquiry');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle file download using fetch + blob
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'attachment';
      
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Contact Enquiries</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
              {enquiries.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-orange-500" />
                <p className="text-sm text-gray-500">Loading enquiries...</p>
              </div>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
                <Inbox size={28} className="text-orange-300" />
              <p className="text-gray-600 font-medium">No contact enquiries yet</p>
              <p className="text-sm text-gray-500 mt-1">
                When users submit the contact form, their enquiries will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">I AM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enquiry) => {
                    const status = enquiry.status || 'new';
                    const statusStyle = statusStyles[status] || statusStyles.new;

                    return (
                      <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {enquiry.firstName} {enquiry.lastName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {enquiry.email}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{getIamDisplayText(enquiry.iam)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 truncate max-w-xs">{enquiry.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={status}
                            onChange={(e) => handleUpdateStatus(enquiry._id, e.target.value)}
                            disabled={statusUpdating === enquiry._id}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer transition-colors ${statusStyle.badge} ${statusStyle.text} disabled:opacity-50`}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{formatDate(enquiry.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewEnquiry(enquiry)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(enquiry._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete enquiry"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Enquiry Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close enquiry details"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">First Name</label>
                  <p className="text-base font-semibold text-gray-900 mt-2 break-words">{selectedEnquiry.firstName || '—'}</p>
                </div>

                {/* Last Name */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Last Name</label>
                  <p className="text-base font-semibold text-gray-900 mt-2 break-words">{selectedEnquiry.lastName || '—'}</p>
                </div>

                {/* Company */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Company</label>
                  <p className="text-base font-semibold text-gray-900 mt-2 break-words">{selectedEnquiry.company || '—'}</p>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col"> 
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Email</label>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-base font-semibold text-blue-600 hover:underline mt-2 break-words"
                  >
                    {selectedEnquiry.email || '—'}
                  </a>
                </div>

                {/* I AM */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">I AM</label>
                  <p className="text-base font-semibold text-gray-900 mt-2 break-words">{getIamDisplayText(selectedEnquiry.iam)}</p>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Status</label>
                  <p className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedEnquiry.status || 'new'].badge} ${statusStyles[selectedEnquiry.status || 'new'].text}`}>
                      {(selectedEnquiry.status || 'new').toUpperCase()}
                    </span>
                  </p>
                </div>

                {/* Subject */}
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Subject</label>
                  <p className="text-base font-semibold text-gray-900 mt-2 break-words">{selectedEnquiry.subject || '—'}</p>
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Message</label>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2 max-h-60 overflow-y-auto">
                    <p className="text-base text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedEnquiry.message || '—'}
                    </p>
                  </div>
                </div>

                {/* Attachment */}
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Attachment</label>
                  {selectedEnquiry.attachment?.url ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                      <div className="text-gray-400">📎</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">{selectedEnquiry.attachment.filename || 'Attachment'}</p>
                        {selectedEnquiry.attachment.size && (
                          <p className="text-xs text-gray-500">
                            {(selectedEnquiry.attachment.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            try {
                              window.open(selectedEnquiry.attachment.url, '_blank', 'noopener,noreferrer');
                            } catch (err) {
                              toast.error('Failed to open file');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={20} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownload(selectedEnquiry.attachment.url, selectedEnquiry.attachment.filename || 'attachment')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-1">No attachment</p>
                  )}
                </div>

                {/* Created Date */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Submitted</label>
                  <p className="text-base font-semibold text-gray-900 mt-2">
                    {formatDate(selectedEnquiry.createdAt)} {formatTime(selectedEnquiry.createdAt)}
                  </p>
                </div>

                {/* Updated Date */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Updated</label>
                  <p className="text-base font-semibold text-gray-900 mt-2">
                    {formatDate(selectedEnquiry.updatedAt)} {formatTime(selectedEnquiry.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleDeleteClick(selectedEnquiry._id)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

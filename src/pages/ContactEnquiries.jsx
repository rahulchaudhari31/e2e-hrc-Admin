import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Eye, Trash2, X, FileText, Download, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import {
  getAllPartnershipEnquiries,
  getPartnershipEnquiryById,
  updatePartnershipEnquiry,
  deletePartnershipEnquiry,
} from '../services/becomePartner/partnershipEnquiryService';
import ContactEnquiriesSection from '../components/Contactus/ContactEnquiriesSection';
import EmployerEnquiries from '../components/home/EmployerEnquiries';
import EmployeeEnquiries from '../components/home/EmployeeEnquiries';
const ITEMS_PER_PAGE = 8;

const emitContactCountUpdate = (count) => {
  localStorage.setItem('partnershipEnquiriesNewCount', String(count));
  window.dispatchEvent(new CustomEvent('partnership-enquiries-count-changed', { detail: { count } }));
};

const normalizeEnquiry = (enquiry) => {
  const fullName = (enquiry?.name || '').trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || '';
  const lastName = nameParts.join(' ') || '';

  return {
    id: enquiry?._id || enquiry?.id,
    firstName,
    lastName,
    company: enquiry?.company || '',
    emailAddress: enquiry?.email || '',
    userType: enquiry?.userType || 'Partner',
    subject: 'Partnership Inquiry',
    message: enquiry?.message || '',
    attachment: enquiry?.attachment || enquiry?.attachment_url || '',
    submittedDate: enquiry?.createdAt
      ? new Date(enquiry.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—',
    status: enquiry?.status || 'new',
    countryCode: enquiry?.countryCode || '',
    contactNumber: enquiry?.contactNumber || '',
    createdAt: enquiry?.createdAt || null,
    updatedAt: enquiry?.updatedAt || null,
    raw: enquiry || {},
  };
};

export default function ContactEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const updateNewEnquiryCount = (items) => {
    const newCount = items.filter((item) => item.status === 'new').length;
    emitContactCountUpdate(newCount);
  };

  const loadEnquiries = async () => {
    setLoading(true);

    try {
      const response = await getAllPartnershipEnquiries();
      const items = Array.isArray(response) ? response.map(normalizeEnquiry) : [];
      setEnquiries(items);
      updateNewEnquiryCount(items);
    } catch (error) {
      console.error('Failed to load enquiries:', error);
      toast.error(error.message || 'Failed to load enquiries. Please try again.');
      setEnquiries([]);
      updateNewEnquiryCount([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filtered = enquiries.filter((eq) => {
    const term = searchQuery.toLowerCase();
    return [
      eq.firstName,
      eq.lastName,
      eq.emailAddress,
      eq.company,
      eq.subject,
      eq.message,
      eq.countryCode,
      eq.contactNumber,
    ]
      .join(' ')
      .toLowerCase()
      .includes(term);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openViewModal = async (enquiry) => {
    try {
      const detail = await getPartnershipEnquiryById(enquiry.id);
      const normalizedDetail = normalizeEnquiry(detail);
      setViewingEnquiry(normalizedDetail);
      setIsViewModalOpen(true);

      if (normalizedDetail.status === 'new') {
        const updated = await updatePartnershipEnquiry(normalizedDetail.id, { status: 'read' });
        const updatedNormalized = normalizeEnquiry(updated);

        setEnquiries((prev) =>
          prev.map((item) => (item.id === updatedNormalized.id ? updatedNormalized : item))
        );
        updateNewEnquiryCount(
          enquiries.map((item) =>
            item.id === updatedNormalized.id ? updatedNormalized : item
          )
        );
        setViewingEnquiry(updatedNormalized);
      }
    } catch (error) {
      console.error('Failed to open enquiry details:', error);
      toast.error(error.message || 'Failed to load enquiry details.');
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const deleteEnquiry = async () => {
    if (deletingId === null) {
      return;
    }

    try {
      await deletePartnershipEnquiry(deletingId);
      const updated = enquiries.filter((eq) => eq.id !== deletingId);
      setEnquiries(updated);
      updateNewEnquiryCount(updated);
      toast.success('Enquiry deleted successfully.');
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      toast.error(error.message || 'Failed to delete enquiry.');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      setCurrentPage(1);
      setIsViewModalOpen(false);
    }
  };

  const getAttachmentUrl = (attachment) => typeof attachment === 'string'
    ? attachment
    : attachment?.url || attachment?.path || '';

  const getAttachmentName = (attachment) => {
    if (typeof attachment === 'object') return attachment.originalName || attachment.filename || 'attachment';
    return attachment?.split('/').pop()?.split('?')[0] || 'attachment';
  };

  const downloadAttachment = async (attachment) => {
    try {
      const response = await fetch(getAttachmentUrl(attachment));
      if (!response.ok) throw new Error('Failed to download file');
      const blobUrl = window.URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getAttachmentName(attachment);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Enquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer enquiries submitted through the website.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">All Enquiries</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{enquiries.length} Total</span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, company, or subject..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center">
              <p className="text-sm text-gray-500">Loading enquiries...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                 <Inbox size={28} className="text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {enquiries.length === 0 ? 'No enquiries yet' : 'No results found'}
              </h3>
              <p className="text-sm text-gray-400">
                {enquiries.length === 0
                  ? 'When users submit the contact form, their enquiries will appear here.'
                  : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium hidden md:table-cell">Email Address</th>
                  <th className="p-4 font-medium hidden xl:table-cell">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{eq.firstName} {eq.lastName}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <a href={`mailto:${eq.emailAddress}`} className="text-sm text-blue-500 hover:underline">{eq.emailAddress}</a>
                    </td>
                    <td className="p-4 hidden xl:table-cell text-sm text-gray-500">{eq.submittedDate}</td>
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => openViewModal(eq)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openDeleteModal(eq.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> enquiries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isViewModalOpen && viewingEnquiry && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Enquiry Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} aria-label="Close enquiry details" className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name</p>
                  <p className="text-base font-semibold text-gray-900 mt-2 wrap-break-word">{viewingEnquiry.firstName} {viewingEnquiry.lastName}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                  <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-600">
                    {viewingEnquiry.status || 'new'}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${viewingEnquiry.emailAddress}`} className="text-base font-semibold text-blue-600 hover:underline mt-2 wrap-break-word inline-block">{viewingEnquiry.emailAddress}</a>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Contact Number</p>
                  <p className="text-base font-semibold text-gray-900 mt-2 wrap-break-word">
                    {viewingEnquiry.countryCode} {viewingEnquiry.contactNumber}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Message</p>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2 max-h-60 overflow-y-auto">
                    <p className="text-base text-gray-700 whitespace-pre-wrap wrap-break-word leading-relaxed">{viewingEnquiry.message || '—'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Submitted</p>
                  <p className="text-base font-semibold text-gray-900 mt-2">{viewingEnquiry.submittedDate}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Updated</p>
                  <p className="text-base font-semibold text-gray-900 mt-2">
                    {viewingEnquiry.updatedAt
                      ? new Date(viewingEnquiry.updatedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Attachment</p>
                  {getAttachmentUrl(viewingEnquiry.attachment) ? (
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <span className="flex-1 min-w-0 truncate text-base font-semibold text-gray-900">{getAttachmentName(viewingEnquiry.attachment)}</span>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => window.open(getAttachmentUrl(viewingEnquiry.attachment), '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"><Eye size={14} /> View</button>
                        <button type="button" onClick={() => downloadAttachment(viewingEnquiry.attachment)} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"><Download size={14} /> Download</button>
                      </div>
                    </div>
                  ) : <p className="mt-2 text-sm italic text-gray-500">No attachment</p>}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-orange-500  rounded-lg hover:bg-orange-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={deleteEnquiry} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto  relative md:mt-15">
      <Toaster position="top-right" />
      {/* Contact Enquiries Section */}
      <ContactEnquiriesSection />
      </div>
       <div className="max-w-6xl mx-auto  relative md:mt-10">
      <Toaster position="top-right" />
      {/* Contact Enquiries Section */}
        <EmployerEnquiries />
      <EmployeeEnquiries />
      </div>
      
    </div>
  );
}






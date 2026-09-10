import React, { useEffect, useState } from "react";
import { Building2, Download, Eye, Inbox, Loader2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteEmployer,
  getAllEmployers,
  getEmployerById,
  updateEmployerStatus,
} from "../../services/home/employerApi";

const statuses = ["new", "contacted", "closed"];
const statusStyles = {
  new: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-green-100 text-green-700",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const getAttachmentUrl = (attachment) =>
  typeof attachment === "string" ? attachment : attachment?.url || attachment?.path || "";

const getAttachmentName = (attachment) => {
  if (typeof attachment === "object") return attachment.originalName || attachment.filename || "attachment";
  return attachment?.split("/").pop()?.split("?")[0] || "attachment";
};

const notifyNewEnquiries = (items) => {
  const count = items.filter((item) => (item.status || "new") === "new").length;
  localStorage.setItem("employerEnquiriesNewCount", String(count));
  window.dispatchEvent(new CustomEvent("employer-enquiries-count-changed", { detail: { count } }));
};

export default function EmployerEnquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const result = await getAllEmployers();
      const nextItems = Array.isArray(result) ? result : [];
      setItems(nextItems);
      notifyNewEnquiries(nextItems);
    } catch (error) {
      toast.error(error.message || "Failed to load employer enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const viewDetails = async (item) => {
    try {
      setSelected(await getEmployerById(item._id));
    } catch (error) {
      toast.error(error.message || "Failed to load employer details");
    }
  };

  const changeStatus = async (id, status) => {
    setStatusUpdating(id);
    try {
      const updated = await updateEmployerStatus(id, status);
      setItems((previous) => {
        const nextItems = previous.map((item) =>
          item._id === id ? { ...item, ...updated, status } : item,
        );
        notifyNewEnquiries(nextItems);
        return nextItems;
      });
      setSelected((previous) =>
        previous?._id === id ? { ...previous, ...updated, status } : previous,
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteEmployer(deletingId);
      setItems((previous) =>
        previous.filter((item) => item._id !== deletingId),
      );
      notifyNewEnquiries(items.filter((item) => item._id !== deletingId));
      if (selected?._id === deletingId) setSelected(null);
      toast.success("Employer enquiry deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete employer enquiry");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadAttachment = async (attachment) => {
    try {
      const response = await fetch(getAttachmentUrl(attachment));
      if (!response.ok) throw new Error("Failed to download attachment");
      const blobUrl = window.URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getAttachmentName(attachment);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(error.message || "Failed to download attachment");
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="flex items-center gap-3 p-5 bg-gray-50 border-b border-gray-200">
        <Building2 size={20} className="text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-800">
          Home Page Employer Enquiries
        </h2>
        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
          {items.length} Total
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col items-center gap-3 p-12">
          <Loader2 size={30} className="animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Loading employer enquiries...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center p-12 text-center">
          <Inbox size={28} className="text-orange-300" />
          <p className="mt-3 font-medium text-gray-600">
            No employer enquiries found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Organization</th>
                <th className="p-4 font-medium hidden md:table-cell">Email</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden lg:table-cell">Date</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {item.organizationName}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <a
                      className="text-sm text-blue-600 hover:underline"
                      href={`mailto:${item.email}`}
                    >
                      {item.email}
                    </a>
                  </td>
                  <td className="p-4">
                    <select
                      value={item.status || "new"}
                      disabled={statusUpdating === item._id}
                      onChange={(event) =>
                        changeStatus(item._id, event.target.value)
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold focus:ring-2 focus:ring-orange-200 ${statusStyles[item.status] || statusStyles.new}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => viewDetails(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingId(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">
                Employer Enquiry Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                ["Name", selected.name],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Organization", selected.organizationName],
                ["Vacancy", selected.vacancy],
                ["Location", selected.location],
                ["Submitted", formatDate(selected.createdAt)],
                ["Updated", formatDate(selected.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-800 break-words">
                    {value || "—"}
                  </p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Message
                </p>
                <p className="mt-2 min-h-24 whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 text-base leading-relaxed text-gray-700">
                  {selected.message || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selected.status] || statusStyles.new}`}
                >
                  {selected.status || "new"}
                </span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Attachment
                  </p>
                  {getAttachmentUrl(selected.attachment) ? <>
                    <p className="mt-2 truncate text-sm font-semibold text-gray-800">{getAttachmentName(selected.attachment)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => window.open(getAttachmentUrl(selected.attachment), "_blank", "noopener,noreferrer")} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"><Eye size={14} /> View</button>
                      <button type="button" onClick={() => downloadAttachment(selected.attachment)} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"><Download size={14} /> Download</button>
                    </div>
                  </> : <p className="mt-2 text-sm text-gray-500">No attachment</p>}
                </div>
            </div>
          </div>
        </div>
      )}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
            <Trash2 size={24} className="mx-auto text-red-500" />
            <h3 className="mt-3 text-lg font-bold text-gray-900">
              Delete enquiry?
            </h3>
            <p className="my-4 text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

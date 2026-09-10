import { useEffect, useState } from "react";
import {
  Home,
  Info,
  Building2,
  FileText,
  MessageSquareText,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  Circle,
  Users,
  LayoutPanelTop,
  BriefcaseBusiness,
  Handshake,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { getAllEmployees } from "../services/home/employeeApi";
import { getAllEmployers } from "../services/home/employerApi";
import { getAllPartnershipEnquiries } from "../services/becomePartner/partnershipEnquiryService";
import { getAllContactEnquiries } from "../services/contactUs/contactEnquiryService";

const sidebarItems = [
  { title: "Home", icon: Home, path: "/admin/home" },
  { title: "About Us", icon: Info, path: "/admin/about-us" },
  { title: "Employer", icon: Building2, path: "/admin/employer" },
  { title: "Employee", icon: Users, path: "/admin/employee" },
  { title: "Workforce Solution", icon: BriefcaseBusiness, path: "/admin/workforce-solution" },
  { title: "Become a Partner", icon: Handshake, path: "/admin/become-partner" },
  {
    title: "Blogs",
    icon: FileText,
    path: "/admin/blogs/management",
    children: [
      { title: "Blog Services", path: "/admin/blogs/services" },
      { title: "Blog Management", path: "/admin/blogs/management" },
    ],
  },
  { title: "Contact Us", icon: MessageSquareText, path: "/admin/contact-us" },
  {
    title: "Contact Enquiries",
    icon: MessageSquareText,
    path: "/admin/contact/enquiries",
  },
  { title: "Footer", icon: LayoutPanelTop, path: "/admin/footer" },
  { title: "SEO Management", icon: LayoutPanelTop, path: "/admin/seo" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [hasNewContactEnquiries, setHasNewContactEnquiries] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('contactEnquiriesNewCount');
    return Number(saved || 0) > 0;
  });
  const [hasNewPartnershipEnquiries, setHasNewPartnershipEnquiries] = useState(() => Number(localStorage.getItem('partnershipEnquiriesNewCount') || 0) > 0);
  const [hasNewEmployerEnquiries, setHasNewEmployerEnquiries] = useState(() => Number(localStorage.getItem('employerEnquiriesNewCount') || 0) > 0);
  const [hasNewEmployeeEnquiries, setHasNewEmployeeEnquiries] = useState(() => Number(localStorage.getItem('employeeEnquiriesNewCount') || 0) > 0);

  useEffect(() => {
    const loadEnquiryNotifications = async () => {
      try {
        const [partnerships, contacts, employers, employees] = await Promise.all([
          getAllPartnershipEnquiries(),
          getAllContactEnquiries(),
          getAllEmployers(),
          getAllEmployees(),
        ]);
        const hasNew = (items) => Array.isArray(items) && items.some((item) => item.status === 'new');
        setHasNewPartnershipEnquiries(hasNew(partnerships));
        setHasNewContactEnquiries(hasNew(contacts));
        setHasNewEmployerEnquiries(employers.some((item) => (item.status || 'new') === 'new'));
        setHasNewEmployeeEnquiries(employees.some((item) => (item.status || 'new') === 'new'));
      } catch (error) {
        console.error('Failed to load enquiry notifications:', error);
      }
    };

    const updateNotification = (event) => {
      const count = Number(event?.detail?.count || 0);
      setHasNewContactEnquiries(count > 0);
    };

    const updatePartnershipNotification = (event) => setHasNewPartnershipEnquiries(Number(event?.detail?.count || 0) > 0);

    const updateEmployerNotification = (event) => setHasNewEmployerEnquiries(Number(event?.detail?.count || 0) > 0);
    const updateEmployeeNotification = (event) => setHasNewEmployeeEnquiries(Number(event?.detail?.count || 0) > 0);

    const handleStorage = () => {
      const count = Number(localStorage.getItem('contactEnquiriesNewCount') || 0);
      setHasNewContactEnquiries(count > 0);
      setHasNewPartnershipEnquiries(Number(localStorage.getItem('partnershipEnquiriesNewCount') || 0) > 0);
      setHasNewEmployerEnquiries(Number(localStorage.getItem('employerEnquiriesNewCount') || 0) > 0);
      setHasNewEmployeeEnquiries(Number(localStorage.getItem('employeeEnquiriesNewCount') || 0) > 0);
    };

    loadEnquiryNotifications();
    window.addEventListener('contact-enquiries-count-changed', updateNotification);
    window.addEventListener('partnership-enquiries-count-changed', updatePartnershipNotification);
    window.addEventListener('employer-enquiries-count-changed', updateEmployerNotification);
    window.addEventListener('employee-enquiries-count-changed', updateEmployeeNotification);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('contact-enquiries-count-changed', updateNotification);
      window.removeEventListener('partnership-enquiries-count-changed', updatePartnershipNotification);
      window.removeEventListener('employer-enquiries-count-changed', updateEmployerNotification);
      window.removeEventListener('employee-enquiries-count-changed', updateEmployeeNotification);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Track which parent menus are expanded
  const [expandedMenus, setExpandedMenus] = useState(() => {
    // Auto-expand if currently on a child route
    const initial = {};
    sidebarItems.forEach((item) => {
      if (item.children) {
        // e.g. path starts with /admin/blogs or /admin/contact
        const basePath = item.path.split("/").slice(0, 3).join("/");
        initial[item.title] = location.pathname.startsWith(basePath);
      }
    });
    return initial;
  });

  const toggleExpand = (title) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* ── Overlay ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          shadow-xl lg:shadow-none
        `}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Brand icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-orange-200 flex-shrink-0">
              e2
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">e2e Hrc</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Close – mobile only */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Section label ──────────────────────────────────────── */}
        <p className="px-5 pt-5 pb-2 text-[10px] font-semibold tracking-widest uppercase text-gray-400">
          Main Menu
        </p>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-none">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const basePath = item.path.split("/").slice(0, 3).join("/");
            const isParentActive = location.pathname.startsWith(basePath);
            const isExpanded = expandedMenus[item.title];

            if (hasChildren) {
              return (
                <div key={item.title}>
                  {/* Parent Item Button */}
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 w-full text-left
                      text-[13.5px] font-medium cursor-pointer
                      border transition-all duration-200
                      ${isParentActive
                        ? "bg-orange-50 border-orange-200 text-orange-600"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-100 hover:text-gray-800"
                      }
                    `}
                  >
                    {/* Active left pip */}
                    {isParentActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-orange-500 to-orange-400 rounded-r-full" />
                    )}

                    {/* Icon wrap */}
                    <span
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                        transition-colors duration-200
                        ${isParentActive
                          ? "bg-orange-100 text-orange-500"
                          : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-400"
                        }
                      `}
                    >
                      <Icon size={16} />
                    </span>

                    {/* Label */}
                    <span className="flex-1 truncate">{item.title}</span>

                    {/* Expand chevron */}
                    <ChevronDown
                      size={14}
                      className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180 text-orange-400" : "text-gray-400"
                        }`}
                    />
                  </button>

                  {/* Children */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="ml-4 pl-4 border-l-2 border-orange-100 mb-1 space-y-0.5">
                      {item.children.map((child) => {
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                              group relative flex items-center gap-2.5 px-3 py-2 rounded-lg
                              text-[13px] font-medium cursor-pointer
                              border transition-all duration-200 no-underline
                              ${isActive
                                ? "bg-orange-50 border-orange-200 text-orange-600"
                                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-100 hover:text-gray-700"
                              }
                            `}
                          >
                            {({ isActive }) => (
                              <>
                                <span className={`
                                  flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0
                                  transition-colors duration-200
                                  ${isActive ? "text-orange-500" : "text-gray-300 group-hover:text-orange-400"}
                                `}>
                                  <Circle size={8} fill={isActive ? "currentColor" : "none"} />
                                </span>
                                <span className="flex-1 truncate">{child.title}</span>
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular item (no children)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                  text-[13.5px] font-medium cursor-pointer
                  border transition-all duration-200 no-underline
                  ${isActive
                    ? "bg-orange-50 border-orange-200 text-orange-600"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-100 hover:text-gray-800"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active left pip */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-orange-500 to-orange-400 rounded-r-full" />
                    )}

                    {/* Icon wrap */}
                    <span
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                        transition-colors duration-200
                        ${isActive
                          ? "bg-orange-100 text-orange-500"
                          : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-400"
                        }
                      `}
                    >
                      <Icon size={16} />
                    </span>

                    {/* Label */}
                    <span className="flex-1 truncate">{item.title}</span>
                    {item.title === "Contact Enquiries" && (hasNewContactEnquiries || hasNewPartnershipEnquiries || hasNewEmployerEnquiries || hasNewEmployeeEnquiries) && (
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm ring-2 ring-white flex-shrink-0" title="New enquiry" />
                    )}

                    {/* Trailing chevron */}
                    <ChevronRight
                      size={13}
                      className={`
                        flex-shrink-0 transition-all duration-200
                        ${isActive
                          ? "opacity-100 text-orange-400"
                          : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-gray-300"
                        }
                      `}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Bottom: logout ──────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 p-3 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-400 text-[13px] font-medium hover:bg-red-100 hover:text-red-500 hover:border-red-200 transition-colors duration-200">
            <LogOut size={16} className="flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

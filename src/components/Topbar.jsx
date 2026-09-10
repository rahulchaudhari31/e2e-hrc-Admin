import { Menu, Search, Bell, ChevronRight, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { logout as apiLogout } from "../services/authService";
import toast from "react-hot-toast";

export default function Topbar({ setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useContext(AuthContext);
  const [loggingOut, setLoggingOut] = useState(false);

  // Helper to get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("home")) return "Home Page";
    if (path.includes("about-us")) return "About Us";
    if (path.includes("contact-enquiry")) return "Contact Enquiry";
    if (path.includes("blogs")) return "Blogs";
    if (path.includes("become-partner")) return "Become a Partner";
    if (path.includes("employer")) return "Employer";
    return "Dashboard";
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
      contextLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local auth state
      contextLogout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-16 bg-white  z-40 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb / Title */}
        <div className="hidden sm:flex items-center text-sm font-medium">
          <span className="text-gray-400">Dashboard</span>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-orange-500">{getPageTitle()}</span>
        </div>
        {/* Mobile Title */}
        <div className="sm:hidden text-lg font-bold text-gray-800 tracking-tight">
          {getPageTitle()}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 lg:gap-5">

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.username || "Admin User"}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "Admin User")}&background=f97316&color=fff`} alt="Admin" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-60"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

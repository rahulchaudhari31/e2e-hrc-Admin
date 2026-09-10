import { useState } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Loginpage from "../pages/LoginPage";
import HomeManagement from "../pages/home";
import AboutUsManagement from "../pages/Aboutus";
import BlogsLayout from "../pages/BlogsLayout";
import BlogServices from "../pages/BlogServices";
import BlogManagement from "../pages/BlogManagement";
import ContactEnquiries from "../pages/ContactEnquiries";
import ContactUs from "../pages/ContactUs";
import EmployerManagement from "../pages/employer";
import EmployeeManagement from "../pages/EmployeeManagement";
import BecomePartnerManagement from "../pages/becomepartner";
import FooterPage from "../pages/Footer";
import WorkforceSolutionManagement from "../pages/WorkforceSolutionManagement";
import SeoStaticManagement from "../pages/SeoStaticManagement";
import Sidebar from "../components/sidebar";
import Topbar from "../components/Topbar";
import ProtectedRoute from "../components/ProtectedRoute";

const AdminLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            <Topbar setIsOpen={setIsOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="lg:ml-72 pt-16 min-h-screen bg-gray-50 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const Approute = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin/home" replace />} />

            <Route path="/login" element={<Loginpage />} />
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomeManagement />} />
                <Route path="dashboard" element={<Navigate to="/admin/home" replace />} />
                <Route path="about-us" element={<AboutUsManagement />} />
                <Route path="employer" element={<EmployerManagement />} />
                <Route path="workforce-solution" element={<WorkforceSolutionManagement />} />
                <Route path="employee" element={<EmployeeManagement />} />
                <Route path="become-partner" element={<BecomePartnerManagement />} />
                <Route path="seo" element={<SeoStaticManagement />} />
                <Route path="footer" element={<FooterPage />} />
                {/* ── Blogs nested routes ─────────────────────────────────── */}
                <Route path="blogs" element={<BlogsLayout />}>
                    <Route index element={<Navigate to="management" replace />} />
                    <Route path="services" element={<BlogServices />} />
                    <Route path="management" element={<BlogManagement />} />
                </Route>

                {/* ── Contact nested routes ───────────────────────────────── */}
                <Route path="contact-us" element={<ContactUs />} />
                <Route path="contact/enquiries" element={<ContactEnquiries />} />
            
            </Route>
        </Routes>
    );
};

export default Approute;
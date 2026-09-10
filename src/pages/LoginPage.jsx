import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as apiLogin, register as apiRegister } from "../services/authService";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "", email: "", password: "", confirm: "",
  });

  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(loginForm.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiLogin(loginForm.email, loginForm.password);

      // Save to context
      contextLogin(response.user, response.token || loginForm.email);

      // Show success toast
      toast.success("Login successful!");

      // Navigate to dashboard
      navigate("/admin/home");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, password, confirm } = registerForm;

    // Validation
    if (!fullName || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiRegister(fullName, email, password, confirm);

      setSuccess("Registration submitted! Please check your email for admin approval.");
      toast.success("Registration successful! Awaiting admin approval.");

      // Clear form
      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        confirm: "",
      });

      // Switch to login tab after 2 seconds
      setTimeout(() => {
        setTab("login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4 py-10 font-sans">

      {/* Top brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <div>
          <p className="text-orange-600 font-extrabold text-lg leading-none tracking-tight">E2E HRC</p>
          <p className="text-orange-400 text-xs font-medium tracking-widest uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-orange-100 overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all ${
                tab === t
                  ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/60"
                  : "text-gray-400 hover:text-orange-400"
              }`}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div className="px-8 py-8">

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <p className="text-gray-800 font-bold text-xl">Welcome back</p>
                <p className="text-gray-400 text-sm mt-0.5">Sign in to your admin account</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-orange-500 text-xs font-bold uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="admin@e2ehrc.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-orange-500 text-xs font-bold uppercase tracking-widest">Password</label>
                  <button type="button" className="text-orange-400 hover:text-orange-500 text-xs font-medium transition">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3M5.25 10.5h13.5a.75.75 0 01.75.75v8.25a.75.75 0 01-.75-.75H5.25a.75.75 0 01-.75-.75V11.25a.75.75 0 01.75-.75z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-orange-400 transition">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 accent-orange-500" />
                <span className="text-gray-500 text-sm group-hover:text-gray-700 transition">Keep me signed in</span>
              </label>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.303-12.376c.866-1.5 3.032-1.5 3.898 0l4.405 7.497zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl py-3.5 text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Authenticating…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>Sign In</>
                )}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Don't have an account?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-orange-500 font-semibold hover:underline">
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <p className="text-gray-800 font-bold text-xl">Create account</p>
                <p className="text-gray-400 text-sm mt-0.5">Request admin access — approval required</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-orange-500 text-xs font-bold uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input type="text" placeholder="John Smith"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-orange-500 text-xs font-bold uppercase tracking-widest mb-1.5">Work Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                  </span>
                  <input type="email" placeholder="you@e2ehrc.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-orange-500 text-xs font-bold uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3M5.25 10.5h13.5a.75.75 0 01.75.75v8.25a.75.75 0 01-.75-.75H5.25a.75.75 0 01-.75-.75V11.25a.75.75 0 01.75-.75z" />
                    </svg>
                  </span>
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-orange-400 transition">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-orange-500 text-xs font-bold uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </span>
                  <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                    value={registerForm.confirm}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-orange-400 transition">
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.303-12.376c.866-1.5 3.032-1.5 3.898 0l4.405 7.497zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-600 text-xs font-medium">{success}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl py-3.5 text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>Request Access</>
                )}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-orange-500 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

        </div>

        {/* Footer strip */}
        <div className="px-8 py-4 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
          <p className="text-gray-400 text-xs">© 2026 E2E HRC. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-orange-400 text-xs font-medium">Secured</span>
          </div>
        </div>

      </div>
    </div>
  );
}

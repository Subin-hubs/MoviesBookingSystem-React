import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from "../config/firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    browserPopupRedirectResolver
} from "firebase/auth";

export default function LoginPage() {
    const navigate = useNavigate();

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // UI/Logic States
    const [showOtp, setShowOtp] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("email");

    // 1. Setup Recaptcha for Phone Login
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => { },
            });
        }
    };

    // 2. Email & Password Logic
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            alert("Invalid email or password. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Phone Login - Send OTP
    const handlePhoneSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            setupRecaptcha();
            const fullPhone = "+977" + phone;
            const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setShowOtp(true);
        } catch (err) {
            alert("Failed to send OTP. Ensure the number is correct.");
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    // 4. Phone Login - Verify OTP
    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            navigate("/");
        } catch (err) {
            alert("Invalid OTP code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 5. Google Login
    const handleGoogle = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, provider, browserPopupRedirectResolver);
            navigate("/");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // UI Components & Classes
    const inputClass = "w-full bg-gray-100 border border-white/10 rounded-xl px-4 py-3 text-black outline-none focus:border-red-600 focus:bg-white transition-all placeholder:text-gray-400";
    const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-red-600";
    const btnPrimary = "w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]";

    const Divider = () => (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Or</span>
            <div className="flex-1 h-px bg-white/10" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
            <div id="recaptcha-container" />

            <div className="w-full max-w-5xl h-[650px] flex overflow-hidden rounded-[32px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.7)]">

                {/* LEFT IMAGE SECTION */}
                <div className="hidden lg:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"
                        alt="Cinema"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-950/60 via-transparent to-black/20" />
                    <div className="absolute bottom-12 left-12">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Cino<span className="text-red-600">Book</span>
                        </h1>
                        <p className="text-white/70 text-sm font-medium tracking-widest uppercase mt-2">
                            The Front Row Awaits
                        </p>
                    </div>
                </div>

                {/* RIGHT FORM SECTION */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-16 bg-white/[0.02] backdrop-blur-md">
                    <div className="max-w-sm mx-auto w-full">

                        <header className="mb-8">
                            <h2 className="text-3xl font-extrabold text-white">Login</h2>
                            <p className="text-gray-400 mt-2 text-sm">Please enter your credentials.</p>
                        </header>

                        {/* TAB SWITCHER */}
                        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                            {["email", "phone"].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => { setActiveTab(tab); setShowOtp(false); }}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                            : "text-gray-500 hover:text-white"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* EMAIL LOGIN FORM */}
                        {activeTab === "email" && (
                            <form className="space-y-5" onSubmit={handleEmailLogin}>
                                <div className="space-y-2">
                                    <label className={labelClass}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                        placeholder="name@email.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="pt-2 space-y-4">
                                    <button type="submit" disabled={loading} className={btnPrimary}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </button>
                                    <Divider />
                                    <button
                                        type="button"
                                        onClick={handleGoogle}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/10 py-3.5 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all"
                                    >
                                        Continue with Google
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PHONE LOGIN FORM */}
                        {activeTab === "phone" && (
                            <div className="space-y-5">
                                {!showOtp ? (
                                    <form onSubmit={handlePhoneSend} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Phone Number</label>
                                            <div className="flex gap-0 rounded-xl overflow-hidden border border-white/10">
                                                <span className="bg-red-600/15 border-r border-white/10 px-4 py-3 text-red-400 font-bold text-sm flex items-center shrink-0">
                                                    +977
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                    className="flex-1 bg-gray-100 px-4 py-3 text-black outline-none"
                                                    placeholder="98XXXXXXXX"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className={btnPrimary}>
                                            {loading ? "Sending..." : "Send OTP"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleOtpVerify} className="space-y-5">
                                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                            <span className="text-gray-300 text-sm font-medium">+977 {phone}</span>
                                            <button
                                                type="button"
                                                onClick={() => { setShowOtp(false); setOtp(""); }}
                                                className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]"
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Verification Code</label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className={inputClass}
                                                placeholder="• • • • • •"
                                                required
                                            />
                                        </div>
                                        <button type="submit" disabled={loading} className={btnPrimary}>
                                            {loading ? "Verifying..." : "Verify & Sign In"}
                                        </button>
                                    </form>
                                )}
                                <Divider />
                                <button
                                    type="button"
                                    onClick={handleGoogle}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/10 py-3.5 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all"
                                >
                                    Continue with Google
                                </button>
                            </div>
                        )}

                        <footer className="mt-8 text-center">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                New here?
                                <Link to="/register" className="ml-2 text-red-500 hover:text-red-400 transition-colors border-b border-red-500/30 hover:border-red-500">
                                    Register
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
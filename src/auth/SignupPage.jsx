import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, db } from "../config/firebase";

import { createUserWithEmailAndPassword, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("email");

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => { },
            });
        }
    };

    const saveUser = async (uid, data) => {
        await setDoc(doc(db, "users", uid), { ...data, createdAt: new Date() });
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await saveUser(user.uid, { fullName, email });
            navigate("/");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            alert(err.message);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { user } = await confirmationResult.confirm(otp);
            await saveUser(user.uid, { fullName, phone: "+977" + phone });
            navigate("/");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const { user } = await signInWithPopup(auth, provider);
            await saveUser(user.uid, { fullName: user.displayName, email: user.email });
            navigate("/");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full bg-gray-100 border border-white/10 rounded-xl px-4 py-3 text-black outline-none focus:border-red-600 focus:bg-gray-50 transition-all placeholder:text-gray-400";
    const labelClass =
        "text-[10px] font-black uppercase tracking-[0.2em] text-red-600";
    const btnPrimary =
        "w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]";
    const Divider = () => (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Or</span>
            <div className="flex-1 h-px bg-white/10" />
        </div>
    );

    const GoogleIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    const GoogleBtn = () => (
        <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="group w-full relative flex items-center justify-center gap-3 bg-white/[0.06] border border-white/[0.12] hover:border-white/25 hover:bg-white/[0.11] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3.5 transition-all duration-300 active:scale-95 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center w-8 h-8 bg-white/[0.08] rounded-lg border border-white/[0.1] group-hover:border-white/20 group-hover:bg-white/[0.12] transition-all duration-300">
                <GoogleIcon />
            </div>
            <div className="relative flex flex-col items-start">
                <span className="text-white/45 text-[8px] font-semibold uppercase tracking-[0.2em] leading-none">Sign up with</span>
                <span className="text-white font-bold text-[11px] uppercase tracking-[0.15em] leading-tight mt-0.5">Google</span>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div id="recaptcha-container" />

            <div className="w-full max-w-5xl h-[700px] flex flex-row-reverse overflow-hidden rounded-[32px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.7)]">

                {/* RIGHT IMAGE */}
                <div className="hidden lg:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop"
                        alt="Cinema Hall"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-950/60 via-transparent to-black/20" />
                    <div className="absolute bottom-12 right-12 text-right">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Cino<span className="text-red-600">Book</span>
                        </h1>
                        <p className="text-white/70 text-sm font-medium tracking-widest uppercase mt-2">
                            Unlock Exclusive Premieres
                        </p>
                    </div>
                </div>

                {/* LEFT FORM */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-16 bg-white/[0.02] backdrop-blur-md">
                    <div className="max-w-sm mx-auto w-full">

                        <header className="mb-8">
                            <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
                            <p className="text-gray-400 mt-2 text-sm">Start your cinematic journey today.</p>
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

                        {/* EMAIL SIGNUP */}
                        {activeTab === "email" && (
                            <form className="space-y-5" onSubmit={handleEmailSignup}>
                                <div className="space-y-2">
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={inputClass}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

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
                                        {loading ? "Creating..." : "Create Account"}
                                    </button>
                                    <Divider />
                                    <GoogleBtn />
                                </div>
                            </form>
                        )}

                        {/* PHONE SIGNUP — enter number */}
                        {activeTab === "phone" && !showOtp && (
                            <form className="space-y-5" onSubmit={handlePhoneSend}>
                                <div className="space-y-2">
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={inputClass}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Phone Number</label>
                                    <div className="flex rounded-xl overflow-hidden border border-white/10">
                                        <span className="bg-red-600/15 border-r border-white/10 px-4 py-3 text-red-400 font-bold text-sm flex items-center shrink-0">
                                            +977
                                        </span>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                            className="flex-1 bg-gray-100 px-4 py-3 text-black outline-none focus:bg-gray-50 transition-all placeholder:text-gray-400"
                                            placeholder="98XXXXXXXX"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-4">
                                    <button type="submit" disabled={loading} className={btnPrimary}>
                                        {loading ? "Sending..." : "Send OTP"}
                                    </button>
                                    <Divider />
                                    <GoogleBtn />
                                </div>
                            </form>
                        )}

                        {/* PHONE SIGNUP — verify OTP */}
                        {activeTab === "phone" && showOtp && (
                            <form className="space-y-5" onSubmit={handleOtpVerify}>
                                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <span className="text-gray-300 text-sm font-medium">+977 {phone}</span>
                                    <button
                                        type="button"
                                        onClick={() => { setShowOtp(false); setConfirmationResult(null); }}
                                        className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-400 transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Verification Code</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className={inputClass}
                                        placeholder="• • • • • •"
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={loading} className={btnPrimary}>
                                    {loading ? "Verifying..." : "Verify & Create Account"}
                                </button>
                            </form>
                        )}

                        <footer className="mt-8 text-center">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                Already a member?
                                <Link to="/login" className="ml-2 text-red-500 hover:text-red-400 transition-colors border-b border-red-500/30 hover:border-red-500">
                                    Login
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
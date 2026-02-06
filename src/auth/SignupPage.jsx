import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, db } from "../config/firebase";

import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    browserPopupRedirectResolver
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SignupPage() {
    const navigate = useNavigate();

    // Form States
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // UI Logic States
    const [showOtp, setShowOtp] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("email");

    // Initialize Recaptcha for Phone Auth
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => { },
            });
        }
    };

    // Database: Save user to Firestore
    const saveUser = async (uid, data) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    ...data,
                    createdAt: new Date(),
                    role: "user" // Default role
                });
            }
        } catch (err) {
            console.error("Firestore Save Error:", err);
        }
    };

    // --- AUTH HANDLERS ---

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

    const handleGoogle = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
            const user = result.user;
            await saveUser(user.uid, {
                fullName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            });
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Google Sign-in failed. Try again.");
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
            alert("Error: " + err.message);
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
            alert("Invalid OTP code.");
        } finally {
            setLoading(false);
        }
    };

    // --- UI HELPERS ---
    const inputClass = "w-full bg-gray-100 border border-white/10 rounded-xl px-4 py-3 text-black outline-none focus:border-red-600 focus:bg-gray-50 transition-all placeholder:text-gray-400";
    const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-red-600";
    const btnPrimary = "w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]";

    const Divider = () => (
        <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Or</span>
            <div className="flex-1 h-px bg-black/10" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
            <div id="recaptcha-container" />

            <div className="w-full max-w-5xl h-[700px] flex flex-row-reverse overflow-hidden rounded-[32px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl">

                {/* RIGHT IMAGE PANEL */}
                <div className="hidden lg:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop"
                        alt="Cinema"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Premiere Access</p>
                        <h2 className="text-4xl font-black text-white leading-tight uppercase italic">Experience Cinema <br /> Like Never Before.</h2>
                    </div>
                </div>

                {/* LEFT FORM PANEL */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 bg-white/5">
                    <div className="max-w-sm mx-auto w-full">
                        <header className="mb-8">
                            <h2 className="text-3xl font-extrabold text-white">Join the Club</h2>
                            <p className="text-gray-400 mt-2 text-sm">Create an account to start booking.</p>
                        </header>

                        {/* TAB SWITCHER */}
                        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                            {["email", "phone"].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => { setActiveTab(tab); setShowOtp(false); }}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-gray-500 hover:text-white"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === "email" ? (
                            <form className="space-y-4" onSubmit={handleEmailSignup}>
                                <div className="space-y-1">
                                    <label className={labelClass}>Full Name</label>
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Alex Reed" required />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Email Address</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="alex@cinema.com" required />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                                </div>
                                <button type="submit" disabled={loading} className={`${btnPrimary} mt-4`}>
                                    {loading ? "Creating..." : "Create Account"}
                                </button>
                                <Divider />
                                <button
                                    type="button"
                                    onClick={handleGoogle}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/10 hover:bg-white/20 rounded-xl py-3.5 transition-all text-white font-bold text-[11px] uppercase tracking-widest"
                                >
                                    Continue with Google
                                </button>
                            </form>
                        ) : (
                            /* PHONE TAB */
                            !showOtp ? (
                                <form className="space-y-4" onSubmit={handlePhoneSend}>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Full Name</label>
                                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Alex Reed" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Phone Number</label>
                                        <div className="flex rounded-xl overflow-hidden border border-white/10">
                                            <span className="bg-white/10 px-4 py-3 text-red-500 font-bold flex items-center shrink-0">+977</span>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="flex-1 bg-gray-100 px-4 py-3 text-black outline-none" placeholder="98XXXXXXXX" required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className={btnPrimary}>Send OTP</button>
                                    <Divider />
                                    <button type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/10 rounded-xl py-3.5 text-white font-bold uppercase text-[11px] tracking-widest">
                                        Google
                                    </button>
                                </form>
                            ) : (
                                <form className="space-y-4" onSubmit={handleOtpVerify}>
                                    <div className="space-y-2 text-center">
                                        <label className={labelClass}>Verification Code</label>
                                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className={`${inputClass} text-center text-xl tracking-[0.5em]`} placeholder="••••••" required />
                                    </div>
                                    <button type="submit" disabled={loading} className={btnPrimary}>Verify & Join</button>
                                    <button type="button" onClick={() => setShowOtp(false)} className="w-full text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 hover:text-white transition-colors">Go Back</button>
                                </form>
                            )
                        )}

                        <footer className="mt-8 text-center">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                Already a member? <Link to="/login" className="text-red-500 hover:underline ml-1">Login</Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
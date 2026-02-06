import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Listen for Auth State Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setInitializing(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Close drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsDrawerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsDrawerOpen(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    if (initializing) {
        return (
            <nav className="sticky top-0 z-[100] w-full px-8 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 h-[73px]">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <span className="text-2xl font-black tracking-tighter text-white/20 uppercase italic">
                        CinoBook
                    </span>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-[100] w-full px-8 py-4 bg-black/90 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* LEFT: Branding */}
                <div className="flex-1">
                    <Link to="/" className="group flex items-center gap-1 w-fit">
                        <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-red-500 transition-colors italic">
                            Cino<span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">Book</span>
                        </span>
                    </Link>
                </div>

                {/* MIDDLE: Links */}
                <div className="hidden md:flex items-center space-x-10">
                    {[
                        { name: "Home", path: "/" },
                        { name: "Movies", path: "/movies" },
                        { name: "Booking", path: "/booking" }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-white ${isActive(item.path)
                                    ? "text-red-500 tracking-[0.3em]"
                                    : "text-gray-400"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* RIGHT: Dynamic Auth Section */}
                <div className="flex-1 flex justify-end relative" ref={drawerRef}>
                    {!user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="px-8 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95"
                            >
                                Login
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* User Profile Trigger */}
                            <button
                                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                                className={`relative w-10 h-10 rounded-full border-2 transition-all active:scale-90 overflow-hidden ${isDrawerOpen ? "border-red-600 scale-110" : "border-white/10 hover:border-red-600/50"
                                    }`}
                            >
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=db2727&color=fff&bold=true`}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            </button>

                            {/* DROPDOWN MENU */}
                            <div className={`absolute top-14 right-0 w-64 bg-[#0d0d12] border border-white/10 rounded-[24px] shadow-2xl transition-all duration-300 transform origin-top-right ${isDrawerOpen
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-95 pointer-events-none'
                                }`}>
                                <div className="p-5">
                                    <div className="pb-4 mb-4 border-b border-white/5">
                                        <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Authenticated</p>
                                        <p className="text-white font-bold text-sm truncate">
                                            {user.displayName || user.email.split('@')[0]}
                                        </p>
                                        <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            onClick={() => { navigate("/booking"); setIsDrawerOpen(false); }}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            My Tickets
                                        </button>
                                        <button
                                            onClick={() => { navigate("/profile"); setIsDrawerOpen(false); }}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            Settings
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full mt-4 flex items-center justify-between px-4 py-3 bg-red-600/10 hover:bg-red-600 rounded-xl text-red-500 hover:text-white transition-all group"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Mocking logged in state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const navigate = useNavigate();

    // Close drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsDrawerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsDrawerOpen(false);
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-[100] w-full px-8 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">

            {/* LEFT: Branding */}
            <div className="flex-1">
                <Link to="/" className="group flex items-center gap-1">
                    <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-red-500 transition-colors">
                        Cino<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Book</span>
                    </span>
                </Link>
            </div>

            {/* MIDDLE: Links */}
            <div className="hidden md:flex items-center space-x-10">
                {["Home", "Movies", "Booking", "Events"].map((item) => (
                    <Link
                        key={item}
                        to={`/${item.toLowerCase()}`}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:tracking-[0.3em] transition-all duration-300"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            {/* RIGHT: Dynamic Auth Section */}
            <div className="flex-1 flex justify-end relative" ref={drawerRef}>
                {!isLoggedIn ? (
                    <Link
                        to="/login"
                        className="relative group overflow-hidden px-8 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all duration-500"
                    >
                        <span className="relative z-10">Login</span>
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                ) : (
                    <div className="flex items-center">
                        {/* PROFILE ICON BUTTON */}
                        <button
                            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                            className="relative w-10 h-10 rounded-full border-2 border-red-600/50 p-0.5 hover:border-red-600 transition-all active:scale-90 overflow-hidden"
                        >
                            <img
                                src="https://ui-avatars.com/api/?name=User&background=db2727&color=fff"
                                className="w-full h-full rounded-full object-cover"
                                alt="Profile"
                            />
                        </button>

                        {/* HIGH-END PROFILE DRAWER (Dropdown style) */}
                        <div className={`absolute top-14 right-0 w-64 bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 transform origin-top-right ${isDrawerOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Premium Member</p>
                                    <p className="text-white font-bold text-sm">Alex Cinema</p>
                                </div>

                                <div className="space-y-1 border-t border-white/5 pt-4">
                                    {["My Tickets", "Watchlist", "Settings"].map((opt) => (
                                        <button key={opt} className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-4 flex items-center justify-between px-4 py-3 bg-red-600/10 hover:bg-red-600 rounded-xl text-red-500 hover:text-white transition-all group"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
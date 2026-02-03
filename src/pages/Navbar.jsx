import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full px-8 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">

            {/* LEFT: Branding with a Glow */}
            <div className="flex-1">
                <Link to="/" className="group flex items-center gap-1">
                    <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-red-500 transition-colors">
                        Cino<span className="text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Book</span>
                    </span>
                </Link>
            </div>

            {/* MIDDLE: Modern Minimalist Links */}
            <div className="hidden md:flex items-center space-x-10">
                {["Home", "Movies", "Booking", "Events"].map((item) => (
                    <Link
                        key={item}
                        to={`/${item.toLowerCase()}`}
                        className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:tracking-[0.3em] transition-all duration-300"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            {/* RIGHT: High-End Button */}
            <div className="flex-1 flex justify-end">
                <Link
                    to="/login"
                    className="relative group overflow-hidden px-8 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all duration-500"
                >
                    <span className="relative z-10">Login</span>
                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
            </div>

        </nav>
    );
}
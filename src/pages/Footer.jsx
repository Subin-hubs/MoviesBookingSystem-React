import React from "react";
import { Link } from "react-router-dom";

const links = {
  Explore: ["Home", "Movies", "Series", "Top Rated", "New Releases"],
  Account: ["My Profile", "Watchlist", "Watch History", "Settings"],
  Support: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d0d12] border-t border-white/5 pt-20 pb-10 px-6 lg:px-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

        {/* Brand Column */}
        <div className="lg:col-span-2">
          <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-white">
            Cino<span className="text-red-600">Book</span>
          </Link>
          <p className="mt-6 text-gray-500 text-sm leading-relaxed max-w-sm">
            Discover, stream, and enjoy the best movies and series from around the world — anytime, anywhere. Experience cinema like never before.
          </p>
          <div className="flex gap-4 mt-8">
            {/* Minimalist Social Icons */}
            {['Twitter', 'Instagram', 'YouTube'].map((social) => (
              <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                <span className="text-[10px] font-bold uppercase tracking-tighter">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Dynamic Link Columns */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <h4 className="text-white font-bold uppercase text-xs tracking-[0.2em] mb-6">{title}</h4>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-red-500 text-sm transition-colors duration-200 block border-l-2 border-transparent hover:pl-2 hover:border-red-600">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
          © 2026 CINOBOOK. All rights reserved.
        </p>
        <div className="flex gap-8 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Components
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import MyBooking from "./pages/MyBooking";
import SeatSelection from "./components/SeatSelection";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function App() {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/booking" element={<MyBooking />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/seats/:showId" element={<SeatSelection />} />

          {/* eSewa Handshake Routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={
            <div className="min-h-screen flex flex-col items-center justify-center">
              <div className="bg-zinc-900 p-10 rounded-3xl border border-red-500/20 text-center">
                <h1 className="text-3xl font-black uppercase text-red-500 mb-4">Payment Failed</h1>
                <p className="text-gray-400 mb-6">The signature verification failed or the user cancelled.</p>
                <button
                  onClick={() => window.location.href = '/movies'}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs"
                >
                  Try Again
                </button>
              </div>
            </div>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
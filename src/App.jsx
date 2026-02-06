import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Components
import SeatSelection from "./components/SeatSelection";

// Pages
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import MyBooking from "./pages/MyBooking";
import Payment from "./pages/Payment"; // Added
import PaymentSuccess from "./pages/PaymentSuccess"; // Added

// Auth
import Login from "./auth/LoginPage";
import Register from "./auth/SignupPage";

export default function App() {
  return (
    <div className="bg-[#050505] min-h-screen">
      <Navbar />
      <main>
        <Routes>
          {/* Main Navigation Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/booking" element={<MyBooking />} />

          {/* Detailed Content Routes */}
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/seats/:showId" element={<SeatSelection />} />

          {/* Payment Routes */}
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
import React from "react";
import { Route, Routes } from "react-router-dom";

// Pages
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import MyBooking from "./pages/MyBooking";

// Auth
import Login from "./auth/LoginPage";
import Register from "./auth/SignupPage";

// Seed Function
import { seedCompleteSystem } from "./seed/SeedData";

export default function App() {
  // Seed Firestore only once
  React.useEffect(() => {
    seedCompleteSystem(); // <-- updated here
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking" element={<MyBooking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </>
  );
}

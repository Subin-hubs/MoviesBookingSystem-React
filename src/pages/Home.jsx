import React, { useState, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../config/firebase"; // Ensure this path matches your firebase config
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMoviesFromFirebase = async () => {
            try {
                // 1. Reference the 'movies' collection
                const moviesRef = collection(db, "movies");

                // 2. Query for the first 6 movies (or filter by status: "now_showing")
                const q = query(moviesRef, limit(6));

                const querySnapshot = await getDocs(q);
                const moviesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setMovies(moviesData);
            } catch (error) {
                console.error("Firebase fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMoviesFromFirebase();
    }, []);

    // Auto-slide logic remains the same
    useEffect(() => {
        if (movies.length > 0) {
            const timer = setInterval(() => {
                handleNext();
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [movies, currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
    };

    if (loading) return (
        <div className="h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black tracking-widest uppercase">
            Loading Firebase Cinema...
        </div>
    );

    return (
        <div className="bg-[#050505] min-h-screen text-white selection:bg-red-600 overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative h-[90vh] w-full overflow-hidden">
                <div
                    className="flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className="min-w-full h-full relative">
                            <img
                                src={movie.backdropUrl || movie.posterUrl} // Use Firebase backdrop field
                                className="w-full h-full object-cover opacity-40"
                                alt={movie.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-32">
                                <h1 className="text-6xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.9]">
                                    {movie.title}
                                </h1>
                                <p className="mt-8 text-gray-400 max-w-xl line-clamp-2 uppercase text-[10px] tracking-[0.3em] leading-loose">
                                    {movie.description}
                                </p>
                                <div className="mt-10 flex flex-wrap gap-5">
                                    <button
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                        className="group relative px-8 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all hover:bg-white hover:text-black"
                                    >
                                        Book Tickets
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-12 right-12 lg:right-32 flex gap-4 z-30">
                    <button onClick={handlePrev} className="p-4 border border-white/10 hover:bg-white hover:text-black transition-all duration-300 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button onClick={handleNext} className="p-4 border border-white/10 hover:bg-red-600 transition-all duration-300 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </section>

            {/* --- POPULAR MOVIES SECTION --- */}
            <section className="py-24 px-12 lg:px-32">
                <div className="flex justify-between items-end mb-16">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                        Cinema <span className="text-red-600">Now</span>
                    </h2>
                </div>

                <div className="flex gap-10 overflow-x-auto no-scrollbar snap-x pb-12">
                    {movies.map((movie, index) => (
                        <div
                            key={`${movie.id}-${index}`}
                            onClick={() => navigate(`/movie/${movie.id}`)}
                            className="min-w-[320px] snap-start group cursor-pointer"
                        >
                            <div className="relative aspect-[2/3] rounded-[40px] overflow-hidden border border-white/5 transition-all duration-700 group-hover:border-red-600">
                                <img
                                    src={movie.posterUrl}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={movie.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                                <div className="absolute bottom-8 left-8 right-8 text-center">
                                    <h3 className="text-white font-black uppercase text-base tracking-widest leading-tight">
                                        {movie.title}
                                    </h3>
                                    <p className="text-red-600 font-bold text-[10px] mt-2 uppercase tracking-widest">
                                        Book Now
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
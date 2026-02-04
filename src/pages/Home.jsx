import React, { useState, useEffect } from "react";
import Footer from "./Footer";

const API_KEY = "80d491707d8cf7b38aa19c7ccab0952f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const HERO_IMG_URL = "https://image.tmdb.org/t/p/original";

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`
                );
                const data = await response.json();
                // We only take the top 6 movies from the API
                setMovies(data.results.slice(0, 6));
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        if (movies.length > 0) {
            const timer = setInterval(() => {
                handleNext();
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [movies, currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === 4 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? 4 : prev - 1));
    };

    if (loading) return (
        <div className="h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black tracking-widest uppercase">
            Loading Cinema...
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
                    {movies.slice(0, 5).map((movie) => (
                        <div key={movie.id} className="min-w-full h-full relative">
                            <img
                                src={`${HERO_IMG_URL}${movie.backdrop_path}`}
                                className="w-full h-full object-cover opacity-40"
                                alt={movie.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-32">
                                <h1 className="text-6xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.9]">
                                    {movie.title}
                                </h1>
                                <p className="mt-8 text-gray-400 max-w-xl line-clamp-2 uppercase text-[10px] tracking-[0.3em] leading-loose">
                                    {movie.overview}
                                </p>
                                <div className="mt-10 flex flex-wrap gap-5">
                                    <button className="group relative px-8 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all hover:bg-white hover:text-black">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                        Watch Trailer
                                    </button>
                                    <button className="px-8 py-4 border border-white/20 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all hover:bg-white/10 hover:border-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        See Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-12 right-12 lg:right-32 flex gap-4 z-30">
                    <button onClick={handlePrev} className="p-4 border border-white/10 hover:bg-white hover:text-black transition-all duration-300 rounded-full group">
                        <svg className="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button onClick={handleNext} className="p-4 border border-white/10 hover:bg-red-600 hover:border-red-600 transition-all duration-300 rounded-full group">
                        <svg className="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </section>

            {/* --- POPULAR MOVIES SECTION (Repeated 6 items) --- */}
            <section className="py-24 px-12 lg:px-32">
                <div className="flex justify-between items-end mb-16">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                        Popular <span className="text-red-600">Now</span>
                    </h2>
                    <div className="h-[1px] flex-grow mx-8 bg-white/10 mb-3 hidden md:block" />
                    <span className="text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase">Infinite Loop</span>
                </div>

                <div className="flex gap-10 overflow-x-auto no-scrollbar snap-x pb-12">
                    {/* We repeat the 6 movies 3 times to create a "repeating" effect in the scrollbar */}
                    {[...movies, ...movies, ...movies].map((movie, index) => (
                        <div key={`${movie.id}-${index}`} className="min-w-[320px] snap-start group cursor-pointer">
                            <div className="relative aspect-[2/3] rounded-[40px] overflow-hidden border border-white/5 transition-all duration-700 group-hover:border-red-600/40 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                                <img
                                    src={`${IMG_URL}${movie.poster_path}`}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={movie.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-white font-black uppercase text-base tracking-widest leading-tight mb-2">
                                        {movie.title}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">TMDB Rank</span>
                                        <span className="text-red-600 font-black text-xs">#{Math.round(movie.popularity)}</span>
                                    </div>
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
import React, { useState, useEffect } from "react";
import Footer from "./Footer"; // Assuming Footer is in a separate file

const API_KEY = "80d491707d8cf7b38aa19c7ccab0952f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500"; // Optimized size for posters
const HERO_IMG_URL = "https://image.tmdb.org/t/p/original"; // High res for hero

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // WISE FETCHING: This only runs ONCE when the component mounts
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`
                );
                const data = await response.json();
                setMovies(data.results);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []); // Empty array means: fetch once, then stop.

    // Hero Slider logic
    useEffect(() => {
        if (movies.length > 0) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev === 4 ? 0 : prev + 1)); // Cycles top 5
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [movies]);

    if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black tracking-widest">LOADING CINEMA...</div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white selection:bg-red-600">

            {/* --- HERO SECTION (Real Data) --- */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                {movies.slice(0, 5).map((movie, i) => (
                    <div key={movie.id} className={`absolute inset-0 transition-all duration-1000 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                        <img
                            src={`${HERO_IMG_URL}${movie.backdrop_path}`}
                            className="w-full h-full object-cover opacity-50"
                            alt={movie.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-32">
                            <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none">
                                {movie.title}
                            </h1>
                            <p className="mt-6 text-gray-400 max-w-xl line-clamp-2 uppercase text-xs tracking-widest leading-loose">
                                {movie.overview}
                            </p>
                        </div>
                    </div>
                ))}
            </section>

            {/* --- POPULAR MOVIES SECTION --- */}
            <section className="py-20 px-12">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-12">
                    Popular <span className="text-red-600">Now</span>
                </h2>

                {/* Horizontal Scroll Area */}
                <div className="flex gap-8 overflow-x-auto no-scrollbar snap-x pb-12">
                    {movies.map((movie) => (
                        <div key={movie.id} className="min-w-[300px] snap-start group">
                            <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-red-600/50 group-hover:scale-[1.02]">
                                <img
                                    src={`${IMG_URL}${movie.poster_path}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={movie.title}
                                />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-white font-black uppercase text-sm tracking-widest truncate">
                                        {movie.title}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Popularity
                                        </span>
                                        <span className="text-red-600 font-black text-xs">
                                            {Math.round(movie.popularity)}
                                        </span>
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
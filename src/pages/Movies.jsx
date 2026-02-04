import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import MovieCard from '../components/MovieCard';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('now_showing');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "movies"));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMovies(data);
            } catch (error) {
                console.error("Error fetching:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // Filter logic - ensures strings match exactly
    const filteredMovies = movies.filter(m => m.status === activeTab);

    if (loading) return <div className="text-white p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-7xl">

                {/* Navigation Tabs */}
                <div className="mb-12 flex items-center justify-between">
                    <h1 className="text-3xl font-bold uppercase tracking-widest">
                        {activeTab === 'now_showing' ? '🔥 Now Showing' : '⏳ Coming Soon'}
                    </h1>

                    <div className="flex space-x-2 rounded-xl bg-gray-900 p-1 border border-gray-800">
                        <button
                            onClick={() => {
                                console.log("Switching to Now Showing");
                                setActiveTab('now_showing');
                            }}
                            className={`rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeTab === 'now_showing' ? 'bg-red-600 text-white' : 'text-gray-400'
                                }`}
                        >
                            Now Showing
                        </button>
                        <button
                            onClick={() => {
                                console.log("Switching to Coming Soon");
                                setActiveTab('coming_soon');
                            }}
                            className={`rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeTab === 'coming_soon' ? 'bg-red-600 text-white' : 'text-gray-400'
                                }`}
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Movie Grid */}
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                    {filteredMovies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>

                {/* Empty State Check */}
                {filteredMovies.length === 0 && (
                    <p className="text-center text-gray-500 mt-20">No movies found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default Movies;
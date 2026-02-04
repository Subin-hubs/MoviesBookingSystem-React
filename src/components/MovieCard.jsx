import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();
    const isComingSoon = movie.status === 'coming_soon';

    const handleCardClick = () => {
        if (!isComingSoon) {
            // Navigate to the detail page using the Firestore Document ID (slug)
            navigate(`/movie/${movie.id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative flex flex-col transition-all duration-300 ${isComingSoon ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-2'
                }`}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay showing only on hover */}
                {!isComingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase shadow-lg">
                            View Details
                        </button>
                    </div>
                )}

                {isComingSoon && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                        COMING SOON
                    </div>
                )}
            </div>

            <div className="mt-3">
                <h3 className="font-bold text-gray-100 truncate">{movie.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{movie.genres?.join(' • ')}</p>
            </div>
        </div>
    );
};

export default MovieCard;
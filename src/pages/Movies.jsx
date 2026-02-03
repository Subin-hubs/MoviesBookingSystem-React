import React from "react";
import { Link } from "react-router-dom";

const dummyMovies = [
    { id: 1, title: "Avengers: Endgame" },
    { id: 2, title: "Inception" },
    { id: 3, title: "Interstellar" },
];

export default function Movies() {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Movies</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dummyMovies.map((movie) => (
                    <div
                        key={movie.id}
                        className="bg-white p-4 rounded shadow hover:shadow-lg transition"
                    >
                        <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                        <Link
                            to={`/movies/${movie.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

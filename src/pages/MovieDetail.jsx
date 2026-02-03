import React from "react";
import { useParams } from "react-router-dom";

const dummyMovies = [
  { id: 1, title: "Avengers: Endgame", description: "Superheroes save the world." },
  { id: 2, title: "Inception", description: "A mind-bending thriller by Nolan." },
  { id: 3, title: "Interstellar", description: "Epic space adventure exploring love and time." },
];

export default function MovieDetail() {
  const { id } = useParams();
  const movie = dummyMovies.find((m) => m.id === parseInt(id));

  if (!movie) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Movie not found</h1>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      <p className="text-gray-700 mb-6">{movie.description}</p>
      <p className="text-gray-500">Movie ID: {movie.id}</p>
    </div>
  );
}

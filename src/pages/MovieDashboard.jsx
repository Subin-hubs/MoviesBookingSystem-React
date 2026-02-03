import React from "react";

const MOVIES = [
  { id: 1, title: "Interstellar", rating: "9.8", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094" },
  { id: 2, title: "Inception", rating: "8.8", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056" },
  { id: 3, title: "The Dark Knight", rating: "9.0", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070" },
  { id: 4, title: "Blade Runner 2049", rating: "8.5", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070" },
];

export default function MovieDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">

      {/* 1. HERO SECTION: The Featured Movie */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=2070"
          className="w-full h-full object-cover opacity-60"
          alt="Featured"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20"></div>

        <div className="absolute bottom-20 left-12 max-w-2xl space-y-6">
          <span className="bg-red-600 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-sm">Featured</span>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
            Avatar: <span className="text-red-600">Way of Water</span>
          </h1>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <span>2024</span>
            <span>Sci-Fi / Action</span>
            <span className="text-white border border-white/20 px-2 py-1 text-[10px]">IMAX 3D</span>
          </div>
          <button className="bg-white text-black font-black px-10 py-4 rounded-full uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95">
            Book My Seats
          </button>
        </div>
      </div>

      {/* 2. CATEGORY FILTERS */}
      <div className="px-12 -mt-8 relative z-10 flex gap-4 overflow-x-auto no-scrollbar">
        {["All Movies", "Action", "Horror", "Comedy", "Sci-Fi", "Drama"].map((cat, i) => (
          <button
            key={cat}
            className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${i === 0 ? "bg-red-600 border-red-600" : "bg-black/40 backdrop-blur-xl border-white/10 hover:border-red-600"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. MOVIE GRID */}
      <div className="px-12 mt-16">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Now <span className="text-red-600">Showing</span></h3>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-red-600/30 pb-1 hover:text-red-500 cursor-pointer transition-colors">View All</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOVIES.map((movie) => (
            <div key={movie.id} className="group relative cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-red-600/50">
                <img
                  src={movie.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  alt={movie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {/* Hover Rating Overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-yellow-500 text-xs font-bold">★ {movie.rating}</span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">{movie.title}</h4>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>English • 4K</span>
                  <span className="text-red-600">Booking Open</span>
                </div>
              </div>

              {/* Red Glow under the card on hover */}
              <div className="absolute -inset-2 bg-red-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [showtimes, setShowtimes] = useState([]); // State for showtimes
  const [loading, setLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState("");

  // 1. Fetch Movie and Theaters
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const movieSnap = await getDoc(doc(db, "movies", id));
        if (movieSnap.exists()) {
          const data = movieSnap.data();
          setMovie(data);
          setVideoSrc(`https://www.youtube.com/embed/${data.trailerId}?mute=1`);
          setTimeout(() => {
            setVideoSrc(`https://www.youtube.com/embed/${data.trailerId}?autoplay=1&mute=1`);
          }, 3000);
        }

        const showsQuery = query(collection(db, "shows"), where("movieId", "==", id));
        const showsSnap = await getDocs(showsQuery);
        const uniqueTheaters = {};
        showsSnap.docs.forEach(doc => {
          const data = doc.data();
          uniqueTheaters[data.theaterId] = { id: data.theaterId, name: data.theaterName, location: data.location };
        });
        setTheaters(Object.values(uniqueTheaters));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  // 2. Fetch Showtimes when Theater changes
  useEffect(() => {
    const fetchTimes = async () => {
      if (!selectedTheater) {
        setShowtimes([]);
        return;
      }
      const q = query(
        collection(db, "shows"),
        where("movieId", "==", id),
        where("theaterId", "==", selectedTheater)
      );
      const snap = await getDocs(q);
      setShowtimes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTimes();
  }, [selectedTheater, id]);

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Hero Header */}
      <div className="relative h-[35vh] w-full">
        <img src={movie?.posterUrl} className="w-full h-full object-cover opacity-20 blur-md" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute bottom-10 left-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter">{movie?.title}</h1>
          <p className="text-red-500 font-bold mt-2">{movie?.genres?.join(" / ")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 -mt-10">
        {/* LEFT: Trailer */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black">
            <iframe width="100%" height="100%" src={videoSrc} frameBorder="0" allowFullScreen></iframe>
          </div>
          <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-400">About</h2>
            <p className="text-gray-300 leading-relaxed">{movie?.description}</p>
          </div>
        </div>

        {/* RIGHT: Booking UI */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-full"></span>
                1. Select Theater
              </h3>
              <select
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Choose a cinema...</option>
                {theaters.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* SHOWTIMES LIST (Appears only after theater is selected) */}
            {selectedTheater && (
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-red-600 rounded-full"></span>
                  2. Available Time
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {showtimes.length > 0 ? (
                    showtimes.map((show) => (
                      <button
                        key={show.id}
                        onClick={() => navigate(`/seats/${show.id}`)}
                        className="bg-gray-800 hover:bg-red-600 border border-gray-700 p-3 rounded-lg text-center transition-all group"
                      >
                        <p className="text-xs text-gray-400 group-hover:text-white mb-1">{show.date}</p>
                        <p className="text-lg font-black">{show.time}</p>
                      </button>
                    ))
                  ) : (
                    <p className="col-span-2 text-sm text-gray-500 italic">Loading times...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
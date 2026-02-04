import { db } from "../config/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";

// 1. DATA DEFINITIONS
const THEATERS = [
    { id: "th_qfx_durbar", name: "QFX Cinemas", location: "Durbar Marg, Kathmandu", capacity: 40 },
    { id: "th_big_movies", name: "Big Movies", location: "City Center, Kamalpokhari", capacity: 32 },
    { id: "th_fcube", name: "Fcube Cinemas", location: "KL Tower, Chabahil", capacity: 40 },
    { id: "th_one_cinemas", name: "One Cinemas", location: "Eyeplex Mall, Baneshwor", capacity: 24 }
];

const GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 18: "Drama",
    14: "Fantasy", 10751: "Family", 878: "Sci-Fi", 10749: "Romance", 80: "Crime", 53: "Thriller"
};

const MOVIES = [
    // --- NOW SHOWING (20 TITLES) ---
    {
        title: "The Wrecking Crew",
        description: "A high-stakes action thriller following an elite group of mercenaries on a mission that goes sideways.",
        poster_path: "/m8G07mF5b7txK5oTPRuJj6UxlKp.jpg",
        genre_ids: [28, 12],
        status: "now_showing",
        trailerId: "d6P_O02iE7k"
    },
    {
        title: "Zootopia 2",
        description: "Judy Hopps and Nick Wilde return to solve a new case that shakes the foundations of Zootopia.",
        poster_path: "/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
        genre_ids: [16, 35, 10751],
        status: "now_showing",
        trailerId: "h4UuA7z9XIs"
    },
    {
        title: "Avatar: Fire and Ash",
        description: "Jake Sully and Neytiri face a new threat from a volcanic clan of Na'vi on the moon of Pandora.",
        poster_path: "/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg",
        genre_ids: [28, 12, 14],
        status: "now_showing",
        trailerId: "Yf6I_P0VAn4"
    },
    {
        title: "Avengers: Endgame",
        description: "The epic conclusion to the Infinity Saga as the remaining Avengers attempt to undo Thanos' snap.",
        poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        genre_ids: [28, 12, 878],
        status: "now_showing",
        trailerId: "TcMBFSGVi1c"
    },
    {
        title: "Titanic",
        description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
        poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        genre_ids: [18, 10749],
        status: "now_showing",
        trailerId: "kVrqfYjk39I"
    },
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        genre_ids: [28, 878, 12],
        status: "now_showing",
        trailerId: "YoHD9XEInc0"
    },
    {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        genre_ids: [12, 18, 878],
        status: "now_showing",
        trailerId: "zSWdZVtXT7E"
    },
    {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        genre_ids: [28, 80, 18],
        status: "now_showing",
        trailerId: "EXeTwQWrcwY"
    },
    {
        title: "LOTR: Fellowship",
        description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring.",
        poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
        genre_ids: [12, 14],
        status: "now_showing",
        trailerId: "V75dMMIW2B4"
    },
    {
        title: "LOTR: Two Towers",
        description: "While Frodo and Sam edge closer to Mordor, the scattered fellowship makes new allies to face Saruman's army.",
        poster_path: "/rrGlNlzFTrXFNGXsD7NNlxq4BPb.jpg",
        genre_ids: [12, 14],
        status: "now_showing",
        trailerId: "LbfMDwc4azU"
    },
    {
        title: "LOTR: Return of the King",
        description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam.",
        poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        genre_ids: [12, 14],
        status: "now_showing",
        trailerId: "r5X-hFf6Bwo"
    },
    {
        title: "The Hobbit: Unexpected",
        description: "A reluctant Hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves.",
        poster_path: "/6t6NUhR8jU2iqTn3tfD5fRwlU7z.jpg",
        genre_ids: [12, 14],
        status: "now_showing",
        trailerId: "JTSoD4BBCJc"
    },
    {
        title: "Guardians of the Galaxy",
        description: "A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.",
        poster_path: "/y31QB9kn3XSudA15tV7UWQ9XLuW.jpg",
        genre_ids: [28, 12, 878],
        status: "now_showing",
        trailerId: "d96cjJhvlMA"
    },
    {
        title: "Black Panther",
        description: "T'Challa, heir to the hidden kingdom of Wakanda, must step forward to lead his people into a new era.",
        poster_path: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
        genre_ids: [28, 12, 14],
        status: "now_showing",
        trailerId: "xjDjIu31fzU"
    },
    {
        title: "Doctor Strange",
        description: "While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.",
        poster_path: "/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
        genre_ids: [28, 12, 14],
        status: "now_showing",
        trailerId: "HSzx-zryEgM"
    },
    {
        title: "Thor: Ragnarok",
        description: "Imprisoned on the planet Sakaar, Thor must race against time to return to Asgard and stop Hela.",
        poster_path: "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
        genre_ids: [28, 12, 14],
        status: "now_showing",
        trailerId: "ue80MBNX3bs"
    },
    {
        title: "Iron Man",
        description: "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor.",
        poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
        genre_ids: [28, 12, 878],
        status: "now_showing",
        trailerId: "8hYlB38asgn"
    },
    {
        title: "Spider-Man: No Way Home",
        description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help, leading to dangerous consequences.",
        poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        genre_ids: [28, 12, 878],
        status: "now_showing",
        trailerId: "JfVOs4VSpmA"
    },
    {
        title: "Joker",
        description: "A failed clown and aspiring stand-up comedian is driven insane and becomes the psychopathic criminal mastermind.",
        poster_path: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
        genre_ids: [18, 80, 53],
        status: "now_showing",
        trailerId: "t433PEQGErc"
    },
    {
        title: "Deadpool",
        description: "A wisecracking mercenary gets experimented on and becomes immortal yet hideously scarred, seeking revenge.",
        poster_path: "/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg",
        genre_ids: [28, 35, 12],
        status: "now_showing",
        trailerId: "ONHBaC-HUsk"
    },

    // --- COMING SOON (10 TITLES) ---
    {
        title: "Beyond Spider-Verse",
        description: "The final chapter of Miles Morales' journey through the multiverse as he faces his greatest threat yet.",
        poster_path: "/8IB9996I7I9Lp8SpmfIpxCqO9I.jpg",
        genre_ids: [16, 28, 12],
        status: "coming_soon",
        trailerId: "uS6mXj_99E4"
    },
    {
        title: "Superman: Legacy",
        description: "A new beginning for the Man of Steel as he attempts to reconcile his Kryptonian heritage with his human upbringing.",
        poster_path: "/7mO6mY5vWp1S98oU3CIdJmC3w.jpg",
        genre_ids: [28, 12, 878],
        status: "coming_soon",
        trailerId: "ZfKIDY4K-l0"
    },
    {
        title: "Fantastic Four",
        description: "Marvel's First Family enters the Marvel Cinematic Universe in this highly anticipated reboot.",
        poster_path: "/p795X2xS6qUUpW7H2N0x6E0O9.jpg",
        genre_ids: [28, 12, 878],
        status: "coming_soon",
        trailerId: "u6pS8P_N-90"
    },
    {
        title: "The Batman Part II",
        description: "Bruce Wayne continues his crusade as the Dark Knight while a new shadow falls over Gotham City.",
        poster_path: "/vY2yYfRkU2sWp6I3G2r1m6fE.jpg",
        genre_ids: [28, 80, 18],
        status: "coming_soon",
        trailerId: "Hj9pRS8E-9w"
    },
    {
        title: "Toy Story 5",
        description: "Woody, Buzz, and the gang return for another adventure where they must face the challenges of the digital age.",
        poster_path: "/uXDfjS6IcMvS3o2pE3Xl9F0.jpg",
        genre_ids: [16, 35, 10751],
        status: "coming_soon",
        trailerId: "uS6mXj_99E4"
    },
    {
        title: "Avengers: Secret Wars",
        description: "The culmination of the Multiverse Saga where heroes from every reality must unite to save existence.",
        poster_path: "/7WsyChT9SmsSjsuI6H8995pS.jpg",
        genre_ids: [28, 12, 878],
        status: "coming_soon",
        trailerId: "TcMBFSGVi1c"
    },
    {
        title: "Moana 2",
        description: "Moana receives an unexpected call from her wayfinding ancestors and journeys to the far seas of Oceania.",
        poster_path: "/m0S69vKq68N6L2J4V8v1M.jpg",
        genre_ids: [16, 12, 35],
        status: "coming_soon",
        trailerId: "hDZ7y8RP5HE"
    },
    {
        title: "Mufasa",
        description: "An origin story exploring the rise of one of the greatest kings of the Pride Lands.",
        poster_path: "/jb98SpmfIpxCqO9I8IB.jpg",
        genre_ids: [16, 12, 18],
        status: "coming_soon",
        trailerId: "o17MF9Wgg3E"
    },
    {
        title: "Blade",
        description: "The Daywalker returns to the MCU to hunt down the vampires that threaten humanity.",
        poster_path: "/vY2yYfRkU2sWp6I3G2r1m6fE.jpg",
        genre_ids: [28, 53, 14],
        status: "coming_soon",
        trailerId: "uS6mXj_99E4"
    },
    {
        title: "Jurassic World Rebirth",
        description: "Five years after the events of Dominion, a new team races to secure DNA samples from the world's largest dinosaurs.",
        poster_path: "/p795X2xS6qUUpW7H2N0x6E0O9.jpg",
        genre_ids: [28, 12, 878],
        status: "coming_soon",
        trailerId: "FidS6R-r_5Q"
    }
];

const SHOWTIMES = ["11:00 AM", "2:30 PM", "6:00 PM", "9:15 PM"];

// --- Helper Functions ---
function generateShowSeats(capacity) {
    const seats = {};
    const rows = "ABCDEFGHIJ".split("");
    const cols = 8;
    for (let r = 0; r < Math.ceil(capacity / cols); r++) {
        for (let c = 1; c <= cols; c++) {
            const seatId = `${rows[r]}${c}`;
            seats[seatId] = { id: seatId, row: rows[r], number: c, isBooked: false, price: r < 2 ? 500 : 350 };
        }
    }
    return seats;
}

const createSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "-");

// --- Main Seed Function ---
export async function seedCompleteSystem() {
    console.log("🚀 Starting Production Seed...");
    const allOps = [];

    // 1. Seed Theaters
    THEATERS.forEach(t => allOps.push({ ref: doc(db, "theaters", t.id), data: t }));

    // 2. Seed Movies
    for (const movie of MOVIES) {
        const movieId = createSlug(movie.title);
        const movieRef = doc(db, "movies", movieId);
        const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750";

        allOps.push({
            ref: movieRef,
            data: {
                title: movie.title,
                description: movie.description,
                posterUrl,
                genres: movie.genre_ids.map(id => GENRE_MAP[id] || "Other"),
                status: movie.status,
                trailerId: movie.trailerId,   // <-- ADD THIS LINE
                createdAt: new Date().toISOString()
            }
        });

        // 3. Only create Shows for "Now Showing" movies
        if (movie.status === "now_showing") {
            THEATERS.forEach(theater => {
                SHOWTIMES.forEach(time => {
                    const showId = `${movieId}_${theater.id}_${time.replace(/[: ]/g, "")}`;
                    allOps.push({
                        ref: doc(db, "shows", showId),
                        data: {
                            movieId: movieId,
                            movieTitle: movie.title,
                            theaterId: theater.id,
                            theaterName: theater.name,
                            location: theater.location,
                            time,
                            date: "2026-02-10",
                            seats: generateShowSeats(theater.capacity)
                        }
                    });
                });
            });
        }
    }

    // 4. Batch Execution
    console.log(`📦 Processing ${allOps.length} operations...`);
    try {
        for (let i = 0; i < allOps.length; i += 500) {
            const batch = writeBatch(db);
            allOps.slice(i, i + 500).forEach(op => batch.set(op.ref, op.data, { merge: true }));
            await batch.commit();
        }
        console.log("✨ SEEDING SUCCESSFUL: Check your Firebase Console!");
    } catch (e) { console.error("❌ Seed Error:", e); }
}
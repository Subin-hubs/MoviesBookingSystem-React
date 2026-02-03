// Import Firebase core
import { initializeApp } from "firebase/app";

// Firebase Analytics (optional)
import { getAnalytics } from "firebase/analytics";

// Firebase Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firestore Database
import { getFirestore } from "firebase/firestore";

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAFazzOomEIAhHSAR2JUQ-SWSRjdH9LZs4",
    authDomain: "moviesbooking-70e3e.firebaseapp.com",
    projectId: "moviesbooking-70e3e",
    storageBucket: "moviesbooking-70e3e.firebasestorage.app",
    messagingSenderId: "811153916098",
    appId: "1:811153916098:web:595f48f562592983757b5b",
    measurementId: "G-H23WS4XF67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only if browser supports it
let analytics = null;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

// Initialize services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;

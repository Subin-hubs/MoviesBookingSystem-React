//CHANGES
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
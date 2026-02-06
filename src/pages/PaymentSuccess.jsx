import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying");
    const isProcessing = useRef(false); // Prevents double-writes to Firestore

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            // Wait for user and ensure we aren't already processing this request
            if (!user || isProcessing.current) return;

            const data = searchParams.get('data');
            const pending = JSON.parse(localStorage.getItem("pendingBooking"));

            if (data && pending) {
                isProcessing.current = true; // Lock the process
                try {
                    // eSewa returns base64 encoded JSON in the 'data' parameter
                    const decodedString = atob(data);
                    const decoded = JSON.parse(decodedString);

                    if (decoded.status === "COMPLETE") {
                        // 1. Update Show Seats (Marks them as taken)
                        const showRef = doc(db, "shows", pending.showId);
                        await updateDoc(showRef, {
                            bookedSeats: arrayUnion(...pending.selectedSeats)
                        });

                        // 2. Create Global Booking Record
                        await addDoc(collection(db, "bookings"), {
                            userId: user.uid,
                            userEmail: user.email,
                            movieTitle: pending.movieTitle,
                            theaterName: pending.theaterName || "Unknown Theater",
                            seats: pending.selectedSeats,
                            totalPrice: pending.amount,
                            transactionId: decoded.transaction_code,
                            transactionUuid: decoded.transaction_uuid,
                            status: "Paid",
                            createdAt: new Date()
                        });

                        // 3. Cleanup and Redirect
                        localStorage.removeItem("pendingBooking");
                        setStatus("success");

                        // Redirect to 'My Bookings' after 3 seconds
                        setTimeout(() => navigate('/booking'), 3000);
                    } else {
                        setStatus("failed");
                    }
                } catch (err) {
                    console.error("Firestore Update Error:", err);
                    setStatus("error");
                }
            } else if (!pending && status === "verifying") {
                // If no pending booking found, user might have refreshed the page
                setStatus("already_processed");
                setTimeout(() => navigate('/booking'), 2000);
            }
        });

        return () => unsubscribe();
    }, [searchParams, navigate, status]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-zinc-900 p-10 rounded-[40px] border border-white/5 max-w-sm w-full text-center shadow-2xl">
                {status === "verifying" && (
                    <>
                        <div className="w-12 h-12 border-4 border-t-red-600 border-white/10 rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-black uppercase tracking-widest italic">Verifying</h2>
                        <p className="text-gray-500 text-xs mt-2 uppercase">Please do not close this window...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black uppercase italic text-green-500">Confirmed!</h2>
                        <p className="text-gray-400 text-sm mt-2">Your seats are booked. Redirecting...</p>
                    </>
                )}

                {(status === "failed" || status === "error") && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black uppercase italic text-red-500">Failed</h2>
                        <p className="text-gray-400 text-sm mt-2">Payment was not verified. Please contact support.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 bg-white text-black px-8 py-2 rounded-full font-bold text-xs uppercase"
                        >
                            Back to Home
                        </button>
                    </>
                )}

                {status === "already_processed" && (
                    <p className="text-gray-500 text-xs italic uppercase tracking-widest">Checking booking status...</p>
                )}
            </div>
        </div>
    );
}
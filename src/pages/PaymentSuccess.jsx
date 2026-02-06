import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const finalize = async () => {
            const encodedData = searchParams.get('data');
            const pending = JSON.parse(localStorage.getItem("pendingBooking"));

            // Ensure we have a logged-in user before saving
            if (encodedData && pending && auth.currentUser) {
                try {
                    // 1. Decode eSewa Response
                    const decoded = JSON.parse(atob(encodedData));

                    if (decoded.status === "COMPLETE") {
                        // 2. Update the Seats in the Show document
                        await updateDoc(doc(db, "shows", pending.showId), {
                            bookedSeats: arrayUnion(...pending.selectedSeats)
                        });

                        // 3. Save Ticket to the 'bookings' collection
                        // Using 'createdAt' to match your Firestore structure
                        await addDoc(collection(db, "bookings"), {
                            userId: auth.currentUser.uid,
                            movieTitle: pending.movieTitle,
                            seats: pending.selectedSeats,
                            amount: pending.amount,
                            totalPrice: pending.amount, // Added to match your screenshot
                            transactionId: decoded.transaction_code,
                            status: "Paid",
                            createdAt: new Date() // Changed from 'timestamp' to 'createdAt'
                        });

                        // 4. Cleanup and redirect
                        localStorage.removeItem("pendingBooking");
                        setStatus("success");

                        // Short delay so user sees the success message
                        setTimeout(() => navigate('/booking'), 2500);
                    } else {
                        setStatus("failed");
                    }
                } catch (e) {
                    console.error("Verification Error:", e);
                    setStatus("error");
                }
            } else if (!auth.currentUser) {
                console.error("No authenticated user found.");
                setStatus("error");
            }
        };
        finalize();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
            <div className="max-w-md w-full text-center">
                {status === "verifying" && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xl font-bold tracking-widest uppercase">Verifying Payment...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black uppercase italic">Payment <span className="text-green-500">Confirmed</span></h1>
                        <p className="text-gray-400 mt-4 font-medium">Your tickets are being generated. Redirecting...</p>
                    </div>
                )}

                {(status === "failed" || status === "error") && (
                    <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-[32px]">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold">!</span>
                        </div>
                        <h2 className="text-2xl font-black uppercase">Payment Failed</h2>
                        <p className="text-gray-400 mt-2 mb-6">We couldn't verify your transaction with eSewa.</p>
                        <button
                            onClick={() => navigate('/movies')}
                            className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const encodedData = searchParams.get("data");

  useEffect(() => {
    if (encodedData) {
      try {
        // 1. Decode eSewa Response
        const decodedString = atob(encodedData);
        const response = JSON.parse(decodedString);

        if (response.status === "COMPLETE") {
          saveBookingToFirebase(response);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verification Error", err);
        setStatus("error");
      }
    }
  }, [encodedData]);

  const saveBookingToFirebase = async (data) => {
    try {
      await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser?.uid,
        transactionId: data.transaction_id,
        amount: data.total_amount,
        status: "PAID",
        createdAt: new Date(),
        // Note: You might want to pass movie details via localStorage 
        // because eSewa doesn't return custom fields
      });
      setStatus("success");
    } catch (e) {
      console.error("Firestore Error", e);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {status === "verifying" && <p className="text-gray-400 animate-pulse">Verifying Payment...</p>}

        {status === "success" && (
          <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic">Booking Confirmed!</h2>
            <p className="text-gray-400 mt-4 mb-8">Your tickets have been sent to your account.</p>
            <Link to="/booking" className="inline-block bg-white text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">View My Tickets</Link>
          </div>
        )}
      </div>
    </div>
  );
}
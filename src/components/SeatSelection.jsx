import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import CryptoJS from "crypto-js";
import { FaTimes, FaCreditCard } from 'react-icons/fa';

const SeatSelection = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const snap = await getDoc(doc(db, "shows", showId));
                if (snap.exists()) {
                    setShow(snap.data());
                    setBookedSeats(snap.data().bookedSeats || []);
                }
            } catch (error) {
                console.error("Error fetching show:", error);
            }
        };
        fetchShow();
    }, [showId]);

    const handleEsewaPayment = () => {
        if (selectedSeats.length === 0) return;

        // 1. Setup Variables - Force clean strings (Rs. 5 per seat)
        const amt = (selectedSeats.length * 5).toString();
        const uniqueSuffix = Math.floor(Math.random() * 1000);
        const txId = `TXN-${Date.now()}-${uniqueSuffix}`;
        const pCode = "EPAYTEST";
        const secret = "8gBm/:&EnhH.1/q";

        // 2. The Signature String - NO SPACES, EXACT ORDER
        const sigString = `total_amount=${amt},transaction_uuid=${txId},product_code=${pCode}`;

        // 3. Generate HMAC-SHA256
        const hash = CryptoJS.HmacSHA256(sigString, secret);
        const signature = CryptoJS.enc.Base64.stringify(hash);

        // 4. Define the Exact Payload for eSewa v2
        const formData = {
            "amount": amt,
            "tax_amount": "0",
            "total_amount": amt,
            "transaction_uuid": txId,
            "product_code": pCode,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": `${window.location.origin}/payment-success`,
            "failure_url": `${window.location.origin}/payment-fail`,
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature
        };

        // 5. CRITICAL: Save data to LocalStorage before redirecting
        // This allows PaymentSuccess.jsx to know what to save in Firebase
        localStorage.setItem("pendingBooking", JSON.stringify({
            movieTitle: show.movieTitle,
            amount: amt,
            selectedSeats: selectedSeats,
            showId: showId,
            theaterName: show.theaterName,
            time: show.time,
            userId: auth.currentUser?.uid || "guest"
        }));

        // 6. Submit via Hidden Form (Standard for eSewa v2)
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.entries(formData).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        console.log("SIGNATURE STRING:", sigString);
        console.log("FORM DATA:", formData);
        form.submit();
    };

    if (!show) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold italic uppercase tracking-widest">
            Loading Cinema...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-10 flex flex-col items-center pb-40">
            <h1 className="text-4xl font-black mb-2 italic uppercase tracking-tighter">{show.movieTitle}</h1>
            <p className="text-red-600 font-bold mb-12 uppercase text-xs tracking-[0.3em]">{show.theaterName} • {show.time}</p>

            <div className="w-full max-w-2xl mb-20">
                <div className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-[1em]">Screen</p>
            </div>

            <div className="grid gap-4">
                {rows.map(row => (
                    <div key={row} className="flex gap-4 items-center">
                        <span className="w-6 text-gray-700 font-black text-xs">{row}</span>
                        {cols.map(col => {
                            const id = `${row}${col}`;
                            const isBooked = bookedSeats.includes(id);
                            const isSelected = selectedSeats.includes(id);
                            return (
                                <button
                                    key={id}
                                    disabled={isBooked}
                                    onClick={() => setSelectedSeats(prev => isSelected ? prev.filter(s => s !== id) : [...prev, id])}
                                    className={`w-8 h-8 rounded-t-lg transition-all duration-200 text-[10px] font-bold
                                        ${isBooked ? 'bg-zinc-800 cursor-not-allowed opacity-30' :
                                            isSelected ? 'bg-red-600 scale-110 shadow-[0_0_15px_rgba(220,38,38,0.4)]' :
                                                'bg-white/5 hover:bg-white/20'}`}
                                >
                                    {col}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex gap-8 mt-16 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white/10 rounded" /> Available</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded" /> Selected</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-800 rounded" /> Sold</div>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="bg-zinc-900 border border-white/5 p-8 rounded-[40px] max-w-md w-full relative">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-3xl font-black mb-1 italic uppercase tracking-tighter">Secure Pay</h2>
                        <p className="text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest">
                            Seats: {selectedSeats.join(', ')}
                        </p>

                        <div className="space-y-3">
                            <button onClick={handleEsewaPayment} className="w-full bg-[#60bb46] py-5 rounded-2xl font-black text-white uppercase text-xs tracking-widest hover:brightness-110 flex items-center justify-center gap-3">
                                <span className="bg-white text-[#60bb46] px-2 py-0.5 rounded text-[10px]">eS</span>
                                Pay Rs. {selectedSeats.length * 5} via eSewa
                            </button>
                            <button disabled className="w-full bg-white/5 py-5 rounded-2xl font-black text-gray-600 uppercase text-xs tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
                                <FaCreditCard /> Debit / Credit Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/50 backdrop-blur-2xl border-t border-white/5 p-8 flex justify-between items-center px-12 z-[100]">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Amount</p>
                    <p className="text-2xl font-black text-red-600">Rs. {selectedSeats.length * 5}</p>
                </div>
                <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={selectedSeats.length === 0}
                    className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-red-600 hover:text-white disabled:opacity-20"
                >
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import CryptoJS from "crypto-js";
import { FaMoneyBillWave, FaCreditCard, FaWallet, FaTimes } from 'react-icons/fa';

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
                    const data = snap.data();
                    setShow(data);
                    setBookedSeats(data.bookedSeats || []);
                }
            } catch (error) {
                console.error("Error fetching show data:", error);
            }
        };
        fetchShow();
    }, [showId]);

    const toggleSeat = (seat) => {
        if (bookedSeats.includes(seat)) return;
        setSelectedSeats(prev =>
            prev.includes(seat)
                ? prev.filter(s => s !== seat)
                : [...prev, seat]
        );
    };

    // ------------------------------
    // 1. ESEWA PAYMENT LOGIC
    // ------------------------------
    const handleEsewaPayment = () => {
        const amt = (selectedSeats.length * 500).toString();
        const txId = `TXN-${Date.now()}`;
        const pCode = "EPAYTEST";
        const secret = "8gBm/:&EnhH.1/q";

        // 1. Signature String (CRITICAL: No spaces after commas)
        const sigString = `total_amount=${amt},transaction_uuid=${txId},product_code=${pCode}`;
        const hash = CryptoJS.HmacSHA256(sigString, secret);
        const signature = CryptoJS.enc.Base64.stringify(hash);

        // 2. Dynamic Redirect URL (Works on Local & Vercel)
        const baseUrl = window.location.origin;

        const formData = {
            "amount": amt,
            "tax_amount": "0",
            "total_amount": amt,
            "transaction_uuid": txId,
            "product_code": pCode,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": `${baseUrl}/payment-success`, // Dynamic path
            "failure_url": `${baseUrl}/payment-fail`,
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature
        };

        // 3. Store booking data in LocalStorage 
        // We need this because eSewa doesn't return seat numbers in the URL!
        localStorage.setItem("pendingBooking", JSON.stringify({
            movieTitle: show.movieTitle,
            amount: amt,
            selectedSeats: selectedSeats,
            showId: showId,
            userId: auth.currentUser?.uid // Ensure user is logged in
        }));

        // 4. Submit Form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.keys(formData).forEach(key => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = formData[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    // ------------------------------
    // 2. OTHER PAYMENT HANDLERS
    // ------------------------------
    const handleOtherPayment = (method) => {
        // Placeholder for Khalti, Card, or Cash logic
        alert(`${method} payment integration coming soon! For now, please use eSewa.`);
    };

    if (!show) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-10 flex flex-col items-center pb-40">
            <h1 className="text-3xl font-black uppercase italic mb-2">{show.movieTitle}</h1>
            <p className="text-red-600 font-bold mb-10">{show.theaterName} — {show.time}</p>

            {/* Screen Indicator */}
            <div className="w-full max-w-2xl mb-16">
                <div className="h-2 bg-white/20 rounded-full shadow-[0_-10px_40px_rgba(255,255,255,0.3)]" />
                <p className="text-center text-[10px] tracking-[0.5em] text-gray-600 mt-4 uppercase">Screen This Way</p>
            </div>

            {/* Seat Grid */}
            <div className="grid gap-4 mb-20">
                {rows.map(row => (
                    <div key={row} className="flex gap-4 items-center">
                        <span className="w-6 text-gray-600 font-bold text-xs">{row}</span>
                        <div className="flex gap-2">
                            {cols.map(col => {
                                const seatId = `${row}${col}`;
                                const isBooked = bookedSeats.includes(seatId);
                                const isSelected = selectedSeats.includes(seatId);

                                return (
                                    <button
                                        key={seatId}
                                        disabled={isBooked}
                                        onClick={() => toggleSeat(seatId)}
                                        className={`w-8 h-8 rounded-t-lg transition-all duration-300 text-[10px] font-bold
                                            ${isBooked ? 'bg-gray-800 cursor-not-allowed' :
                                                isSelected ? 'bg-red-600 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]' :
                                                    'bg-white/10 hover:bg-white/30'}`}
                                    >
                                        {col}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-8 mb-10 text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white/10 rounded" /> Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded" /> Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 rounded" /> Sold</div>
            </div>

            {/* PAYMENT METHOD MODAL */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-md w-full relative shadow-2xl">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>

                        <h2 className="text-3xl font-black uppercase italic mb-2">Checkout</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                            Total: <span className="text-red-500">Rs. {selectedSeats.length * 500}</span>
                        </p>

                        <div className="grid gap-3">
                            {/* eSewa */}
                            <button onClick={handleEsewaPayment} className="flex items-center justify-between bg-[#60bb46] p-5 rounded-2xl hover:brightness-110 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#60bb46] font-black text-xs">eS</div>
                                    <span className="font-black uppercase text-xs tracking-wider">eSewa Wallet</span>
                                </div>
                                <div className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">Pay Now</div>
                            </button>

                            {/* Khalti */}
                            <button onClick={() => handleOtherPayment('Khalti')} className="flex items-center justify-between bg-[#5d2e8e] p-5 rounded-2xl hover:brightness-110 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#5d2e8e] font-black text-xs uppercase">K</div>
                                    <span className="font-black uppercase text-xs tracking-wider">Khalti</span>
                                </div>
                            </button>

                            {/* Card */}
                            <button onClick={() => handleOtherPayment('Card')} className="flex items-center justify-between bg-zinc-800 border border-white/5 p-5 rounded-2xl hover:bg-zinc-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                                        <FaCreditCard size={14} />
                                    </div>
                                    <span className="font-black uppercase text-xs tracking-wider">Credit / Debit Card</span>
                                </div>
                            </button>

                            {/* Cash */}
                            <button onClick={() => handleOtherPayment('Cash')} className="flex items-center justify-between bg-zinc-800 border border-white/5 p-5 rounded-2xl hover:bg-zinc-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-green-500">
                                        <FaMoneyBillWave size={14} />
                                    </div>
                                    <span className="font-black uppercase text-xs tracking-wider">Pay at Counter (Cash)</span>
                                </div>
                            </button>
                        </div>

                        <p className="mt-8 text-center text-[9px] text-gray-600 uppercase font-bold tracking-widest">
                            Secure Encrypted Payment
                        </p>
                    </div>
                </div>
            )}

            {/* Bottom Summary Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 border-t border-white/10 p-6 flex justify-around items-center backdrop-blur-xl z-[100]">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Selected Seats</p>
                    <p className="text-xl font-black text-red-500">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '--'}</p>
                </div>

                <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={selectedSeats.length === 0}
                    className="bg-red-600 px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all hover:bg-white hover:text-black disabled:opacity-50 relative z-[110] cursor-pointer"
                >
                    Confirm Booking (Rs.{selectedSeats.length * 500})
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;
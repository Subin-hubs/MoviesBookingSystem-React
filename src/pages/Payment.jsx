import React from 'react';
import { useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';

export default function Payment() {
  const location = useLocation();

  // Fallback for testing - ensure amount is a string
  const { movieTitle, amount, selectedSeats, showId } = location.state || {
    movieTitle: "Test Movie",
    amount: "100",
    selectedSeats: ["A1"],
    showId: "test_123"
  };

  const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
  const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
  const ESEWA_PRODUCT_CODE = "EPAYTEST";

  // Generate a unique ID (Alphanumeric only for safety)
  const transaction_uuid = `CINO-${Date.now()}`;

  // STEP 1: Create the signature string exactly as eSewa wants it
  // Order: total_amount, transaction_uuid, product_code
  const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;

  // STEP 2: Generate HMAC-SHA256 Hash and convert to Base64
  const hash = CryptoJS.HmacSHA256(signatureString, ESEWA_SECRET_KEY);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  const handleESewaClick = () => {
    const pending = { movieTitle, selectedSeats, showId, amount };
    localStorage.setItem("pendingBooking", JSON.stringify(pending));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[32px] p-8">
        <h2 className="text-2xl font-black text-white uppercase italic mb-6">eSewa Payment</h2>

        <div className="mb-8 space-y-2 text-sm">
          <p className="text-gray-400 font-bold uppercase">Movie: <span className="text-white">{movieTitle}</span></p>
          <p className="text-white font-black text-xl">Total: Rs. {amount}</p>
        </div>

        <form action={ESEWA_URL} method="POST" onSubmit={handleESewaClick}>
          {/* These MUST match the fields in your signatureString */}
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="tax_amount" value="0" />
          <input type="hidden" name="total_amount" value={amount} />
          <input type="hidden" name="transaction_uuid" value={transaction_uuid} />
          <input type="hidden" name="product_code" value={ESEWA_PRODUCT_CODE} />

          {/* Fixed fields */}
          <input type="hidden" name="product_service_charge" value="0" />
          <input type="hidden" name="product_delivery_charge" value="0" />
          <input type="hidden" name="success_url" value="http://localhost:5173/payment-success" />
          <input type="hidden" name="failure_url" value="http://localhost:5173/payment" />

          {/* Configuration */}
          <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
          <input type="hidden" name="signature" value={signature} />

          <button type="submit" className="w-full bg-[#60bb46] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#52a63b] transition-all">
            Pay with eSewa
          </button>
        </form>
      </div>
    </div>
  );
}
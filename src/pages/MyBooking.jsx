import React, { useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MyBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserBookings(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserBookings = async (uid) => {
    try {
      setLoading(true);
      const q = query(collection(db, "bookings"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const bookedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = bookedData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || a.timestamp?.seconds || 0;
        const dateB = b.createdAt?.seconds || b.timestamp?.seconds || 0;
        return dateB - dateA;
      });

      setBookings(sortedData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (ticket) => {
    if (!ticket || typeof ticket !== 'object') return;

    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    ghost.style.width = '700px';
    ghost.style.padding = '50px';
    ghost.style.backgroundColor = '#ffffff'; // Professional white background
    ghost.style.color = '#000000';
    ghost.style.fontFamily = "'Courier', 'Arial', sans-serif"; // Receipt-style font

    ghost.innerHTML = `
    <div style="border: 2px solid #000; padding: 20px;">
      <table style="width: 100%; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px;">FLICK-TIX CINEMAS</h1>
            <p style="margin: 5px 0; font-size: 10px; color: #555;">Kathmandu, Nepal | flick-tix.com</p>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top;">
            <h2 style="margin: 0; font-size: 18px; color: #ef4444;">TAX INVOICE</h2>
            <p style="margin: 5px 0; font-size: 10px;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f4f4f4; border-bottom: 1px solid #000;">
            <th style="text-align: left; padding: 10px; font-size: 12px;">DESCRIPTION</th>
            <th style="text-align: right; padding: 10px; font-size: 12px;">DETAILS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; font-weight: bold;">Movie Title</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${ticket.movieTitle.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px;">Seat Numbers</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: bold;">${Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px;">Transaction ID</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; font-family: monospace;">${ticket.id}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px;">Status</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: green; font-weight: bold;">VERIFIED PAID</td>
          </tr>
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 10px;">
        <tr>
          <td style="width: 60%;">
            <p style="font-size: 9px; color: #777;">Note: Please bring a digital copy of this receipt or a valid ID to the counter for entry. Tickets are non-refundable.</p>
          </td>
          <td style="width: 40%; text-align: right;">
            <div style="background-color: #000; color: #fff; padding: 15px;">
              <p style="margin: 0; font-size: 10px; text-transform: uppercase;">Total Amount</p>
              <h3 style="margin: 5px 0 0 0; font-size: 22px;">NPR ${ticket.amount || ticket.totalPrice}</h3>
            </div>
          </td>
        </tr>
      </table>

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
         <p style="font-size: 8px; letter-spacing: 5px; color: #aaa;">* ${ticket.id.toUpperCase()} *</p>
         <p style="font-size: 10px; font-weight: bold;">THANK YOU FOR BOOKING WITH FLICK-TIX</p>
      </div>
    </div>
  `;

    document.body.appendChild(ghost);

    try {
      const canvas = await html2canvas(ghost, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Fit the table nicely on the top half of the A4 page
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      pdf.save(`Invoice_${ticket.movieTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Generation failed.");
    } finally {
      document.body.removeChild(ghost);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-20 px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <p className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Account</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            My <span className="text-red-600">Tickets</span>
          </h1>
        </header>

        {!user ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-[40px] border border-white/5">
            <p className="text-gray-400 mb-6 font-bold uppercase tracking-widest text-xs">Please login to see your bookings.</p>
            <button onClick={() => window.location.href = '/login'} className="bg-white text-black px-10 py-3 rounded-full font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all">Login</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-20 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No tickets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.map((ticket) => (
              <div key={ticket.id} className="relative bg-zinc-900/50 border border-white/10 rounded-[32px] overflow-hidden group hover:border-red-600/50 transition-all duration-500">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black uppercase leading-tight group-hover:text-red-500 transition-colors">
                        {ticket.movieTitle || "Movie"}
                      </h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {ticket.id.slice(0, 8)}</p>
                    </div>
                    <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">{ticket.status || "Paid"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Seats</p>
                      <p className="font-bold text-sm">{Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Total Paid</p>
                      <p className="font-bold text-sm">Rs. {ticket.amount || ticket.totalPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-px border-t border-dashed border-white/20 mx-8">
                  <div className="absolute -left-12 -top-3 w-6 h-6 bg-[#050505] rounded-full border border-white/10"></div>
                  <div className="absolute -right-12 -top-3 w-6 h-6 bg-[#050505] rounded-full border border-white/10"></div>
                </div>

                <div className="px-8 py-6 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] font-bold uppercase">
                    {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : "Date N/A"}
                  </span>

                  <button
                    onClick={() => downloadPDF(ticket)} // PASS THE WHOLE TICKET OBJECT
                    className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
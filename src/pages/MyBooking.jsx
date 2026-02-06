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

      // Sort by date (newest first)
      const sortedData = bookedData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
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
    if (!ticket) return;

    // Create a hidden div for the PDF content
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    ghost.style.width = '700px';
    ghost.style.padding = '40px';
    ghost.style.backgroundColor = '#ffffff';
    ghost.style.color = '#000000';
    ghost.style.fontFamily = "'Courier New', Courier, monospace";

    ghost.innerHTML = `
    <div style="border: 4px solid #000; padding: 30px; position: relative;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">FLICK-TIX CINEMAS</h1>
        <p style="margin: 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Official Booking Receipt</p>
      </div>

      <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
            <span style="font-size: 10px; color: #666; display: block; text-transform: uppercase;">Movie</span>
            <strong style="font-size: 18px;">${ticket.movieTitle.toUpperCase()}</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">
            <span style="font-size: 10px; color: #666; display: block; text-transform: uppercase;">Status</span>
            <strong style="font-size: 16px; color: #ef4444;">PAID / VERIFIED</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #ddd;">
            <span style="font-size: 10px; color: #666; display: block; text-transform: uppercase;">Seats</span>
            <strong style="font-size: 16px;">${Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}</strong>
          </td>
          <td style="padding: 15px 0; border-bottom: 1px solid #ddd; text-align: right;">
            <span style="font-size: 10px; color: #666; display: block; text-transform: uppercase;">Transaction ID</span>
            <code style="font-size: 12px; background: #f4f4f4; padding: 2px 5px;">${ticket.id}</code>
          </td>
        </tr>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
        <div style="flex: 1;">
          <p style="font-size: 9px; color: #888; margin: 0; line-height: 1.4;">
            * Present this ticket at the counter to collect your physical copy.<br>
            * Tickets are non-refundable and non-transferable.<br>
            * Location: Kathmandu, Nepal
          </p>
        </div>
        <div style="background: #000; color: #fff; padding: 20px; text-align: right; min-width: 150px;">
          <span style="font-size: 10px; text-transform: uppercase; display: block;">Total Paid</span>
          <span style="font-size: 24px; font-weight: bold;">NPR ${ticket.amount || ticket.totalPrice}</span>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px dashed #ccc; padding-top: 20px;">
        <p style="font-size: 10px; font-weight: bold; letter-spacing: 3px;">ENJOY THE SHOW</p>
        <p style="font-size: 8px; color: #aaa; margin-top: 5px;">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
    `;

    document.body.appendChild(ghost);

    try {
      const canvas = await html2canvas(ghost, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`Ticket_${ticket.movieTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
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
            <p className="text-gray-400 mb-6 font-bold uppercase tracking-widest text-xs">Login to see your bookings</p>
            <button onClick={() => navigate('/login')} className="bg-white text-black px-10 py-3 rounded-full font-black uppercase text-xs">Login</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-20 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.map((ticket) => (
              <div key={ticket.id} className="relative bg-zinc-900/50 border border-white/10 rounded-[32px] overflow-hidden hover:border-red-600/50 transition-all duration-500">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black uppercase leading-tight">{ticket.movieTitle}</h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {ticket.id.slice(0, 10)}</p>
                    </div>
                    <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">PAID</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Seats</p>
                      <p className="font-bold text-sm text-red-500 tracking-tighter">
                        {Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase mb-1">Total Paid</p>
                      <p className="font-bold text-sm">Rs. {ticket.amount || ticket.totalPrice}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Tear Effect */}
                <div className="relative h-px border-t border-dashed border-white/20 mx-8">
                  <div className="absolute -left-12 -top-3 w-6 h-6 bg-[#050505] rounded-full border border-white/10"></div>
                  <div className="absolute -right-12 -top-3 w-6 h-6 bg-[#050505] rounded-full border border-white/10"></div>
                </div>

                <div className="px-8 py-6 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] font-bold uppercase">
                    {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : "New Booking"}
                  </span>
                  <button
                    onClick={() => downloadPDF(ticket)}
                    className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Download Invoice
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
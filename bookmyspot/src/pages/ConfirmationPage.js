import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CalendarDays, Clock3, MapPin } from "lucide-react";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking || {
    venueName: "The Golden Fork",
    tableId: 2,
    seats: 2,
    time: "7:00 PM",
    duration: "1 hour",
    deposit: 5,
    bookingNumber: "BK-10245",
    address: "Downtown, Beirut",
    date: "Today",
  };

  return (
    <div className="confirm-page">
      <div className="confirm-container">
        <button
          type="button"
          className="confirm-back-btn"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={22} />
          <span>Back to Home</span>
        </button>

        <div className="confirm-card">
          <div className="confirm-icon-wrap">
            <CheckCircle2 size={78} />
          </div>

          <h1 className="confirm-title">Reservation Confirmed</h1>
          <p className="confirm-subtitle">
            Your reservation has been successfully secured.
          </p>

          <div className="booking-number-box">
            <span>Booking Number</span>
            <strong>{booking.bookingNumber}</strong>
          </div>

          <div className="confirm-details">
            <div className="detail-row">
              <span>Venue</span>
              <strong>{booking.venueName}</strong>
            </div>

            <div className="detail-row">
              <span>Table</span>
              <strong>
                T{booking.tableId} ({booking.seats} seats)
              </strong>
            </div>

            <div className="detail-row">
              <span>Deposit Paid</span>
              <strong>${booking.deposit}</strong>
            </div>

            <div className="detail-row with-icon">
              <div className="detail-left">
                <CalendarDays size={18} />
                <span>Date</span>
              </div>
              <strong>{booking.date}</strong>
            </div>

            <div className="detail-row with-icon">
              <div className="detail-left">
                <Clock3 size={18} />
                <span>Time</span>
              </div>
              <strong>
                {booking.time} • {booking.duration}
              </strong>
            </div>

            <div className="detail-row with-icon">
              <div className="detail-left">
                <MapPin size={18} />
                <span>Location</span>
              </div>
              <strong>{booking.address}</strong>
            </div>
          </div>

          <div className="confirm-note">
            Please arrive on time. Your deposit has been recorded successfully.
          </div>

          <div className="confirm-actions">
            <button
              type="button"
              className="confirm-primary-btn"
              onClick={() => navigate("/restaurants")}
            >
              Browse More Venues
            </button>

            <button
              type="button"
              className="confirm-secondary-btn"
              onClick={() => navigate("/user")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
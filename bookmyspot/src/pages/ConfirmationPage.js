import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  CreditCard,
  Wallet,
  Landmark,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking || {
    venueName: "The Golden Fork",
    tableId: 2,
    tableCapacity: 4,
    bookedSeats: 2,
    time: "7:00 PM",
    duration: "1 hour",
    deposit: 5,
    bookingNumber: "BK-10245",
    address: "Downtown, Beirut",
    date: "Today",
    paymentMethod: "Wish",
    paymentStatus: "pending",
    bookingStatus: "pending_payment",
    confirmationMessage:
      "Your booking was created successfully. Please complete the payment and send your receipt.",
  };

  const isManualPayment =
    booking.paymentMethod === "Wish" || booking.paymentMethod === "OMT";

  const isPaid = booking.paymentStatus === "paid";

  const getPaymentIcon = () => {
    if (booking.paymentMethod === "card") {
      return <CreditCard size={18} />;
    }

    if (booking.paymentMethod === "OMT") {
      return <Landmark size={18} />;
    }

    return <Wallet size={18} />;
  };

  const getPaymentLabel = () => {
    if (booking.paymentMethod === "card") {
      return "Credit Card";
    }

    return booking.paymentMethod || "Wish";
  };

  const getTitle = () => {
    if (isPaid) return "Reservation Confirmed";
    return "Reservation Created";
  };

  const getSubtitle = () => {
    if (isPaid) {
      return "Your reservation has been successfully secured.";
    }

    return "Your reservation is waiting for payment confirmation.";
  };

  const getNote = () => {
    if (isPaid) {
      return "Please arrive on time. Your deposit has been recorded successfully.";
    }

    return `Please complete the deposit using ${getPaymentLabel()} and send your receipt to confirm the reservation.`;
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
          <div
            className={`confirm-icon-wrap ${
              isPaid ? "success-icon-wrap" : "pending-icon-wrap"
            }`}
          >
            {isPaid ? <CheckCircle2 size={78} /> : <AlertCircle size={78} />}
          </div>

          <h1 className="confirm-title">{getTitle()}</h1>
          <p className="confirm-subtitle">{getSubtitle()}</p>

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
              <strong>Table {booking.tableId}</strong>
            </div>

            <div className="detail-row">
              <span>Table Capacity</span>
              <strong>{booking.tableCapacity || 0} seats</strong>
            </div>

            <div className="detail-row">
              <span>Selected Seats</span>
              <strong>{booking.bookedSeats || 0}</strong>
            </div>

            <div className="detail-row">
              <span>Deposit</span>
              <strong>${booking.deposit}</strong>
            </div>

            <div className="detail-row with-icon">
              <div className="detail-left">
                {getPaymentIcon()}
                <span>Payment Method</span>
              </div>
              <strong>{getPaymentLabel()}</strong>
            </div>

            <div className="detail-row">
              <span>Payment Status</span>
              <strong className={isPaid ? "paid-status" : "pending-status"}>
                {isPaid ? "Paid" : "Pending Confirmation"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Reservation Status</span>
              <strong className={isPaid ? "paid-status" : "pending-status"}>
                {isPaid ? "Confirmed" : "Pending Payment"}
              </strong>
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

          <div className={`confirm-note ${isPaid ? "success-note" : "pending-note"}`}>
            {booking.confirmationMessage || getNote()}
          </div>

          {isManualPayment && !isPaid && (
            <div className="manual-payment-box">
              <h3>Next Step</h3>
              <p>
                Send your deposit using <strong>{getPaymentLabel()}</strong> and
                keep the receipt screenshot.
              </p>
              <p>
                Your reservation will be confirmed after payment verification.
              </p>
            </div>
          )}

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
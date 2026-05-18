import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Wallet, CreditCard } from "lucide-react";
import "./PayDeposit.css";

function getPaymentStatus(paymentMethod) {
  return paymentMethod === "card" || paymentMethod === "Credit Card"
    ? "paid"
    : "pending";
}

function getEndpoint(category) {
  if (category === "Wedding Hall") {
    return "http://localhost:5000/api/wedding-bookings";
  }

  if (category === "Event") {
    return "http://localhost:5000/api/event-bookings";
  }

  return "http://localhost:5000/api/bookings";
}

function buildBookingPayload(booking, paymentMethod) {
  const paymentStatus = getPaymentStatus(paymentMethod);

  if (booking.category === "Wedding Hall") {
    return {
      user_id: booking.user_id || booking.userId || null,
      email: booking.email || "",
      wedding_hall_id: booking.venueId || booking.venue_id,
      hall_name: booking.venueName || booking.venue_name,
      venue_id: booking.venueId || booking.venue_id,
      venue_name: booking.venueName || booking.venue_name,
      selected_items: booking.selectedItems || booking.selected_items || [],
      expected_guests: booking.expectedGuests || booking.expected_guests || 0,
      booking_date: booking.bookingDate || booking.booking_date,
      booking_time: booking.time || booking.booking_time,
      duration: booking.duration,
      deposit: booking.deposit,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      section: booking.section,
      category: "Wedding Hall",
      item_type: "wedding",
      custom_layout_json: booking.customLayout || booking.custom_layout || null,
    };
  }

  if (booking.category === "Event") {
    return {
      user_id: booking.user_id || booking.userId || null,
      email: booking.email || "",
      event_venue_id: booking.venueId || booking.venue_id,
      event_name: booking.venueName || booking.venue_name,
      venue_id: booking.venueId || booking.venue_id,
      venue_name: booking.venueName || booking.venue_name,
      selected_items: booking.selectedItems || booking.selected_items || [],
      expected_guests: booking.expectedGuests || booking.expected_guests || 0,
      booking_date: booking.bookingDate || booking.booking_date,
      booking_time: booking.time || booking.booking_time,
      duration: booking.duration,
      deposit: booking.deposit,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      section: booking.section,
      category: "Event",
      item_type: "event",
      custom_layout_json: booking.customLayout || booking.custom_layout || null,
    };
  }

  return {
    user_id: booking.user_id || booking.userId || null,
    venue_id: booking.venueId || booking.venue_id,
    venue_name: booking.venueName || booking.venue_name,
    table_id: booking.tableId || booking.table_id,
    selected_chairs: booking.selectedChairIds || booking.selected_chairs || [],
    selected_sofas: booking.selectedSofaIds || booking.selected_sofas || [],
    booked_seats: booking.bookedSeats || booking.booked_seats || 0,
    booking_date: booking.bookingDate || booking.booking_date,
    booking_time: booking.time || booking.booking_time,
    duration: booking.duration,
    deposit: booking.deposit,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    section: booking.section,
    area: booking.area,
    item_type: booking.category === "Cafe" ? "cafe" : "table_group",
    category: booking.category || "Restaurant",
    email: booking.email || "",
  };
}

export default function PayDeposit() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking || null;

  const [paymentMethod, setPaymentMethod] = useState(
    booking?.paymentMethod || "Wish"
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  if (!booking) {
    return (
      <div className="pay-page">
        <div className="pay-container">
          <button
            type="button"
            className="pay-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={22} />
            <span>Back</span>
          </button>

          <div className="pay-card">
            <h2>No booking data found</h2>
            <p>Please go back and select your reservation again.</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !expiry || !cvv) {
        alert("Please fill all card details");
        return;
      }

      if (cardNumber.length !== 16) {
        alert("Card number must be 16 digits");
        return;
      }

      if (cvv.length !== 3) {
        alert("Invalid CVV");
        return;
      }
    }

    const endpoint = getEndpoint(booking.category);
    const payload = buildBookingPayload(booking, paymentMethod);

    try {
      setLoading(true);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Payment failed");
        return;
      }

      navigate("/confirmation", {
        state: {
          booking: {
            ...booking,
            ...payload,
            paymentMethod,
            payment_method: paymentMethod,
            paymentStatus: getPaymentStatus(paymentMethod),
            payment_status: getPaymentStatus(paymentMethod),
            bookingNumber:
              data.bookingNumber ||
              data.booking_number ||
              booking.bookingNumber ||
              booking.booking_number,
            bookingId: data.bookingId || data.booking_id || data.id,
            date:
              booking.bookingDate ||
              booking.booking_date ||
              new Date().toISOString().split("T")[0],
            bookingStatus:
              getPaymentStatus(paymentMethod) === "paid"
                ? "reserved"
                : "pending_payment",
            confirmationMessage:
              getPaymentStatus(paymentMethod) === "paid"
                ? "Your reservation has been confirmed successfully."
                : "Your reservation is pending payment confirmation.",
          },
        },
      });
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      alert("Server error while confirming payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pay-page">
      <div className="pay-container">
        <button
          type="button"
          className="pay-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
          <span>Back</span>
        </button>

        <h1 className="pay-title">Pay Deposit</h1>
        <p className="pay-subtitle">Deposit to secure your reservation</p>

        <div className="pay-card">
          <div className="summary-row">
            <span>Venue</span>
            <strong>{booking.venueName || booking.venue_name}</strong>
          </div>

          <div className="summary-row">
            <span>Category</span>
            <strong>{booking.category || "Restaurant"}</strong>
          </div>

          {booking.tableId && (
            <div className="summary-row">
              <span>Table</span>
              <strong>Table {booking.tableId}</strong>
            </div>
          )}

          <div className="summary-row">
            <span>Seats / Guests</span>
            <strong>
              {booking.bookedSeats ||
                booking.expectedGuests ||
                booking.selectedItems?.length ||
                0}
            </strong>
          </div>

          <div className="summary-row">
            <span>Date</span>
            <strong>{booking.bookingDate || booking.booking_date}</strong>
          </div>

          <div className="summary-row">
            <span>Time</span>
            <strong>{booking.time || booking.booking_time}</strong>
          </div>

          <div className="summary-row">
            <span>Duration</span>
            <strong>{booking.duration}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Deposit</span>
            <strong>${booking.deposit}</strong>
          </div>
        </div>

        <div className="pay-card">
          <h2 className="section-title">Payment Method</h2>

          <button
            type="button"
            className={`method-option ${
              paymentMethod === "card" ? "method-active" : ""
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="method-left">
              <div className="radio-circle">
                {paymentMethod === "card" && <div className="radio-dot" />}
              </div>
              <CreditCard size={22} />
              <span>Credit Card</span>
            </div>
          </button>

          <button
            type="button"
            className={`method-option ${
              paymentMethod === "Wish" ? "method-active" : ""
            }`}
            onClick={() => setPaymentMethod("Wish")}
          >
            <div className="method-left">
              <div className="radio-circle">
                {paymentMethod === "Wish" && <div className="radio-dot" />}
              </div>
              <Wallet size={22} />
              <span>Wish</span>
            </div>
          </button>

          <button
            type="button"
            className={`method-option ${
              paymentMethod === "OMT" ? "method-active" : ""
            }`}
            onClick={() => setPaymentMethod("OMT")}
          >
            <div className="method-left">
              <div className="radio-circle">
                {paymentMethod === "OMT" && <div className="radio-dot" />}
              </div>
              <Landmark size={22} />
              <span>OMT</span>
            </div>
          </button>
        </div>

        {paymentMethod === "card" && (
          <div className="pay-card">
            <h2 className="section-title">Card Details</h2>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                maxLength={16}
              />
            </div>

            <div className="double-fields">
              <div className="form-group">
                <label>Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )}

        {(paymentMethod === "Wish" || paymentMethod === "OMT") && (
          <div className="pay-card">
            <p className="payment-note">
              You selected <strong>{paymentMethod}</strong>. Your booking will
              be saved as <strong>pending payment</strong> until the admin
              confirms it.
            </p>
          </div>
        )}

        <button
          type="button"
          className="pay-btn"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay $${booking.deposit}`}
        </button>
      </div>
    </div>
  );
}
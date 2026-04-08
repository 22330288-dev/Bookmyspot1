import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Banknote } from "lucide-react";
import "./PayDeposit.css";

export default function PayDeposit() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking || {
    venueName: "The Golden Fork",
    tableId: 2,
    seats: 2,
    time: "7:00 PM",
    duration: "1 hour",
    totalPrice: 50,
    deposit: 5,
  };

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

 const handlePay = () => {
  if (paymentMethod === "card") {
    if (!cardNumber || !expiry || !cvv) {
      alert("Please fill in all card details.");
      return;
    }
  }

  const bookingNumber = `BK-${Math.floor(10000 + Math.random() * 90000)}`;

  navigate("/confirmation", {
    state: {
      booking: {
        ...booking,
        bookingNumber,
        address: booking.address || "Downtown, Beirut",
        date: "Today",
      },
    },
  });
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
        <p className="pay-subtitle">10% deposit to secure your reservation</p>

        <div className="pay-card">
          <div className="summary-row">
            <span>Venue</span>
            <strong>{booking.venueName}</strong>
          </div>

          <div className="summary-row">
            <span>Seats</span>
            <strong>
              T{booking.tableId} ({booking.seats} seats)
            </strong>
          </div>

          <div className="summary-row">
            <span>Time</span>
            <strong>{booking.time}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Deposit (10%)</span>
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
              <span>Credit / Debit Card</span>
            </div>
          </button>

          <button
            type="button"
            className={`method-option ${
              paymentMethod === "cash" ? "method-active" : ""
            }`}
            onClick={() => setPaymentMethod("cash")}
          >
            <div className="method-left">
              <div className="radio-circle">
                {paymentMethod === "cash" && <div className="radio-dot" />}
              </div>
              <Banknote size={22} />
              <span>Cash on Arrival</span>
            </div>
          </button>
        </div>

        {paymentMethod === "card" && (
          <div className="pay-card">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
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
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <button type="button" className="pay-btn" onClick={handlePay}>
          Pay ${booking.deposit}
        </button>
      </div>
    </div>
  );
}
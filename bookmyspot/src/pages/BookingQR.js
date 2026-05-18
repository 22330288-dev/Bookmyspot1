import React from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./BookVenue.css";

export default function BookingQR() {
  const { bookingNumber } = useParams();

  const qrValue = JSON.stringify({
    bookingNumber,
  });

  return (
    <div className="book-page">
      <div className="book-container">
        <div
          className="reservation-details-card"
          style={{ textAlign: "center" }}
        >
          <h1>Your Booking QR Code</h1>

          <p>Show this QR code to the admin when you arrive.</p>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "18px",
              display: "inline-block",
              marginTop: "20px",
            }}
          >
            <QRCodeCanvas value={qrValue} size={260} />
          </div>

          <h2 style={{ marginTop: "20px" }}>{bookingNumber}</h2>
        </div>
      </div>
    </div>
  );
}
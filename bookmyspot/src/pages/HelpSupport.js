import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Pages.css";

export default function HelpSupport() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Help & Support</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="dark-section" style={{ padding: 0 }}>
          <h3 className="dark-section-title" style={{ color: "#a1773f" }}>
            CONTACT US
          </h3>

          <div className="list-card">
            <h4>Phone Support</h4>
            <p>+9613498485</p>
            <p>9 AM - 9 PM daily</p>
          </div>

          <div className="list-card">
            <h4>Email Support</h4>
            <p>bookmyspotweb@gmail.com</p>
            <p>Response within 24 hours</p>
          </div>

          <div className="list-card">
            <h4>WhatsApp</h4>
            <p>+9613498485</p>
            <p>24/7 automated responses</p>
          </div>
        </div>

        <div className="dark-section" style={{ padding: 0, marginTop: 26 }}>
          <h3 className="dark-section-title" style={{ color: "#a1773f" }}>
            FREQUENTLY ASKED QUESTIONS
          </h3>

          <div className="list-card">
            <h4>How do I book a table?</h4>
            <p>
              Browse restaurants, select your preferred date and time, choose
              party size, and tap “Book Now”.
            </p>
          </div>

          <div className="list-card">
            <h4>How do I cancel a booking?</h4>
            <p>
              Go to your bookings, select your reservation, and tap “Cancel
              Booking”.
            </p>
          </div>

          <div className="list-card">
            <h4>How do I leave a review?</h4>
            <p>
              After dining, go to bookings, find your completed reservation, and
              tap “Write Review”.
            </p>
          </div>

          <div className="list-card">
            <h4>How do I update my profile?</h4>
            <p>
              Go to the Profile tab, tap “Edit Profile”, update your information,
              then save.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
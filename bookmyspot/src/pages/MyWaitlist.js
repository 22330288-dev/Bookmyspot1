import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";
import "./Pages.css";

export default function MyWaitlist() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">My Waitlist</h1>
            <div className="title-line" />
          </div>
        </div>

        <p className="section-subtitle">Your restaurant waiting list entries</p>

        <div className="tabs">
          <button
            className={`tab-btn ${tab === "active" ? "active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active
          </button>
          <button
            className={`tab-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {tab === "active" ? (
          <div className="empty">
            <Clock3 size={58} className="empty-icon" />
            <h2>No Active Waitlists</h2>
            <p>
              You're not currently on any restaurant waitlists. Join one when
              tables are not available for your preferred time.
            </p>
            <button className="primary-btn" onClick={() => navigate("/restaurants")}>
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="empty">
            <Clock3 size={58} className="empty-icon" />
            <h2>No Waitlist History</h2>
            <p>
              Your completed, expired, and cancelled waitlist entries will appear
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
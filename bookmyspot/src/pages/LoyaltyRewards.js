import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift } from "lucide-react";
import "./Pages.css";

export default function LoyaltyRewards() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Loyalty Rewards</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="info-card">
          <h3>Bronze</h3>
          <p>0 points</p>
          <p style={{ marginTop: "12px" }}>Progress to Silver: 0%</p>
          <p style={{ marginTop: "8px" }}>500 points to Silver</p>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <h3>0</h3>
            <p>Total Points</p>
          </div>
          <div className="stat-box">
            <h3>0</h3>
            <p>Claimed</p>
          </div>
          <div className="stat-box">
            <h3>0</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="empty">
          <Gift size={58} className="empty-icon" />
          <h2>No Rewards Available</h2>
          <p>Check back later for new rewards and special offers.</p>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ marginTop: 0, color: "#1d1714" }}>Your Bronze Benefits</h3>
          <p className="section-subtitle">✓ Basic rewards</p>
          <p className="section-subtitle">✓ Birthday discount</p>
        </div>

        <div className="info-card" style={{ marginTop: "18px" }}>
          <p>
            Points are earned by dining at participating restaurants and leaving
            reviews. Redeemed rewards expire 30 days after redemption.
          </p>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import "./Pages.css";

export default function MyInsights() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Dining Insights</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="empty" style={{ marginTop: "100px" }}>
          <BarChart3 size={60} className="empty-icon" />
          <h2>No Insights Available</h2>
          <p>Start dining with us to see your personalized insights and patterns.</p>
        </div>
      </div>
    </div>
  );
}
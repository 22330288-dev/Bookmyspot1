import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import "./Pages.css";

export default function MyReviews() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Your Reviews</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="empty" style={{ marginTop: "100px" }}>
          <MessageCircle size={56} className="empty-icon" />
          <h2>No reviews yet</h2>
          <p>You have not written any reviews yet.</p>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import "./Pages.css";

export default function BlockedUsers() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Blocked Users</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="info-card">
          <h3>Privacy & Safety</h3>
          <p>
            When you block someone, they will not be able to see your content or
            interact with you.
          </p>
        </div>

        <div className="empty">
          <Shield size={58} className="empty-icon" />
          <h2>No Blocked Users</h2>
          <p>
            You have not blocked anyone yet. When you block someone, they will
            appear here and you can manage them.
          </p>
        </div>

        <div className="dark-section" style={{ padding: 0, marginTop: 20 }}>
          <h3 style={{ color: "#1d1714" }}>Need Help?</h3>
          <div className="list-card">
            <h4>Report Harassment</h4>
            <p>Learn how to report users who are bothering you.</p>
          </div>
          <div className="list-card">
            <h4>Privacy Settings</h4>
            <p>Control who can see your profile and content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Pages.css";

export default function PrivacySecurity() {
  const navigate = useNavigate();

  const items = [
    "Data Collection",
    "How We Use Your Data",
    "Data Sharing",
    "Data Security",
    "Your Privacy Rights",
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Privacy & Security</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="info-card">
          <h3>Your Privacy Matters</h3>
          <p>
            We are committed to protecting your personal information and giving
            you control over your data.
          </p>
        </div>

        <div className="dark-section" style={{ padding: 0 }}>
          <h3 className="dark-section-title" style={{ color: "#a1773f" }}>
            ACCOUNT MANAGEMENT
          </h3>

          <div className="list-card">
            <h4 style={{ color: "#b84a4a" }}>Delete Account</h4>
            <p>
              Permanently delete your account and all associated data. This action
              cannot be undone.
            </p>
            <button
              className="action-btn"
              style={{ background: "#d94848", marginTop: "16px" }}
            >
              Delete Account
            </button>
          </div>
        </div>

        <div className="dark-section" style={{ padding: 0, marginTop: 26 }}>
          <h3 className="dark-section-title" style={{ color: "#a1773f" }}>
            PRIVACY INFORMATION
          </h3>

          {items.map((item) => (
            <div className="list-card" key={item}>
              <h4>{item}</h4>
              <p>Updated 15/01/2024</p>
            </div>
          ))}
        </div>

        <div className="dark-section" style={{ padding: 0, marginTop: 26 }}>
          <h3 className="dark-section-title" style={{ color: "#a1773f" }}>
            LEGAL DOCUMENTS
          </h3>

          <div className="list-card">
            <h4>Full Privacy Policy</h4>
            <p>Complete details about our privacy practices and data handling.</p>
          </div>

          <div className="list-card">
            <h4>Terms & Conditions</h4>
            <p>Terms of service, privacy policy, and community guidelines.</p>
          </div>
        </div>

        <div className="list-card" style={{ marginTop: "26px" }}>
          <h4>Privacy Questions</h4>
          <p>
            Have questions about your privacy or need help with your account?
          </p>
          <button className="action-btn">Contact Support</button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#8f735b",
            marginTop: "26px",
            lineHeight: "1.7",
          }}
        >
          Your privacy is important to us. We follow industry best practices to
          protect your data and give you control over your information.
        </p>
      </div>
    </div>
  );
}
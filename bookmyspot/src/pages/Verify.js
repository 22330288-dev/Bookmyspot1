import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import "./Auth.css";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();

  const fullName = location.state?.fullName || "";
  const email = location.state?.email || "";
  const phone = location.state?.phone || "";

  const [loadingMethod, setLoadingMethod] = useState("");

  useEffect(() => {
    if (!fullName || !email || !phone) {
      navigate("/signup");
    }
  }, [fullName, email, phone, navigate]);

  if (!fullName || !email || !phone) {
    return null;
  }

  async function handleSendCode(method) {
    try {
      setLoadingMethod(method);

      const response = await fetch("http://localhost:5000/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          method, // "email" or "whatsapp"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          method === "email"
            ? "Code sent to your email successfully"
            : "Code sent to your WhatsApp successfully"
        );

        navigate("/enter-code", {
          state: {
            channel: method,
            value: method === "email" ? email : phone,
            email,
            phone,
            fullName,
          },
        });
      } else {
        alert(data.message || "Failed to send code");
      }
    } catch (error) {
      console.error("SEND CODE ERROR:", error);
      alert("Server error: " + error.message);
    } finally {
      setLoadingMethod("");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button
          type="button"
          className="back-btn click-brown-text"
          onClick={() => navigate("/signup")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="auth-card">
          <h1 className="auth-title">Verify Your Account</h1>
          <p className="auth-subtitle">
            Choose how you'd like to receive your verification code
          </p>

          <div className="verify-options">
            <button
              type="button"
              className="verify-option"
              onClick={() => handleSendCode("email")}
              disabled={loadingMethod !== ""}
            >
              <div className="verify-icon-box">
                <Mail size={28} />
              </div>
              <div className="verify-text">
                <h3>Email</h3>
                <p>{email}</p>
              </div>
            </button>

            <button
              type="button"
              className="verify-option"
              onClick={() => handleSendCode("whatsapp")}
              disabled={loadingMethod !== ""}
            >
              <div className="verify-icon-box whatsapp-box">
                <MessageSquare size={28} />
              </div>
              <div className="verify-text">
                <h3>WhatsApp</h3>
                <p>{phone}</p>
              </div>
            </button>
          </div>

          {loadingMethod === "email" && (
            <p className="auth-bottom-text">Sending code to email...</p>
          )}

          {loadingMethod === "whatsapp" && (
            <p className="auth-bottom-text">Sending code to WhatsApp...</p>
          )}
        </div>
      </div>
    </div>
  );
}
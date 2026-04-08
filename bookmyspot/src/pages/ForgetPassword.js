import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/enter-code", {
          state: {
            channel: "email",
            value: email,
            email: email,
            reset: true,
          },
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server error: " + error.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset code</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" className="auth-main-btn">
              Send Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
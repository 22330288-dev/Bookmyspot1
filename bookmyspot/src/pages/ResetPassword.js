import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button type="submit" className="auth-main-btn">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

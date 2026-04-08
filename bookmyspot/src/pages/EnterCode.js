import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./Auth.css";

export default function EnterCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const channel = location.state?.channel;
  const value = location.state?.value;
  const isReset = location.state?.reset;
  const email = location.state?.email || value;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channel || !value) {
      navigate("/verify");
    }
  }, [channel, value, navigate]);

  if (!channel || !value) return null;

  const message =
    channel === "email"
      ? "We sent a 6-digit code to your email"
      : "We sent a 6-digit code to your WhatsApp";

  const handleChange = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    setError("");

    if (val && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  async function handleVerify() {
  const finalCode = code.join("");

  if (!finalCode || finalCode.length < 6) {
    setError("Please enter the 6-digit code");
    return;
  }

  try {
    const endpoint = isReset
      ? "http://localhost:5000/api/auth/verify-reset-code"
      : "http://localhost:5000/api/auth/verify-code";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        code: finalCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Invalid code");
      return;
    }

    setError("");

    if (isReset) {
      navigate("/reset-password", {
        state: { email },
      });
    } else {
      navigate("/login");
    }
  } catch (error) {
    setError("Server error");
  }
}

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button
          type="button"
          className="back-btn click-brown-text"
          onClick={() => navigate("/verify")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="auth-card code-card">
          <h1 className="auth-title">Enter Code</h1>
          <p className="auth-subtitle">{message}</p>

          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-box"
              />
            ))}
          </div>

          <button type="button" className="auth-main-btn" onClick={handleVerify}>
            Verify
          </button>

          {error && <p className="error-text center-error">{error}</p>}

          <p className="resend-text">
            Didn&apos;t receive the code?{" "}
            <button type="button" className="resend-btn click-brown-text">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
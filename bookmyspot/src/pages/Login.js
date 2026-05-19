import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateLogin() {
    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!loginData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  }

  async function handleLogin(e) {
    e.preventDefault();

    const validationErrors = validateLogin();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (data.user.role === "Admin") {
            navigate("/admin");
          } else {
            navigate("/onboarding");
          }
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        alert("Server error: " + error.message);
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button
          type="button"
          className="back-btn click-brown-text"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your BookMySpot account</p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={loginData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}

            <div className="forgot-password-wrap">
              <button
                type="button"
                className="forgot-password-btn click-brown-text"
                onClick={() => navigate("/forgot-password")}
              >
                Forget password?
              </button>
            </div>

            <button type="submit" className="auth-main-btn">
              Log In
            </button>

            <p className="auth-bottom-text">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="signup-link-btn click-brown-text"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

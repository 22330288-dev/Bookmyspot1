import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);

          navigate("/verify", {
            state: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            },
          });
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("SIGNUP ERROR:", error);
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join BookMySpot to start reserving</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
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

            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}

            <button type="submit" className="auth-main-btn">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
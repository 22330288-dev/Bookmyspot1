import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
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
  const [passwordTouched, setPasswordTouched] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "phone") {
      newValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    lowerCase: /[a-z]/.test(formData.password),
    upperCase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    specialChar: /[!@#$%^&*(){}:"<>?]/.test(formData.password),
  };

  const isPasswordStrong =
    passwordChecks.minLength &&
    passwordChecks.lowerCase &&
    passwordChecks.upperCase &&
    passwordChecks.number &&
    passwordChecks.specialChar;

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
    } else if (!isPasswordStrong) {
      newErrors.password = "Please enter a strong password";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain numbers only";
    } else if (formData.phone.length < 7) {
      newErrors.phone = "Phone number must be at least 7 digits";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (!passwordTouched) {
      setPasswordTouched(true);
    }

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
                onFocus={() => setPasswordTouched(true)}
              />
             <button
  type="button"
  className="eye-btn"
  onClick={() => setShowPassword(!showPassword)}
>
  <Eye size={22} />
</button>
            </div>

            {passwordTouched && (
              <div className="password-rules-box">
                <p className="password-rules-title">Your password must contain:</p>

                <p className={passwordChecks.minLength ? "rule-valid" : "rule-invalid"}>
                  ✓ At least 8 characters
                </p>

                <p className={passwordChecks.lowerCase ? "rule-valid" : "rule-invalid"}>
                  ✓ Lower case letters (a-z)
                </p>

                <p className={passwordChecks.upperCase ? "rule-valid" : "rule-invalid"}>
                  ✓ Upper case letters (A-Z)
                </p>

                <p className={passwordChecks.number ? "rule-valid" : "rule-invalid"}>
                  ✓ Numbers (0-9)
                </p>

                <p className={passwordChecks.specialChar ? "rule-valid" : "rule-invalid"}>
                  ✓ Special characters (!@#$%^&*(){}:"&lt;&gt;?)
                </p>
              </div>
            )}

            {errors.password && <p className="error-text">{errors.password}</p>}

            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={15}
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
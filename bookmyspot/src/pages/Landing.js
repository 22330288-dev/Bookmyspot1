import React from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Coffee, PartyPopper, MapPin, Apple } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
const googleProvider = new GoogleAuthProvider();

async function handleGoogleSignup() {
  console.log("Google button clicked");

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("GOOGLE USER:", user);
    alert("Signed in with Google successfully");

    navigate("/user"); // أو أي صفحة بدك تروحي عليها
  } catch (error) {
    console.error("GOOGLE ERROR:", error);
    alert(error.message);
  }
}
  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="logo-icon">
          <MapPin size={40} />
        </div>

        <h1 className="brand-title">BookMySpot</h1>
        <p className="brand-subtitle">
          Reserve restaurants, cafes, wedding halls &amp; event venues
        </p>

        <div className="categories">
          <div className="category-item">
            <div className="category-box">
              <UtensilsCrossed size={26} strokeWidth={2} />
            </div>
            <span>Restaurants</span>
          </div>

          <div className="category-item">
            <div className="category-box">
              <Coffee size={26} strokeWidth={2} />
            </div>
            <span>Cafes</span>
          </div>

          <div className="category-item">
            <div className="category-box">
              <PartyPopper size={26} strokeWidth={2} />
            </div>
            <span>Events</span>
          </div>
        </div>

        <div className="auth-card">
          <button className="main-btn login-btn" onClick={() => navigate("/login")}>
            Log In
          </button>

          <button
            className="main-btn signup-btn click-brown"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>

          <div className="divider">
            <span className="line"></span>
            <span className="divider-text">OR CONTINUE WITH</span>
            <span className="line"></span>
          </div>

          <div className="social-buttons">
           <button
  type="button"
  className="social-btn click-brown"
  onClick={handleGoogleSignup}
>
  <span className="social-icon">G</span>
  <span>Google</span>
</button>

            <button className="social-btn click-brown">
              <Apple size={24} />
              <span>Apple</span>
            </button>

            <button
  type="button"
  className="social-btn click-brown"
  onClick={() => navigate("/guest")}
>
  <div className="social-icon">📍</div>
  <span>Guest</span>
</button>
          </div>
        </div>
      </div>
    </div>
  );
}
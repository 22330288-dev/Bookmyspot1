import React from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Coffee, PartyPopper, MapPin} from "lucide-react";
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
   <span className="google-logo" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.175 0-9.627-3.328-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              </span>
              <span>Google</span>
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
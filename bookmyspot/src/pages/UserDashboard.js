import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  UtensilsCrossed,
  Coffee,
  Heart,
  PartyPopper,
} from "lucide-react";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Restaurants",
      icon: <UtensilsCrossed size={34} strokeWidth={2} />,
      path: "/restaurants",
    },
    {
      title: "Cafes",
      icon: <Coffee size={34} strokeWidth={2} />,
      path: "/cafes",
    },
    {
      title: "Wedding Halls",
      icon: <Heart size={34} strokeWidth={2} />,
      path: "/wedding-halls",
    },
   {
  title: "Event Venues",
  icon: <PartyPopper size={34} strokeWidth={2} />,
  path: "/events-venues", // ✅ صح
}
  ];

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        <div className="top-bar">
          <button
            type="button"
            className="dashboard-back-btn"
            onClick={() => navigate("/onboarding")}
          >
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>

         <button
  type="button"
  className="profile-btn"
  onClick={() => navigate("/profile")}
>
  <User size={26} />
</button>
        </div>

        <h1 className="dashboard-main-title">What are you looking for?</h1>
        <p className="dashboard-main-subtitle">
          Choose a category to find your venue
        </p>

        <div className="category-grid">
          {categories.map((item, index) => (
            <button
              key={index}
              type="button"
              className="category-card"
              onClick={() => navigate(item.path)}
            >
              <div className="category-icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
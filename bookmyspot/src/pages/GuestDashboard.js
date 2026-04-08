import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UtensilsCrossed,
  Coffee,
  Heart,
  PartyPopper,
} from "lucide-react";
import "./GuestDashboard.css";

export default function GuestDashboard() {
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
      path: "/event-venues",
    },
  ];

  return (
    <div className="guest-dashboard-page">
      <div className="guest-dashboard-container">
        <div className="guest-top-bar">
          <button
            type="button"
            className="guest-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>
        </div>

        <h1 className="guest-title">Browse as Guest</h1>
        <p className="guest-subtitle">
          Explore venues without creating an account
        </p>

        <div className="guest-grid">
          {categories.map((item, index) => (
            <button
              key={index}
              type="button"
              className="guest-card"
              onClick={() =>
                navigate(item.path, {
                  state: { isGuest: true },
                })
              }
            >
              <div className="guest-icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Welcome, {user?.name || "Admin"}
        </p>

        <div className="admin-buttons">
          <button
            className="admin-btn"
            onClick={() => navigate("/admin-restaurants")}
          
          >
            Manage Restaurants
          </button>

          <button
            className="admin-btn"
            onClick={() => navigate("/admin/venues/cafes")}
          >
            Manage Cafes
          </button>

          <button
            className="admin-btn"
            onClick={() => navigate("/admin/venues/wedding-halls")}
          >
            Manage Wedding Halls
          </button>

          <button
            className="admin-btn"
            onClick={() => navigate("/admin/venues/event-venues")}
          >
            Manage Event Venues
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
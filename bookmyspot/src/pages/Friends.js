import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, Search } from "lucide-react";
import "./Pages.css";

export default function Friends() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("friends");
  const [search, setSearch] = useState("");

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>

          <div className="title-wrap">
            <h1 className="page-title">Friends</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${tab === "friends" ? "active" : ""}`}
            onClick={() => setTab("friends")}
          >
            My Friends
          </button>
          <button
            className={`tab-btn ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            Requests
          </button>
          <button
            className={`tab-btn ${tab === "discover" ? "active" : ""}`}
            onClick={() => setTab("discover")}
          >
            Discover
          </button>
        </div>

        {(tab === "friends" || tab === "discover") && (
          <div className="search-row">
            <input
              className="search-input"
              placeholder={tab === "friends" ? "Search friends..." : "Search users..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {tab === "discover" && <button className="search-btn">Search</button>}
          </div>
        )}

        {tab === "friends" && (
          <div className="empty">
            <Users size={56} className="empty-icon" />
            <h2>No friends yet</h2>
            <p>No friends yet. Start connecting!</p>
            <button className="primary-btn" onClick={() => setTab("discover")}>
              Discover Friends
            </button>
          </div>
        )}

        {tab === "requests" && (
          <div className="empty">
            <UserPlus size={56} className="empty-icon" />
            <h2>No pending requests</h2>
            <p>You do not have any pending friend requests right now.</p>
          </div>
        )}

        {tab === "discover" && (
          <div className="empty">
            <Search size={56} className="empty-icon" />
            <h2>Search for users</h2>
            <p>Search for users by name, email or phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  PencilLine,
  Bell,
  Star,
  KeyRound,
  CalendarCheck,
  Users,
  Gift,
  CreditCard,
  BarChart3,
  MessageCircle,
  Clock3,
  Shield,
  CircleHelp,
  LogOut,
  ChevronRight,
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userName = savedUser.name || "User Name";
  const userEmail = savedUser.email || "user@example.com";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sections = [
    {
      title: "ACCOUNT",
      items: [
        {
          icon: <PencilLine size={22} />,
          title: "Edit Profile",
          subtitle: "Update your personal information",
          action: () => navigate("/edit-profile"),
        },
        {
          icon: <CalendarCheck size={22} />,
          title: "My Bookings",
          subtitle: "View your table reservations",
          action: () => navigate("/my-bookings"),
        },
        {
          icon: <Bell size={22} />,
          title: "Notifications",
          subtitle: "Manage your notification preferences",
          action: () => alert("Notifications page"),
        },
        {
          icon: <Star size={22} />,
          title: "Preferences",
          subtitle: "Customize your experience",
          action: () => navigate("/dining-preferences"),
        },
        {
          icon: <KeyRound size={22} />,
          title: "Reset Password",
          subtitle: "Update your password",
          action: () => navigate("/forgot-password"),
        },
      ],
    },
    {
      title: "REWARDS & SOCIAL",
      items: [
        {
          icon: <Users size={22} />,
          title: "Friends",
          subtitle: "Manage your connections",
          action: () => navigate("/friends"),
        },
        {
          icon: <Gift size={22} />,
          title: "Loyalty & Rewards",
          subtitle: "0 points available",
          action: () => navigate("/loyalty-rewards"),
        },
        {
          icon: <CreditCard size={22} />,
          title: "Payment Methods",
          subtitle: "Cards & wallets",
          action: () => navigate("/payment-methods"),
        },
      ],
    },
    {
      title: "ACTIVITY",
      items: [
        {
          icon: <BarChart3 size={22} />,
          title: "My Insights",
          subtitle: "Dining stats",
          action: () => navigate("/my-insights"),
        },
        {
          icon: <MessageCircle size={22} />,
          title: "My Reviews",
          subtitle: "Reviews you've written",
          action: () => navigate("/my-reviews"),
        },
        {
          icon: <Clock3 size={22} />,
          title: "My Waitlist",
          subtitle: "View your restaurant waitlist entries",
          action: () => navigate("/my-waitlist"),
        },
      ],
    },
    {
      title: "SOCIAL",
      items: [
        {
          icon: <Shield size={22} />,
          title: "Blocked Users",
          subtitle: "Manage blocked accounts",
          action: () => navigate("/blocked-users"),
        },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        {
          icon: <CircleHelp size={22} />,
          title: "Help & Support",
          subtitle: "Get help when you need it",
          action: () => navigate("/help-support"),
        },
        {
          icon: <Shield size={22} />,
          title: "Privacy & Security",
          subtitle: "Privacy settings, data management & account deletion",
          action: () => navigate("/privacy-security"),
        },
      ],
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-topbar">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate("/user")}
          >
            <ArrowLeft size={22} />
            <span>Back</span>
          </button>
        </div>

        <div className="profile-header">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <h1 className="profile-name">{userName}</h1>
          <p className="profile-email">{userEmail}</p>
        </div>

        {sections.map((section, sectionIndex) => (
          <div className="profile-section" key={sectionIndex}>
            <h2 className="profile-section-title">{section.title}</h2>

            <div className="profile-card">
              {section.items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className="profile-row"
                  onClick={item.action}
                >
                  <div className="profile-row-left">
                    <div className="profile-icon-box">{item.icon}</div>

                    <div className="profile-texts">
                      <span className="profile-row-title">{item.title}</span>
                      <p className="profile-row-subtitle">{item.subtitle}</p>
                    </div>
                  </div>

                  <ChevronRight size={20} className="profile-arrow" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className="signout-btn" onClick={handleSignOut}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>

        <p className="profile-version">Version 1.2.36</p>
      </div>
    </div>
  );
}
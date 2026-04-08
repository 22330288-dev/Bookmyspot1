import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  CalendarCheck,
  CreditCard,
  Bell,
  ChevronRight,
} from "lucide-react";
import "./Onboarding.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const slides = [
    {
      icon: <MapPin size={54} strokeWidth={2.2} />,
      title: "Browse Venues",
      description:
        "Discover restaurants, cafes, wedding halls, and event venues near you.",
      buttonText: "Next",
    },
    {
      icon: <CalendarCheck size={54} strokeWidth={2.2} />,
      title: "Pick Your Spot",
      description:
        "View interactive seat maps and choose your preferred table and time.",
      buttonText: "Next",
    },
    {
      icon: <CreditCard size={54} strokeWidth={2.2} />,
      title: "Easy Deposit",
      description:
        "Secure your reservation with just a 10% deposit via card or cash.",
      buttonText: "Next",
    },
    {
      icon: <Bell size={54} strokeWidth={2.2} />,
      title: "Stay Notified",
      description:
        "Get instant notifications for confirmations and reminders. Show up within 30 minutes!",
      buttonText: "Get Started",
    },
  ];

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/user");
    }
  };

  const handleSkip = () => {
    navigate("/user");
  };

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;

    if (distance > 50 && current < slides.length - 1) {
      setCurrent(current + 1);
    }

    if (distance < -50 && current > 0) {
      setCurrent(current - 1);
    }
  };

  const slide = slides[current];

  return (
    <div
      className="onboarding-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="onboarding-container">
        <div className="onboarding-icon-box">{slide.icon}</div>

        <h1 className="onboarding-title">{slide.title}</h1>
        <p className="onboarding-description">{slide.description}</p>

        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${current === index ? "active-dot" : ""}`}
            />
          ))}
        </div>

        <button className="onboarding-btn" onClick={handleNext}>
          {slide.buttonText}
          {current === slides.length - 1 && <ChevronRight size={24} />}
        </button>

        <button className="skip-btn" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
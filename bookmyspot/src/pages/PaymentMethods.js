import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import "./Pages.css";

export default function PaymentMethods() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft />
          </button>
          <div className="title-wrap">
            <h1 className="page-title">Payment Methods</h1>
            <div className="title-line" />
          </div>
        </div>

        <div className="card" style={{ maxWidth: "540px", margin: "60px auto 0" }}>
          <div className="empty" style={{ padding: "30px 10px" }}>
            <CreditCard size={56} className="empty-icon" />
            <h2>No Payment Methods</h2>
            <p>
              Add a credit card to enable card guarantees for restaurant bookings
              that require them.
            </p>
            <div className="info-card" style={{ marginTop: "18px", width: "100%" }}>
              <p>
                A temporary $1.00 hold will be placed to verify your card and
                immediately refunded.
              </p>
            </div>
            <button className="primary-btn">
              <Plus size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
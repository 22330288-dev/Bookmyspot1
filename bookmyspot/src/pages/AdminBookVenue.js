import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Phone,
  Camera,
  MessageCircle,
  MapPin,
  Clock3,
  Users,
  PencilRuler,
} from "lucide-react";
import "./BookVenue.css";

export default function AdminBookVenue() {
  const navigate = useNavigate();
  const location = useLocation();

  const venueFromState = location.state?.venue;

  const [venue, setVenue] = useState(venueFromState || null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [guests, setGuests] = useState(2);
  const [preferredTime, setPreferredTime] = useState("19:00");
  const [duration, setDuration] = useState("1 hour");

  useEffect(() => {
    if (!venueFromState?.id) return;

    fetchVenueDetails(venueFromState.id);
  }, [venueFromState]);

  const fetchVenueDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
      setVenue(response.data);
    } catch (error) {
      console.error("Failed to fetch venue details:", error);
    }
  };

  const tables = useMemo(() => {
    if (venue?.mapLayout && Array.isArray(venue.mapLayout)) {
      return venue.mapLayout;
    }

    return [
      {
        id: 1,
        seats: 2,
        status: "available",
        shape: "round",
        top: "14%",
        left: "18%",
      },
      {
        id: 2,
        seats: 4,
        status: "reserved",
        shape: "round",
        top: "14%",
        left: "42%",
      },
      {
        id: 3,
        seats: 6,
        status: "available",
        shape: "rect",
        top: "14%",
        left: "72%",
      },
    ];
  }, [venue]);

  const handleTableClick = (table) => {
    if (table.status === "reserved") return;
    setSelectedTable(table);
  };

  if (!venue) return null;

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={venue.image || "/images/restaurants/default-restaurant.jpg"}
            alt={venue.name}
            onError={(e) => {
              e.target.src = "/images/restaurants/default-restaurant.jpg";
            }}
          />

          <button
            type="button"
            className="book-back-btn"
            onClick={() => navigate("/admin-restaurants")}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="book-info-card">
          <h1>{venue.name}</h1>
          <p className="book-type">
            Restaurant • {venue.cuisine}
          </p>

          <div className="book-info-row">
            <MapPin size={18} />
            <span>{venue.area}, {venue.city}</span>
          </div>

          <div className="book-info-row">
            <Clock3 size={18} />
            <span>{venue.hours || "8:30 PM - 1:00 AM"}</span>
          </div>

          <div className="contact-actions">
            <a href={`tel:${venue.phone || ""}`} className="contact-btn">
              <Phone size={20} />
              <span>Call</span>
            </a>

            <a
              href={`https://wa.me/${(venue.whatsapp || "").replace(/\+/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://instagram.com/${(venue.instagram || "").replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <Camera size={20} />
              <span>Instagram</span>
            </a>
          </div>

          <button
            type="button"
            className="create-seats-btn"
            onClick={() =>
              navigate("/create-restaurant-map", {
                state: { venue },
              })
            }
          >
            <PencilRuler size={18} />
            <span>Create Map</span>
          </button>
        </div>

        <div className="table-map-card">
          <h2>Current Restaurant Map</h2>

          <div className="table-map">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`table-shape ${table.shape} ${table.status} ${
                  selectedTable?.id === table.id ? "selected-table" : ""
                }`}
                style={{ top: table.top, left: table.left }}
                onClick={() => handleTableClick(table)}
              >
                {table.seats}
              </div>
            ))}
          </div>
        </div>

        <div className="reservation-details-card">
          <h2>Preview Reservation</h2>

          <label className="reserve-label">
            <Users size={18} />
            <span>Number of Guests</span>
          </label>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="book-input"
          />

          <label className="reserve-label">
            <Clock3 size={18} />
            <span>Preferred Time</span>
          </label>
          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="book-input"
          />

          <label className="reserve-label">
            <Clock3 size={18} />
            <span>Duration</span>
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="book-input"
          >
            <option>1 hour</option>
            <option>2 hours</option>
            <option>3 hours</option>
            <option>4 hours</option>
          </select>
        </div>
      </div>
    </div>
  );
}
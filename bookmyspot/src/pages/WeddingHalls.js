import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import axios from "axios";
import "./Restaurants.css";

export default function WeddingHalls() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const styleOptions = [
    { name: "All", icon: "💍" },
    { name: "Luxury", icon: "✨" },
    { name: "Classic", icon: "🏛️" },
    { name: "Garden", icon: "🌿" },
    { name: "Modern", icon: "💎" },
  ];

  useEffect(() => {
    fetchWeddingHalls();
  }, []);

  const fetchWeddingHalls = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wedding-halls`);

      setWeddingHalls(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching wedding halls:", error);
      setWeddingHalls([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWeddingHalls = useMemo(() => {
    return weddingHalls.filter((item) => {
      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesStyle =
        selectedStyle === "All" || item.style_type === selectedStyle;

      return matchesRegion && matchesStyle;
    });
  }, [weddingHalls, selectedRegion, selectedStyle]);

  return (
    <div className="restaurants-page">
      <div className="restaurants-container">
        <button
          type="button"
          className="restaurants-back-btn"
          onClick={() => navigate(isGuest ? "/guest" : "/user")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="restaurants-title">Wedding Halls</h1>

        <div className="filter-row">
          <div className="location-icon-wrap">
            <MapPin size={22} />
          </div>

          <div className="select-wrap">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="region-select"
            >
              <option>All Regions</option>
              <option>Beirut</option>
              <option>Bekaa</option>
              <option>South Lebanon</option>
              <option>North Lebanon</option>
            </select>
            <ChevronDown size={20} className="select-arrow" />
          </div>
        </div>

        <div className="cuisine-scroll">
          {styleOptions.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`cuisine-card ${
                selectedStyle === item.name ? "active-cuisine" : ""
              }`}
              onClick={() => setSelectedStyle(item.name)}
            >
              <div className="cuisine-icon-circle">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <p className="found-count">
          {loading
            ? "Loading wedding halls..."
            : `${filteredWeddingHalls.length} venues found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredWeddingHalls.length === 0 && (
            <div className="no-results-box">
              No wedding halls found for this filter.
            </div>
          )}

          {filteredWeddingHalls.map((hall) => (
            <div key={hall.id} className="restaurant-card">
              <div className="restaurant-image-box">
                <img
                  src={
                    typeof hall.image === "string" && hall.image.trim()
                      ? hall.image.trim()
                      : "/images/beirut/default-restaurant.jpg"
                  }
                  alt={hall.name}
                  onError={(e) => {
                    e.currentTarget.src = "/images/beirut/default-restaurant.jpg";
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{hall.name}</h3>
                <p>{hall.style_type}</p>
                <span>
                  {hall.city} - {hall.area}
                </span>

                <div className="restaurant-actions">
                  {isGuest ? (
                    <p className="guest-msg">Login to reserve</p>
                  ) : (
                    <button
                      className="book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/book-wedding-hall", {
                          state: {
                            venue: {
                              ...hall,
                              category: "Wedding Hall",
                              type: "wedding_hall",
                              description: hall.style_type,
                              address: `${hall.area}, ${hall.city}`,
                              phone: hall.phone || "+961 70 000 000",
                              instagram: hall.instagram || "@weddinghall",
                              whatsapp: hall.whatsapp || "+96170000000",
                              hours: hall.hours || "Open all day",
                            },
                          },
                        });
                      }}
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </div>

              <div className="restaurant-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{hall.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

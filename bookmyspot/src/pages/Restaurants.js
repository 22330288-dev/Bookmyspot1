import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import axios from "axios";
import "./Restaurants.css";

export default function Restaurants() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const cuisineOptions = [
    { name: "All", icon: "🍽️" },
    { name: "Lebanese", icon: "🥙" },
    { name: "Japanese", icon: "🍣" },
    { name: "Seafood", icon: "🐟" },
    { name: "BBQ/Steak", icon: "🥩" },
    { name: "Italian", icon: "🍝" },
    { name: "American", icon: "🍔" },
    { name: "Indian", icon: "🍛" },
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:5000/api/restaurants");

      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCuisine = (cuisine) => {
    if (!cuisine) return "";

    const value = cuisine.toLowerCase();

    if (
      value.includes("bbq") ||
      value.includes("grill") ||
      value.includes("steak")
    ) {
      return "BBQ/Steak";
    }

    if (value.includes("japanese")) return "Japanese";
    if (value.includes("seafood")) return "Seafood";
    if (value.includes("italian")) return "Italian";
    if (value.includes("american")) return "American";
    if (value.includes("indian")) return "Indian";
    if (value.includes("lebanese")) return "Lebanese";

    return cuisine;
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item) => {
      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesCuisine =
        selectedCuisine === "All" ||
        normalizeCuisine(item.cuisine) === selectedCuisine;

      return matchesRegion && matchesCuisine;
    });
  }, [restaurants, selectedRegion, selectedCuisine]);

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

        <h1 className="restaurants-title">Restaurants</h1>

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
          {cuisineOptions.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`cuisine-card ${
                selectedCuisine === item.name ? "active-cuisine" : ""
              }`}
              onClick={() => setSelectedCuisine(item.name)}
            >
              <div className="cuisine-icon-circle">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <p className="found-count">
          {loading ? "Loading venues..." : `${filteredRestaurants.length} venues found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredRestaurants.length === 0 && (
            <div className="no-results-box">
              No restaurants found for this filter.
            </div>
          )}

          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="restaurant-image-box">
                <img
                  src={
                    restaurant.image || "/images/restaurants/default-restaurant.jpg"
                  }
                  alt={restaurant.name}
                  onError={(e) => {
                    e.target.src = "/images/restaurants/default-restaurant.jpg";
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <span>
                  {restaurant.city} - {restaurant.area}
                </span>

                <div className="restaurant-actions">
                  {isGuest ? (
                    <p className="guest-msg">Login to reserve</p>
                  ) : (
                    <button
                      className="book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/book-venue", {
                          state: {
                            venue: {
                              ...restaurant,
                              category: "Restaurant",
                              description: restaurant.cuisine,
                              address: `${restaurant.area}, ${restaurant.city}`,
                              phone: restaurant.phone || "+961 70 000 000",
                              instagram: restaurant.instagram || "@restaurant",
                              whatsapp: restaurant.whatsapp || "+96170000000",
                              hours: restaurant.hours || "8:30 PM - 1:00 AM",
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
                <span>{restaurant.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
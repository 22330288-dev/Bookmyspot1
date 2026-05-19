import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import "./Cafes.css";

export default function Cafes() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cuisineOptions = [
    { name: "All", icon: "☕" },
    { name: "Coffee", icon: "☕" },
    { name: "Desserts", icon: "🍰" },
    { name: "Bakery", icon: "🥐" },
    { name: "Ice Cream", icon: "🍨" },
    { name: "Juice", icon: "🧃" },
    { name: "Shisha", icon: "💨" },
    { name: "Snacks", icon: "🍪" },
  ];

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/cafes`
);
      const data = Array.isArray(response.data) ? response.data : [];

      setCafes(data);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCafes = useMemo(() => {
    return cafes.filter((item) => {
      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesCuisine =
        selectedCuisine === "All" || item.cuisine === selectedCuisine;

      return matchesRegion && matchesCuisine;
    });
  }, [cafes, selectedRegion, selectedCuisine]);

  const openCafeBooking = (cafe) => {
    navigate("/book-venue-cafe", {
      state: {
        venue: {
          ...cafe,
          id: cafe.id,
          name: cafe.name,
          category: "Cafe",
          type: "cafe",
          description: cafe.cuisine || "Cafe",
          city: cafe.city,
          area: cafe.area,
          address: cafe.address || `${cafe.area}, ${cafe.city}`,
          image: cafe.image || "/images/beirut/default-restaurant.jpg",
          phone: cafe.phone || "+961 70 000 000",
          instagram: cafe.instagram || "@cafe",
          whatsapp: cafe.whatsapp || "+96170000000",
          hours: cafe.hours || "8:30 PM - 1:00 AM",
          google_maps_link: cafe.google_maps_link || "",
          has_smoking: cafe.has_smoking,
        },
      },
    });
  };

  return (
    <div className="restaurants-page">
      <div className="restaurants-container">
        <button
          type="button"
          className="restaurants-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="restaurants-title">Cafes</h1>

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
          {loading ? "Loading cafes..." : `${filteredCafes.length} cafes found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredCafes.length === 0 && (
            <div className="no-results-box">No cafes found.</div>
          )}

          {filteredCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="restaurant-card"
              onClick={() => openCafeBooking(cafe)}
            >
              <div className="restaurant-image-box">
                <img
                  src={cafe.image || "/images/beirut/default-restaurant.jpg"}
                  alt={cafe.name}
                  onError={(e) => {
                    e.target.src = "/images/beirut/default-restaurant.jpg";
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{cafe.name}</h3>

                <p>{cafe.cuisine || "Cafe"}</p>

                <span>
                  {cafe.city} - {cafe.area}
                </span>

                <p>
                  {Number(cafe.has_smoking) === 1 || cafe.has_smoking === true
                    ? "Smoking Area Available"
                    : "Non-Smoking Only"}
                </p>

                <button
                  type="button"
                  className="book-now-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCafeBooking(cafe);
                  }}
                >
                  Book Now
                </button>
              </div>

              <div className="restaurant-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{cafe.rating || 4.5}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

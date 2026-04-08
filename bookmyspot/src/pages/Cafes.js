import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import "./Cafes.css";

export default function Cafes() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  const cafes = useMemo(() => {
    return [
      // ================= BEIRUT =================
      {
        id: 1,
        name: "BLCK Specialty Coffee",
        specialty: "Specialty Coffee",
        city: "Beirut",
        area: "Hamra",
        rating: 4.9,
        image: "/images/cafes/beirut/blck.jpg",
      },
      {
        id: 2,
        name: "Levant Café",
        specialty: "Lebanese-Themed Café",
        city: "Beirut",
        area: "Gemmayze",
        rating: 5.0,
        image: "/images/cafes/beirut/levant-cafe.jpg",
      },
      {
        id: 3,
        name: "Us Coffee",
        specialty: "Specialty / Bagels",
        city: "Beirut",
        area: "Minet El Hosn",
        rating: 4.8,
        image: "/images/cafes/beirut/us-coffee.jpg",
      },
      {
        id: 4,
        name: "Caffeine Coffee Roasters",
        specialty: "Specialty Coffee",
        city: "Beirut",
        area: "Mar Mikhael",
        rating: 4.7,
        image: "/images/cafes/beirut/caffeine-roasters.jpg",
      },
      {
        id: 5,
        name: "Hale Café",
        specialty: "Healthy / Smoothies",
        city: "Beirut",
        area: "Gemmayze",
        rating: 4.7,
        image: "/images/cafes/beirut/hale-cafe.jpg",
      },
      {
        id: 6,
        name: "Nayla Beirut",
        specialty: "Cozy Bistro Café",
        city: "Beirut",
        area: "Mar Mikhael",
        rating: 4.8,
        image: "/images/cafes/beirut/nayla.jpg",
      },

      // ================= BEKAA =================
      {
        id: 21,
        name: "Croum Coffee Atelier",
        specialty: "Artisan Roastery",
        city: "Bekaa",
        area: "Zahle",
        rating: 5.0,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 22,
        name: "OURS Café",
        specialty: "Specialty / Cozy",
        city: "Bekaa",
        area: "Zahle",
        rating: 4.7,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 23,
        name: "Café Younes Zahle",
        specialty: "Specialty Coffee",
        city: "Bekaa",
        area: "Ksara, Zahle",
        rating: 4.5,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 24,
        name: "Shape Shake",
        specialty: "Bubble Tea / Health",
        city: "Bekaa",
        area: "Zahle",
        rating: 4.8,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 25,
        name: "Hooqqa Zahle",
        specialty: "Café / Shisha",
        city: "Bekaa",
        area: "Zahle",
        rating: 4.8,
        image: "/images/cafes/default-cafe.jpg",
      },

      // ================= SOUTH LEBANON =================
      {
        id: 41,
        name: "Bab Al Saray Café",
        specialty: "Heritage / Traditional",
        city: "South Lebanon",
        area: "Sidon Old City",
        rating: 4.5,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 42,
        name: "Kahwet Saida",
        specialty: "Lebanese Traditional",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.5,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 43,
        name: "67 Café",
        specialty: "Study / Chill",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.4,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 44,
        name: "Atay Resto Café",
        specialty: "Trendy / Modern",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.8,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 45,
        name: "Friends Café",
        specialty: "Social / 24h",
        city: "South Lebanon",
        area: "Tyre",
        rating: 4.4,
        image: "/images/cafes/default-cafe.jpg",
      },

      // ================= NORTH LEBANON =================
      {
        id: 61,
        name: "Vienna 1683",
        specialty: "European-Style Café",
        city: "North Lebanon",
        area: "Tripoli",
        rating: 4.8,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 62,
        name: "Majd Coffee Shop",
        specialty: "Specialty Coffee",
        city: "North Lebanon",
        area: "Tripoli Old Souk",
        rating: 4.9,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 63,
        name: "Kahve And More",
        specialty: "Artisan Café",
        city: "North Lebanon",
        area: "Mina, Tripoli",
        rating: 4.9,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 64,
        name: "Deens Coffee Shop",
        specialty: "Cozy / Study Café",
        city: "North Lebanon",
        area: "Mina, Tripoli",
        rating: 4.7,
        image: "/images/cafes/default-cafe.jpg",
      },
      {
        id: 65,
        name: "Qashweh (قشوة)",
        specialty: "Authentic Coffee",
        city: "North Lebanon",
        area: "Tripoli",
        rating: 5.0,
        image: "/images/cafes/default-cafe.jpg",
      },
    ];
  }, []);

  const filteredCafes =
    selectedRegion === "All Regions"
      ? cafes
      : cafes.filter((item) => item.city === selectedRegion);

  return (
    <div className="cafes-page">
      <div className="cafes-container">
        <button
          type="button"
          className="cafes-back-btn"
          onClick={() => navigate(isGuest ? "/guest" : "/user")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="cafes-title">Cafés</h1>

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

        <p className="found-count">{filteredCafes.length} venues found</p>

        <div className="cafes-list">
          {filteredCafes.map((cafe) => (
            <div key={cafe.id} className="cafe-card">
              <div className="cafe-image-box">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  onError={(e) => {
                    e.target.src = "/images/cafes/default-cafe.jpg";
                  }}
                />
              </div>

              <div className="cafe-info">
                <h3>{cafe.name}</h3>
                <p>{cafe.specialty}</p>
                <span>
                  {cafe.city} - {cafe.area}
                </span>

                <div className="cafe-actions">
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
          ...cafe,
          category: "Cafe",
          description: cafe.specialty,
          address: `${cafe.area}, ${cafe.city}`,
          phone: "+961 70 111 111",
          instagram: "@cafe",
          whatsapp: "+96170111111",
          hours: "8:00 AM - 11:00 PM",
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

              <div className="cafe-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{cafe.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
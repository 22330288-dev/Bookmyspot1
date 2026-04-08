import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import "./WeddingHalls.css";

export default function WeddingHalls() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  const weddingHalls = useMemo(() => {
    return [
      // ================= BEIRUT =================
      {
        id: 1,
        name: "AVA Venue",
        style: "Luxury Indoor",
        city: "Beirut",
        area: "Ashrafieh",
        rating: 4.8,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 2,
        name: "Sursock Palace",
        style: "Ottoman Heritage Palace",
        city: "Beirut",
        area: "Achrafieh",
        rating: 4.6,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 3,
        name: "Villa Linda Sursock",
        style: "Heritage Mansion",
        city: "Beirut",
        area: "Achrafieh",
        rating: 4.5,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 4,
        name: "Tanit Venue",
        style: "Indoor / Outdoor Nature",
        city: "Beirut",
        area: "Nahr El Kalb",
        rating: 4.5,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 5,
        name: "Marina Mövenpick",
        style: "5-Star Hotel Venue",
        city: "Beirut",
        area: "Raouché",
        rating: 5.0,
        image: "/images/wedding/default-wedding.jpg",
      },

      // ================= BEKAA =================
      {
        id: 21,
        name: "Karm El Joz",
        style: "Walnut Garden",
        city: "Bekaa",
        area: "Taanayel",
        rating: 4.7,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 22,
        name: "Les Vignobles Venue",
        style: "Vineyard Luxury",
        city: "Bekaa",
        area: "Maalaqah",
        rating: 4.6,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 23,
        name: "Sama Chtaura (Events)",
        style: "Garden + Indoor",
        city: "Bekaa",
        area: "Chtoura",
        rating: 4.6,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 24,
        name: "Grand Kadri Hotel",
        style: "Hotel Ballroom",
        city: "Bekaa",
        area: "Zahle",
        rating: 4.4,
        image: "/images/wedding/default-wedding.jpg",
      },

      // ================= SOUTH LEBANON =================
      {
        id: 41,
        name: "La Reine Wedding Garden",
        style: "Elegant Outdoor Garden",
        city: "South Lebanon",
        area: "Maghdoucheh",
        rating: 4.6,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 42,
        name: "Saray Nassib Basha",
        style: "Ottoman Heritage Palace",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.7,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 43,
        name: "Edesia Wedding Venue",
        style: "Green Garden Outdoor",
        city: "South Lebanon",
        area: "Bqosta, Sidon",
        rating: 4.5,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 44,
        name: "Le Venue Saida",
        style: "Modern Event Hall",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.8,
        image: "/images/wedding/default-wedding.jpg",
      },

      // ================= NORTH LEBANON =================
      {
        id: 61,
        name: "Platane Wedding Venues",
        style: "Luxury Garden + Nature",
        city: "North Lebanon",
        area: "Rachiine",
        rating: 5.0,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 62,
        name: "Roche Dorée",
        style: "Indoor / Outdoor",
        city: "North Lebanon",
        area: "Tripoli",
        rating: 4.0,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 63,
        name: "Étoile De Mer",
        style: "Rooftop Sea-View",
        city: "North Lebanon",
        area: "Tripoli",
        rating: 4.0,
        image: "/images/wedding/default-wedding.jpg",
      },
      {
        id: 64,
        name: "Lilium Venue",
        style: "Luxury Garden",
        city: "North Lebanon",
        area: "Rachiine",
        rating: 3.6,
        image: "/images/wedding/default-wedding.jpg",
      },
    ];
  }, []);

  const filteredWeddingHalls =
    selectedRegion === "All Regions"
      ? weddingHalls
      : weddingHalls.filter((item) => item.city === selectedRegion);

  return (
    <div className="wedding-page">
      <div className="wedding-container">
        <button
          type="button"
          className="wedding-back-btn"
          onClick={() => navigate(isGuest ? "/guest" : "/user")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="wedding-title">Wedding Halls</h1>

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

        <p className="found-count">{filteredWeddingHalls.length} venues found</p>

        <div className="wedding-list">
          {filteredWeddingHalls.map((venue) => (
            <div key={venue.id} className="wedding-card">
              <div className="wedding-image-box">
                <img
                  src={venue.image}
                  alt={venue.name}
                  onError={(e) => {
                    e.target.src = "/images/wedding/default-wedding.jpg";
                  }}
                />
              </div>

              <div className="wedding-info">
                <h3>{venue.name}</h3>
                <p>{venue.style}</p>
                <span>
                  {venue.city} - {venue.area}
                </span>

                <div className="wedding-actions">
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
          ...venue,
          category: "Wedding Hall",
          description: venue.style,
          address: `${venue.area}, ${venue.city}`,
          phone: "+961 70 222 222",
          instagram: "@weddinghall",
          whatsapp: "+96170222222",
          hours: "By Reservation",
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

              <div className="wedding-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{venue.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
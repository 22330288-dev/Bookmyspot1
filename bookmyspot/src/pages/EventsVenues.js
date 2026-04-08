import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import "./EventsVenues.css";

export default function EventsVenues() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  const eventVenues = useMemo(() => {
    return [
      {
        id: 1,
        name: "Seaside Pavilion",
        type: "Waterfront Luxury",
        city: "Beirut",
        area: "Downtown Beirut",
        rating: 4.4,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 2,
        name: "Beirut Seaside Arena",
        type: "Large Waterfront Venue",
        city: "Beirut",
        area: "Zaitunay Bay",
        rating: 4.0,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 3,
        name: "BIEL Beirut",
        type: "Large Convention Venue",
        city: "Beirut",
        area: "Downtown",
        rating: 4.2,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 4,
        name: "Saray Venue",
        type: "Palace Style",
        city: "Bekaa",
        area: "Chtoura",
        rating: 5.0,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 5,
        name: "Jardin Blanc",
        type: "Garden Venue",
        city: "Bekaa",
        area: "Zahle",
        rating: 4.4,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 6,
        name: "Le Venue Saida",
        type: "Modern Event Hall",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.8,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 7,
        name: "Zenobia Venue",
        type: "Luxury Event Hall",
        city: "South Lebanon",
        area: "Sidon",
        rating: 4.3,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 8,
        name: "La Salle Venue",
        type: "Exhibition & Events",
        city: "South Lebanon",
        area: "Rmeileh",
        rating: 4.0,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 9,
        name: "Platane Wedding Venues",
        type: "Luxury Garden + Nature",
        city: "North Lebanon",
        area: "Rachiine",
        rating: 5.0,
        image: "/images/events/default-event.jpg",
      },
      {
        id: 10,
        name: "Étoile De Mer",
        type: "Rooftop Sea-View",
        city: "North Lebanon",
        area: "Tripoli",
        rating: 4.0,
        image: "/images/events/default-event.jpg",
      },
    ];
  }, []);

  const filteredEvents =
    selectedRegion === "All Regions"
      ? eventVenues
      : eventVenues.filter((item) => item.city === selectedRegion);

  return (
    <div className="events-page">
      <div className="events-container">
        <button
          type="button"
          className="events-back-btn"
          onClick={() => navigate(isGuest ? "/guest" : "/user")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="events-title">Events Venues</h1>

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

        <p className="found-count">{filteredEvents.length} venues found</p>

        <div className="events-list">
          {filteredEvents.map((venue) => (
            <div key={venue.id} className="event-card">
              <div className="event-image-box">
                <img
                  src={venue.image}
                  alt={venue.name}
                  onError={(e) => {
                    e.target.src = "/images/events/default-event.jpg";
                  }}
                />
              </div>

              <div className="event-info">
                <h3>{venue.name}</h3>
                <p>{venue.type}</p>
                <span>
                  {venue.city} - {venue.area}
                </span>

                <div className="event-actions">
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
          category: "Event Venue",
          description: venue.type,
          address: `${venue.area}, ${venue.city}`,
          phone: "+961 70 333 333",
          instagram: "@eventvenue",
          whatsapp: "+96170333333",
          hours: "10:00 AM - 12:00 AM",
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

              <div className="event-rating">
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
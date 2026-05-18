import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronDown, Star } from "lucide-react";
import axios from "axios";
import "./Restaurants.css";

const DEFAULT_IMAGE = "/images/events/default-event.jpg";

function normalizeEventType(item) {
  return item.type || item.event_type || item.style_type || "Event";
}

export default function EventsVenues() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || false;

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedType, setSelectedType] = useState("All");
  const [eventVenues, setEventVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeOptions = [
    { name: "All", icon: "🎉" },
    { name: "Conference", icon: "🧑‍💼" },
    { name: "Birthday", icon: "🎂" },
    { name: "Corporate", icon: "🏢" },
    { name: "Graduation", icon: "🎓" },
    { name: "Outdoor", icon: "🌤️" },
    { name: "Indoor", icon: "🏠" },
    { name: "Concert", icon: "🎤" },
    { name: "Exhibition", icon: "🖼️" },
  ];

  useEffect(() => {
    fetchEventVenues();
  }, []);

  const fetchEventVenues = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/event-venues"
      );

      setEventVenues(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching event venues:", error);
      setEventVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEventVenues = useMemo(() => {
    return eventVenues.filter((item) => {
      const itemType = normalizeEventType(item);

      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesType =
        selectedType === "All" || itemType === selectedType;

      return matchesRegion && matchesType;
    });
  }, [eventVenues, selectedRegion, selectedType]);

  const openEventBooking = (eventVenue) => {
    const eventType = normalizeEventType(eventVenue);

    navigate("/book-event-venue", {
      state: {
        venue: {
          ...eventVenue,
          category: "Event",
          type: eventType,
          event_type: eventType,
          description: eventType,
          address:
            eventVenue.address ||
            `${eventVenue.area || ""}, ${eventVenue.city || ""}`,
          phone: eventVenue.phone || "+961 70 333 333",
          instagram: eventVenue.instagram || "@eventvenue",
          whatsapp: eventVenue.whatsapp || "+96170333333",
          hours: eventVenue.hours || "Open all day",
          google_maps_link: eventVenue.google_maps_link || "",
          image:
            typeof eventVenue.image === "string" && eventVenue.image.trim()
              ? eventVenue.image.trim()
              : DEFAULT_IMAGE,
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
          onClick={() => navigate(isGuest ? "/guest" : "/user")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="restaurants-title">Events Venues</h1>

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
          {typeOptions.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`cuisine-card ${
                selectedType === item.name ? "active-cuisine" : ""
              }`}
              onClick={() => setSelectedType(item.name)}
            >
              <div className="cuisine-icon-circle">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <p className="found-count">
          {loading
            ? "Loading event venues..."
            : `${filteredEventVenues.length} venues found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredEventVenues.length === 0 && (
            <div className="no-results-box">
              No event venues found for this filter.
            </div>
          )}

          {filteredEventVenues.map((eventVenue) => {
            const eventType = normalizeEventType(eventVenue);

            return (
              <div key={eventVenue.id} className="restaurant-card">
                <div className="restaurant-image-box">
                  <img
                    src={
                      typeof eventVenue.image === "string" &&
                      eventVenue.image.trim()
                        ? eventVenue.image.trim()
                        : DEFAULT_IMAGE
                    }
                    alt={eventVenue.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>

                <div className="restaurant-info">
                  <h3>{eventVenue.name}</h3>

                  <p>{eventType}</p>

                  <span>
                    {eventVenue.city} - {eventVenue.area}
                  </span>

                  <div className="restaurant-actions">
                    {isGuest ? (
                      <p className="guest-msg">Login to reserve</p>
                    ) : (
                      <button
                        type="button"
                        className="book-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEventBooking(eventVenue);
                        }}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>

                <div className="restaurant-rating">
                  <Star size={20} fill="#a1773f" color="#a1773f" />
                  <span>{eventVenue.rating || 4.5}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
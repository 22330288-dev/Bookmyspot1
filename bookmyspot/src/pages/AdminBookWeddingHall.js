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
import "./CreateRestaurantMap.css";

export default function AdminBookWeddingHall() {
  const navigate = useNavigate();
  const location = useLocation();

  const venueFromState = location.state?.venue || null;

  const [venue, setVenue] = useState(venueFromState);
  const [selectedTable, setSelectedTable] = useState(null);

  const [guests, setGuests] = useState(50);
  const [preferredTime, setPreferredTime] = useState("19:00");
  const [duration, setDuration] = useState("4 hours");

  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [mapLayout, setMapLayout] = useState([]);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (!venueFromState?.id) return;

    const fetchVenueDetails = async () => {
      try {
        setLoadingVenue(true);

        const response = await axios.get(
          `http://localhost:5000/api/wedding-halls/${venueFromState.id}`
        );

        setVenue({
          ...response.data,
          category: "Wedding Hall",
          type: "wedding_hall",
          description: response.data?.style_type || "Wedding Hall",
          address: `${response.data?.area || ""}, ${response.data?.city || ""}`,
        });
      } catch (error) {
        console.error("Failed to fetch wedding hall details:", error);
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchVenueDetails();
  }, [venueFromState]);

  useEffect(() => {
    if (!venue?.id) return;

    const fetchSections = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/wedding-options/${venue.id}/sections`
        );

        const data = Array.isArray(response.data) ? response.data : [];
        setSections(data);

        if (data.length > 0) {
          setSectionId(String(data[0].id));
          setSectionName(data[0].section_name || "");
        } else {
          setSectionId("");
          setSectionName("");
        }
      } catch (error) {
        console.error("Failed to fetch wedding hall sections:", error);
        setSections([]);
        setSectionId("");
        setSectionName("");
      }
    };

    fetchSections();
  }, [venue?.id]);

  useEffect(() => {
    setSelectedTable(null);
  }, [sectionId]);

  useEffect(() => {
    if (!venue?.id || !sectionId) {
      setMapLayout([]);
      return;
    }

    const fetchMapLayout = async () => {
      try {
        setLoadingMap(true);

        const response = await axios.get(
          `http://localhost:5000/api/wedding-options/${venue.id}/layout/${sectionId}`
        );

        const mapData = Array.isArray(response.data?.map)
          ? response.data.map
          : [];

        setMapLayout(mapData);
      } catch (error) {
        console.error("Failed to fetch wedding hall map layout:", error);
        setMapLayout([]);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchMapLayout();
  }, [venue?.id, sectionId]);

  const mapItems = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => {
      const type = item.type || item.item_type || "round-table";
      const id = item.id || `item-${index}`;

      return {
        ...item,
        id,
        type,
        x: Number(item.x || 100),
        y: Number(item.y || 100),
        width: Number(item.width || 90),
        height: Number(item.height || 90),
        rotation: Number(item.rotation || 0),
        seats: Number(item.seats || 0),
        isTable: ["round-table", "rect-table"].includes(type),
      };
    });
  }, [mapLayout]);

  const handleItemClick = (item) => {
    if (!item.isTable) return;
    setSelectedTable(item);
  };

  const handleSectionChange = (e) => {
    const selectedId = e.target.value;
    const foundSection = sections.find(
      (item) => String(item.id) === String(selectedId)
    );

    setSectionId(selectedId);
    setSectionName(foundSection?.section_name || "");
  };

  const handleCreateMap = () => {
    if (!venue?.id) {
      alert("Wedding hall not found.");
      return;
    }

    if (!sectionId) {
      alert("Please select a section first.");
      return;
    }

    navigate("/create-wedding-hall-map", {
      state: {
        venue,
        sectionId,
        sectionName,
        existingMap: mapLayout,
      },
    });
  };

  const renderMapItemContent = (item) => {
    switch (item.type) {
      case "round-table":
      case "rect-table":
        return item.seats || "";
      case "window":
        return "Window";
      case "door":
        return "Door";
      case "pool":
        return "Pool";
      case "plant":
        return "Plant";
      case "dance-floor":
        return "Dance Floor";
      case "bride-groom-stage":
        return "Bride & Groom";
      default:
        return "";
    }
  };

  if (!venue && loadingVenue) {
    return <div className="book-page">Loading wedding hall...</div>;
  }

  if (!venue) {
    return <div className="book-page">Wedding hall not found.</div>;
  }

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
            onClick={() => navigate("/admin-wedding-halls")}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="book-info-card">
          <h1>{venue.name}</h1>

          <p className="book-type">
            Wedding Hall • {venue.style_type || venue.description || "Wedding Hall"}
          </p>

          <div className="book-info-row">
            <MapPin size={18} />
            <span>
              {venue.address || `${venue.area || ""}, ${venue.city || ""}`}
            </span>
          </div>

          <div className="book-info-row">
            <Clock3 size={18} />
            <span>{venue.hours || "Open all day"}</span>
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
              href={`https://instagram.com/${(venue.instagram || "").replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <Camera size={20} />
              <span>Instagram</span>
            </a>

            {venue.google_maps_link && (
              <a
                href={venue.google_maps_link}
                target="_blank"
                rel="noreferrer"
                className="contact-btn"
              >
                <MapPin size={20} />
                <span>View on Map</span>
              </a>
            )}
          </div>
        </div>

        <div className="reservation-details-card section-top-card">
          <label className="reserve-label">
            <MapPin size={18} />
            <span>Select Section</span>
          </label>

          <select
            value={sectionId}
            onChange={handleSectionChange}
            className="book-input"
          >
            <option value="">Select Section</option>
            {sections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.section_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="create-seats-btn"
            onClick={handleCreateMap}
            style={{ marginTop: "16px" }}
          >
            <PencilRuler size={18} />
            <span>Create Map</span>
          </button>
        </div>

        <div className="table-map-card">
          <h2>Current Wedding Hall Map</h2>

          <p className="table-legend">
            <span className="legend-item">
              Current Section: <strong>{sectionName || "Not selected"}</strong>
            </span>
          </p>

          <div className="admin-floor-map">
            {loadingMap ? (
              <p className="no-map-message">Loading map...</p>
            ) : mapItems.length === 0 ? (
              <p className="no-map-message">
                No map available for this section yet.
              </p>
            ) : (
              mapItems.map((item) => (
                <div
                  key={item.id}
                  className={`admin-map-item ${item.type} ${
                    selectedTable?.id === item.id ? "selected-admin-item" : ""
                  } ${item.isTable ? "clickable-item" : ""}`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation || 0}deg)`,
                  }}
                  onClick={() => handleItemClick(item)}
                  title={item.label || item.type}
                >
                  {renderMapItemContent(item)}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="reservation-details-card">
          <h2>Preview Hall Setup</h2>

          <label className="reserve-label">
            <Users size={18} />
            <span>Expected Guests</span>
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
            <option>2 hours</option>
            <option>3 hours</option>
            <option>4 hours</option>
            <option>5 hours</option>
            <option>6 hours</option>
          </select>

          <div className="selected-info">
            {selectedTable ? (
              <>
                <p>
                  Selected Table: <strong>{selectedTable.type}</strong>
                </p>
                <p>
                  Table Capacity: <strong>{selectedTable.seats}</strong>
                </p>
                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>
                <p>
                  Preferred Time: <strong>{preferredTime}</strong>
                </p>
                <p>
                  Duration: <strong>{duration}</strong>
                </p>
              </>
            ) : (
              <>
                <p>No table selected yet.</p>
                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
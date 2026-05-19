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

const MAP_API = `${process.env.REACT_APP_API_URL}/api/cafe-layouts`;

export default function AdminBookCafe() {
  const navigate = useNavigate();
  const location = useLocation();

  const venueFromState = location.state?.venue || null;

  const [venue, setVenue] = useState(venueFromState);
  const [selectedItem, setSelectedItem] = useState(null);

  const [guests, setGuests] = useState(2);
  const [preferredTime, setPreferredTime] = useState("19:00");
  const [duration, setDuration] = useState("1 hour");

  const [sections, setSections] = useState([]);
  const [areas, setAreas] = useState([]);

  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [areaId, setAreaId] = useState("");
  const [areaName, setAreaName] = useState("");

  const [mapLayout, setMapLayout] = useState([]);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (!venueFromState?.id) return;

    const fetchCafeDetails = async () => {
      try {
        setLoadingVenue(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cafes/${venueFromState.id}`
        );

        setVenue({
          ...response.data,
          category: "Cafe",
          type: "cafe",
        });
      } catch (error) {
        console.error("Failed to fetch cafe details:", error);
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchCafeDetails();
  }, [venueFromState]);

  useEffect(() => {
    if (!venue?.id) return;

    const fetchSections = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cafe-options/${venue.id}/sections`
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
        console.error("Failed to fetch cafe sections:", error);
        setSections([]);
        setSectionId("");
        setSectionName("");
      }
    };

    fetchSections();
  }, [venue?.id]);

  useEffect(() => {
    if (!venue?.id || !sectionId) {
      setAreas([]);
      setAreaId("");
      setAreaName("");
      return;
    }

    const fetchAreas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cafe-options/${venue.id}/admin-areas/${sectionId}`
        );

        const data = Array.isArray(response.data) ? response.data : [];
        setAreas(data);

        if (data.length > 0) {
          setAreaId(String(data[0].id));
          setAreaName(data[0].area_name || "");
        } else {
          setAreaId("");
          setAreaName("");
        }
      } catch (error) {
        console.error("Failed to fetch cafe areas:", error);
        setAreas([]);
        setAreaId("");
        setAreaName("");
      }
    };

    fetchAreas();
  }, [venue?.id, sectionId]);

  useEffect(() => {
    setSelectedItem(null);
  }, [sectionId, areaId]);

  useEffect(() => {
    if (!venue?.id || !sectionId || !areaId) {
      setMapLayout([]);
      return;
    }

    const fetchMapLayout = async () => {
      try {
        setLoadingMap(true);

        const response = await axios.get(MAP_API, {
          params: {
            venue_id: venue.id,
            section_id: sectionId,
            area_id: areaId,
          },
        });

        const mapData = Array.isArray(response.data) ? response.data : [];
        setMapLayout(mapData);
      } catch (error) {
        console.error("Failed to fetch cafe map layout:", error);
        setMapLayout([]);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchMapLayout();
  }, [venue?.id, sectionId, areaId]);

  const items = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => ({
      id: item.id ?? index + 1,
      type: item.item_type || item.type || "round-table",
      label: item.label || "",
      x: typeof item.x === "number" ? item.x : 100,
      y: typeof item.y === "number" ? item.y : 100,
      width: typeof item.width === "number" ? item.width : 90,
      height: typeof item.height === "number" ? item.height : 90,
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      seats:
        typeof item.seats_count === "number"
          ? item.seats_count
          : typeof item.seats === "number"
          ? item.seats
          : 0,
      isReservable:
        typeof item.is_reservable === "number"
          ? item.is_reservable
          : ["round-table", "rect-table", "square-table", "chair", "sofa"].includes(
              item.item_type || item.type
            )
          ? 1
          : 0,
    }));
  }, [mapLayout]);

  const handleItemClick = (item) => {
    if (item.isReservable !== 1) return;
    setSelectedItem(item);
  };

  const handleSectionChange = (e) => {
    const selectedId = e.target.value;
    const foundSection = sections.find(
      (item) => String(item.id) === String(selectedId)
    );

    setSectionId(selectedId);
    setSectionName(foundSection?.section_name || "");
  };

  const handleAreaChange = (e) => {
    const selectedId = e.target.value;
    const foundArea = areas.find(
      (item) => String(item.id) === String(selectedId)
    );

    setAreaId(selectedId);
    setAreaName(foundArea?.area_name || "");
  };

  const handleCreateMap = () => {
    if (!venue?.id) {
      alert("Cafe not found.");
      return;
    }

    if (!sectionId) {
      alert("Please select a section first.");
      return;
    }

    if (!areaId) {
      alert("Please select an area first.");
      return;
    }

    navigate("/create-cafe-map", {
      state: {
        venue,
        sectionId,
        sectionName,
        areaId,
        areaName,
      },
    });
  };

  const renderMapItemContent = (item) => {
    switch (item.type) {
      case "window":
        return "Window";
      case "door":
        return "Door";
      case "bar":
        return "Bar";
      case "pool":
        return "Pool";
      case "sofa":
        return "Sofa";
      case "plant":
        return "Plant";
      default:
        return null;
    }
  };

  if (!venue && loadingVenue) {
    return <div className="book-page">Loading cafe...</div>;
  }

  if (!venue) {
    return <div className="book-page">Cafe not found.</div>;
  }

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={venue.image || "/images/cafes/default-cafe.jpg"}
            alt={venue.name}
            onError={(e) => {
              e.target.src = "/images/cafes/default-cafe.jpg";
            }}
          />

          <button
            type="button"
            className="book-back-btn"
            onClick={() => navigate("/admin-cafes")}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="book-info-card">
          <h1>{venue.name}</h1>

          <p className="book-type">
            Cafe • {venue.cuisine || venue.description || "Cafe"}
          </p>

          <div className="book-info-row">
            <MapPin size={18} />
            <span>
              {venue.address || `${venue.area || ""}, ${venue.city || ""}`}
            </span>
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

          <label className="reserve-label">
            <Users size={18} />
            <span>Select Area</span>
          </label>

          <select
            value={areaId}
            onChange={handleAreaChange}
            className="book-input"
            disabled={!sectionId}
          >
            <option value="">Select Area</option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.area_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="create-seats-btn"
            onClick={handleCreateMap}
          >
            <PencilRuler size={18} />
            <span>Create Map</span>
          </button>
        </div>

        <div className="table-map-card">
          <h2>Current Cafe Map</h2>

          <p className="table-legend">
            <span className="legend-item">
              Current Section: <strong>{sectionName || "Not selected"}</strong>
            </span>

            <span className="legend-item">
              Current Area: <strong>{areaName || "Not selected"}</strong>
            </span>
          </p>

          <div className="admin-floor-map">
            {loadingMap ? (
              <p className="no-map-message">Loading map...</p>
            ) : items.length === 0 ? (
              <p className="no-map-message">
                No cafe map available for this section and area yet.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`admin-map-item ${item.type} ${
                    selectedItem?.id === item.id ? "selected-admin-item" : ""
                  } ${item.isReservable === 1 ? "clickable-item" : ""}`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation || 0}deg)`,
                  }}
                  onClick={() => handleItemClick(item)}
                  title={
                    item.isReservable === 1
                      ? `${item.type} ${item.id}`
                      : item.label || item.type
                  }
                >
                  {renderMapItemContent(item)}
                </div>
              ))
            )}
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

          <div className="selected-info">
            {selectedItem ? (
              <>
                <p>
                  Selected Item: <strong>{selectedItem.type}</strong>
                </p>
                <p>
                  Item ID: <strong>{selectedItem.id}</strong>
                </p>
                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>
                <p>
                  Area: <strong>{areaName || "Not selected"}</strong>
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
                <p>No reservable table/chair selected yet.</p>
                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>
                <p>
                  Area: <strong>{areaName || "Not selected"}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

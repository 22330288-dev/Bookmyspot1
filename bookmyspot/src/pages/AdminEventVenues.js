import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Star,
  Plus,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import "./AdminRestaurants.css";

const DEFAULT_IMAGE = "/images/events/default-event.jpg";

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  try {
    const url = new URL(raw);
    const googleImageUrl = url.searchParams.get("imgurl");

    if (googleImageUrl) {
      return decodeURIComponent(googleImageUrl);
    }

    return raw;
  } catch {
    return raw;
  }
}

function getDisplayImage(value) {
  return normalizeImageUrl(value) || DEFAULT_IMAGE;
}

export default function AdminEventVenues() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedEventType, setSelectedEventType] = useState("All");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  const [newEventType, setNewEventType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [locationParentRegion, setLocationParentRegion] =
    useState("North Lebanon");

  const [editingEvent, setEditingEvent] = useState(null);
  const [eventVenues, setEventVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [eventTypeOptions, setEventTypeOptions] = useState([
    { name: "All", icon: "🎉" },
    { name: "Conference", icon: "🧑‍💼" },
    { name: "Birthday", icon: "🎂" },
    { name: "Corporate", icon: "🏢" },
    { name: "Graduation", icon: "🎓" },
    { name: "Outdoor", icon: "🌤️" },
    { name: "Indoor", icon: "🏠" },
    { name: "Concert", icon: "🎤" },
    { name: "Exhibition", icon: "🖼️" },
  ]);

  const [locationsByRegion, setLocationsByRegion] = useState({
    Beirut: [
      "Gemmayze",
      "Downtown",
      "Hamra",
      "Ashrafieh",
      "Corniche",
      "Zaitunay Bay",
      "Minet El Hosn",
      "Ain El Mreisseh",
    ],
    Bekaa: [
      "Zahle",
      "Anjar",
      "Qob Elias",
      "Haouch Al Oumara",
      "Taanayel",
      "Chtoura",
      "Jalala",
      "Saghbin",
      "Bar Elias",
    ],
    "South Lebanon": [
      "Tyre",
      "Saida",
      "Tyre Port",
      "Sidon",
      "Nabatieh",
      "Jnob Region",
    ],
    "North Lebanon": [
      "Tripoli",
      "Mina/Tripoli",
      "Old Souk/Tripoli",
      "Mina Port",
      "Zgharta",
      "Bcharri",
      "Qartawba",
      "Batroun",
    ],
  });

  const [eventForm, setEventForm] = useState({
    name: "",
    type: "Conference",
    city: "Beirut",
    area: "Gemmayze",
    rating: 4.5,
    image: "",
    phone: "",
    instagram: "",
    whatsapp: "",
    hours: "",
    google_maps_link: "",
  });

  useEffect(() => {
    fetchEventVenues();
  }, []);

  const fetchEventVenues = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/event-venues"
      );

      const data = Array.isArray(response.data) ? response.data : [];
      setEventVenues(data);
    } catch (error) {
      console.error("Error fetching event venues:", error);
      setEventVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEventVenues = useMemo(() => {
    return eventVenues.filter((item) => {
      const itemType = item.type || item.event_type || item.style_type || "";

      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesType =
        selectedEventType === "All" || itemType === selectedEventType;

      return matchesRegion && matchesType;
    });
  }, [eventVenues, selectedRegion, selectedEventType]);

  const currentLocations =
    selectedRegion !== "All Regions"
      ? locationsByRegion[selectedRegion] || []
      : [];

  const toggleEventSelection = (id) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteEventVenue = async (id) => {
    const confirmDelete = window.confirm("Delete this event venue?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/event-venues/${id}`);
      setSelectedEvents((prev) => prev.filter((item) => item !== id));
      fetchEventVenues();
    } catch (error) {
      console.error("Delete event venue error:", error);
      alert("Failed to delete event venue.");
    }
  };

  const deleteSelectedEvents = async () => {
    if (selectedEvents.length === 0) {
      alert("Please select event venues first.");
      return;
    }

    const confirmDelete = window.confirm("Delete selected event venues?");
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedEvents.map((id) =>
          axios.delete(`http://localhost:5000/api/event-venues/${id}`)
        )
      );

      setSelectedEvents([]);
      fetchEventVenues();
    } catch (error) {
      console.error("Delete selected event venues error:", error);
      alert("Failed to delete selected event venues.");
    }
  };

  const openAddEvent = () => {
    setEditingEvent(null);

    setEventForm({
      name: "",
      type:
        selectedEventType !== "All" ? selectedEventType : "Conference",
      city: selectedRegion !== "All Regions" ? selectedRegion : "Beirut",
      area:
        selectedRegion !== "All Regions"
          ? locationsByRegion[selectedRegion]?.[0] || ""
          : "Gemmayze",
      rating: 4.5,
      image: "",
      phone: "",
      instagram: "",
      whatsapp: "",
      hours: "",
      google_maps_link: "",
    });

    setShowAddEventModal(true);
  };

  const openEditEvent = (eventVenue) => {
    setEditingEvent(eventVenue);

    setEventForm({
      name: eventVenue.name || "",
      type:
        eventVenue.type ||
        eventVenue.event_type ||
        eventVenue.style_type ||
        "Conference",
      city: eventVenue.city || "Beirut",
      area: eventVenue.area || "",
      rating: eventVenue.rating || 4.5,
      image: eventVenue.image || "",
      phone: eventVenue.phone || "",
      instagram: eventVenue.instagram || "",
      whatsapp: eventVenue.whatsapp || "",
      hours: eventVenue.hours || "",
      google_maps_link: eventVenue.google_maps_link || "",
    });

    setShowAddEventModal(true);
  };

  const saveEventVenue = async () => {
    if (
      !eventForm.name ||
      !eventForm.type ||
      !eventForm.city ||
      !eventForm.area
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ...eventForm,
        event_type: eventForm.type,
        rating: Number(eventForm.rating),
        image: normalizeImageUrl(eventForm.image) || DEFAULT_IMAGE,
        google_maps_link: eventForm.google_maps_link || "",
      };

      if (editingEvent) {
        await axios.put(
          `http://localhost:5000/api/event-venues/${editingEvent.id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/event-venues", payload);
      }

      setShowAddEventModal(false);
      setEditingEvent(null);
      fetchEventVenues();
    } catch (error) {
      console.error("Save event venue error:", error);
      alert("Failed to save event venue.");
    }
  };

  const addEventType = () => {
    if (!newEventType.trim()) {
      alert("Enter event type.");
      return;
    }

    const exists = eventTypeOptions.some(
      (item) =>
        item.name.toLowerCase() === newEventType.trim().toLowerCase()
    );

    if (exists) {
      alert("Event type already exists.");
      return;
    }

    setEventTypeOptions((prev) => [
      ...prev,
      { name: newEventType.trim(), icon: "🎉" },
    ]);

    setNewEventType("");
    setShowAddTypeModal(false);
  };

  const addLocation = () => {
    if (!newLocation.trim()) {
      alert("Enter location name.");
      return;
    }

    const exists = (locationsByRegion[locationParentRegion] || []).some(
      (item) => item.toLowerCase() === newLocation.trim().toLowerCase()
    );

    if (exists) {
      alert("Location already exists.");
      return;
    }

    setLocationsByRegion((prev) => ({
      ...prev,
      [locationParentRegion]: [
        ...(prev[locationParentRegion] || []),
        newLocation.trim(),
      ],
    }));

    setNewLocation("");
    setShowAddLocationModal(false);
  };

  return (
    <div className="restaurants-page">
      <div className="restaurants-container">
        <button
          type="button"
          className="restaurants-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>

        <h1 className="restaurants-title">Manage Event Venues</h1>

        <div className="admin-actions-top">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => {
              setIsSelectMode((prev) => !prev);
              setSelectedEvents([]);
            }}
          >
            {isSelectMode ? <CheckSquare size={18} /> : <Square size={18} />}
            <span>Select</span>
          </button>

          <button
            type="button"
            className="admin-action-btn add-btn"
            onClick={openAddEvent}
          >
            <Plus size={18} />
            <span>Add Event Venue</span>
          </button>

          {isSelectMode && (
            <button
              type="button"
              className="admin-action-btn delete-btn"
              onClick={deleteSelectedEvents}
            >
              <Trash2 size={18} />
              <span>Delete Selected</span>
            </button>
          )}
        </div>

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

        {selectedRegion !== "All Regions" && (
          <div className="admin-locations-box">
            <h3>{selectedRegion} Locations</h3>

            <div className="location-tags">
              {currentLocations.map((locationItem, index) => (
                <span key={index} className="location-tag">
                  {locationItem}
                </span>
              ))}

              <button
                type="button"
                className="location-add-tag"
                onClick={() => {
                  setLocationParentRegion(selectedRegion);
                  setShowAddLocationModal(true);
                }}
              >
                + Add Location
              </button>
            </div>
          </div>
        )}

        <div className="cuisine-scroll">
          {eventTypeOptions.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`cuisine-card ${
                selectedEventType === item.name ? "active-cuisine" : ""
              }`}
              onClick={() => setSelectedEventType(item.name)}
            >
              <div className="cuisine-icon-circle">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}

          <button
            type="button"
            className="cuisine-card"
            onClick={() => setShowAddTypeModal(true)}
          >
            <div className="cuisine-icon-circle add-cuisine-circle">
              <Plus size={28} />
            </div>
            <span>Add</span>
          </button>
        </div>

        {selectedEventType !== "All" && (
          <div className="admin-cuisine-bar">
            <span>
              Event type selected: <strong>{selectedEventType}</strong>
            </span>

            <button
              type="button"
              className="small-add-btn"
              onClick={openAddEvent}
            >
              + Add {selectedEventType} Event Venue
            </button>
          </div>
        )}

        <p className="found-count">
          {loading
            ? "Loading event venues..."
            : `${filteredEventVenues.length} event venues found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredEventVenues.length === 0 && (
            <div className="no-results-box">No event venues found.</div>
          )}

          {filteredEventVenues.map((eventVenue) => {
            const displayType =
              eventVenue.type ||
              eventVenue.event_type ||
              eventVenue.style_type ||
              "Event";

            return (
              <div
                key={eventVenue.id}
                className={`restaurant-card admin-restaurant-card ${
                  selectedEvents.includes(eventVenue.id)
                    ? "selected-card"
                    : ""
                }`}
                onClick={() => {
                  if (isSelectMode) {
                    toggleEventSelection(eventVenue.id);
                  } else {
                    navigate("/admin-book-event-venue", {
                      state: {
                        venue: {
                          ...eventVenue,
                          type: displayType,
                          event_type: displayType,
                          category: "Event",
                          description: displayType,
                          address:
                            eventVenue.address ||
                            `${eventVenue.area || ""}, ${eventVenue.city || ""}`,
                        },
                      },
                    });
                  }
                }}
              >
                {isSelectMode && (
                  <div className="admin-select-check">
                    {selectedEvents.includes(eventVenue.id) ? "✓" : ""}
                  </div>
                )}

                <div className="restaurant-image-box">
                  <img
                    src={getDisplayImage(eventVenue.image)}
                    alt={eventVenue.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>

                <div className="restaurant-info">
                  <h3>{eventVenue.name}</h3>
                  <p>{displayType}</p>

                  <span>
                    {eventVenue.city} - {eventVenue.area}
                  </span>

                  {eventVenue.google_maps_link && (
                    <p className="restaurant-map-link-preview">
                      Map link added
                    </p>
                  )}

                  <div className="admin-card-buttons">
                    <button
                      type="button"
                      className="edit-small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEvent(eventVenue);
                      }}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEventVenue(eventVenue.id);
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="restaurant-rating">
                  <Star size={20} fill="#a1773f" color="#a1773f" />
                  <span>{eventVenue.rating}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddEventModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {editingEvent ? "Edit Event Venue" : "Add Event Venue"}
              </h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setShowAddEventModal(false);
                  setEditingEvent(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Event Venue Name"
                value={eventForm.name}
                onChange={(e) =>
                  setEventForm({ ...eventForm, name: e.target.value })
                }
              />

              <select
                value={eventForm.type}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    type: e.target.value,
                  })
                }
              >
                {eventTypeOptions
                  .filter((item) => item.name !== "All")
                  .map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </select>

              <select
                value={eventForm.city}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    city: e.target.value,
                    area: locationsByRegion[e.target.value]?.[0] || "",
                  })
                }
              >
                <option value="Beirut">Beirut</option>
                <option value="Bekaa">Bekaa</option>
                <option value="South Lebanon">South Lebanon</option>
                <option value="North Lebanon">North Lebanon</option>
              </select>

              <select
                value={eventForm.area}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    area: e.target.value,
                  })
                }
              >
                {(locationsByRegion[eventForm.city] || []).map((areaItem) => (
                  <option key={areaItem} value={areaItem}>
                    {areaItem}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={eventForm.rating}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    rating: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Paste direct image URL from Google / website"
                value={eventForm.image}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    image: e.target.value,
                  })
                }
              />

              <div className="image-url-preview-box">
                <img
                  src={getDisplayImage(eventForm.image)}
                  alt="Event venue preview"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <span>Image preview</span>
              </div>

              <input
                type="text"
                placeholder="Phone"
                value={eventForm.phone}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Instagram"
                value={eventForm.instagram}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    instagram: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="WhatsApp"
                value={eventForm.whatsapp}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    whatsapp: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Hours"
                value={eventForm.hours}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    hours: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Paste Google Maps link"
                value={eventForm.google_maps_link}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    google_maps_link: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={saveEventVenue}
              >
                {editingEvent ? "Save Changes" : "Add Event Venue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTypeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-modal">
            <div className="admin-modal-header">
              <h2>Add Event Type</h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddTypeModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Enter event type"
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value)}
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={addEventType}
              >
                Add Type
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddLocationModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-modal">
            <div className="admin-modal-header">
              <h2>Add Location</h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddLocationModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <select
                value={locationParentRegion}
                onChange={(e) => setLocationParentRegion(e.target.value)}
              >
                <option value="Beirut">Beirut</option>
                <option value="Bekaa">Bekaa</option>
                <option value="South Lebanon">South Lebanon</option>
                <option value="North Lebanon">North Lebanon</option>
              </select>

              <input
                type="text"
                placeholder="Enter location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={addLocation}
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
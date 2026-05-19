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

const DEFAULT_IMAGE = "/images/beirut/default-restaurant.jpg";

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

export default function AdminWeddingHalls() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedHalls, setSelectedHalls] = useState([]);

  const [showAddHallModal, setShowAddHallModal] = useState(false);
  const [showAddStyleModal, setShowAddStyleModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  const [newStyle, setNewStyle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [locationParentRegion, setLocationParentRegion] =
    useState("North Lebanon");

  const [editingHall, setEditingHall] = useState(null);
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [styleOptions, setStyleOptions] = useState([
    { name: "All", icon: "💍" },
    { name: "Luxury", icon: "✨" },
    { name: "Classic", icon: "🏛️" },
    { name: "Garden", icon: "🌿" },
    { name: "Modern", icon: "💎" },
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
      "Faitroun",
      "Bikfaiya",
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

  const [hallForm, setHallForm] = useState({
    name: "",
    style_type: "Luxury",
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
    fetchWeddingHalls();
  }, []);

  const fetchWeddingHalls = async () => {
    try {
      setLoading(true);
      const response = await axios.get("${process.env.REACT_APP_API_URL}/api/wedding-halls");
      const data = Array.isArray(response.data) ? response.data : [];
      setWeddingHalls(data);
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

  const currentLocations =
    selectedRegion !== "All Regions"
      ? locationsByRegion[selectedRegion] || []
      : [];

  const toggleHallSelection = (id) => {
    setSelectedHalls((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteHall = async (id) => {
    const confirmDelete = window.confirm("Delete this wedding hall?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/wedding-halls/${id}`);
      setSelectedHalls((prev) => prev.filter((item) => item !== id));
      fetchWeddingHalls();
    } catch (error) {
      console.error("Delete wedding hall error:", error);
      alert("Failed to delete wedding hall.");
    }
  };

  const deleteSelectedHalls = async () => {
    if (selectedHalls.length === 0) {
      alert("Please select wedding halls first.");
      return;
    }

    const confirmDelete = window.confirm("Delete selected wedding halls?");
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedHalls.map((id) =>
          axios.delete(`${process.env.REACT_APP_API_URL}/api/wedding-halls/${id}`)
        )
      );

      setSelectedHalls([]);
      fetchWeddingHalls();
    } catch (error) {
      console.error("Delete selected wedding halls error:", error);
      alert("Failed to delete selected wedding halls.");
    }
  };

  const openAddHall = () => {
    setEditingHall(null);
    setHallForm({
      name: "",
      style_type: selectedStyle !== "All" ? selectedStyle : "Luxury",
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
    setShowAddHallModal(true);
  };

  const openEditHall = (hall) => {
    setEditingHall(hall);
    setHallForm({
      name: hall.name || "",
      style_type: hall.style_type || "Luxury",
      city: hall.city || "Beirut",
      area: hall.area || "",
      rating: hall.rating || 4.5,
      image: hall.image || "",
      phone: hall.phone || "",
      instagram: hall.instagram || "",
      whatsapp: hall.whatsapp || "",
      hours: hall.hours || "",
      google_maps_link: hall.google_maps_link || "",
    });
    setShowAddHallModal(true);
  };

  const saveHall = async () => {
    if (!hallForm.name || !hallForm.style_type || !hallForm.city || !hallForm.area) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ...hallForm,
        rating: Number(hallForm.rating),
        image: normalizeImageUrl(hallForm.image) || DEFAULT_IMAGE,
        google_maps_link: hallForm.google_maps_link || "",
      };

      if (editingHall) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/wedding-halls/${editingHall.id}`,
          payload
        );
      } else {
        await axios.post("${process.env.REACT_APP_API_URL}/api/wedding-halls", payload);
      }

      setShowAddHallModal(false);
      setEditingHall(null);
      fetchWeddingHalls();
    } catch (error) {
      console.error("Save wedding hall error:", error);
      alert("Failed to save wedding hall.");
    }
  };

  const addStyle = () => {
    if (!newStyle.trim()) {
      alert("Enter style name.");
      return;
    }

    const exists = styleOptions.some(
      (item) => item.name.toLowerCase() === newStyle.trim().toLowerCase()
    );

    if (exists) {
      alert("Style already exists.");
      return;
    }

    setStyleOptions((prev) => [...prev, { name: newStyle.trim(), icon: "💍" }]);

    setNewStyle("");
    setShowAddStyleModal(false);
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

        <h1 className="restaurants-title">Manage Wedding Halls</h1>

        <div className="admin-actions-top">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => {
              setIsSelectMode((prev) => !prev);
              setSelectedHalls([]);
            }}
          >
            {isSelectMode ? <CheckSquare size={18} /> : <Square size={18} />}
            <span>Select</span>
          </button>

          <button
            type="button"
            className="admin-action-btn add-btn"
            onClick={openAddHall}
          >
            <Plus size={18} />
            <span>Add Wedding Hall</span>
          </button>

          {isSelectMode && (
            <button
              type="button"
              className="admin-action-btn delete-btn"
              onClick={deleteSelectedHalls}
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

          <button
            type="button"
            className="cuisine-card"
            onClick={() => setShowAddStyleModal(true)}
          >
            <div className="cuisine-icon-circle add-cuisine-circle">
              <Plus size={28} />
            </div>
            <span>Add</span>
          </button>
        </div>

        {selectedStyle !== "All" && (
          <div className="admin-cuisine-bar">
            <span>
              Style selected: <strong>{selectedStyle}</strong>
            </span>

            <button
              type="button"
              className="small-add-btn"
              onClick={openAddHall}
            >
              + Add {selectedStyle} Wedding Hall
            </button>
          </div>
        )}

        <p className="found-count">
          {loading
            ? "Loading wedding halls..."
            : `${filteredWeddingHalls.length} wedding halls found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredWeddingHalls.length === 0 && (
            <div className="no-results-box">No wedding halls found.</div>
          )}

          {filteredWeddingHalls.map((hall) => (
            <div
              key={hall.id}
              className={`restaurant-card admin-restaurant-card ${
                selectedHalls.includes(hall.id) ? "selected-card" : ""
              }`}
              onClick={() => {
                if (isSelectMode) {
                  toggleHallSelection(hall.id);
                } else {
                  navigate("/admin-book-wedding-hall", {
                    state: {
                      venue: hall,
                    },
                  });
                }
              }}
            >
              {isSelectMode && (
                <div className="admin-select-check">
                  {selectedHalls.includes(hall.id) ? "✓" : ""}
                </div>
              )}

              <div className="restaurant-image-box">
                <img
                  src={getDisplayImage(hall.image)}
                  alt={hall.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{hall.name}</h3>
                <p>{hall.style_type}</p>
                <span>
                  {hall.city} - {hall.area}
                </span>

                {hall.google_maps_link && (
                  <p className="restaurant-map-link-preview">Map link added</p>
                )}

                <div className="admin-card-buttons">
                  <button
                    type="button"
                    className="edit-small-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditHall(hall);
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
                      deleteHall(hall.id);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
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

      {showAddHallModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingHall ? "Edit Wedding Hall" : "Add Wedding Hall"}</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setShowAddHallModal(false);
                  setEditingHall(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Wedding Hall Name"
                value={hallForm.name}
                onChange={(e) =>
                  setHallForm({ ...hallForm, name: e.target.value })
                }
              />

              <select
                value={hallForm.style_type}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    style_type: e.target.value,
                  })
                }
              >
                {styleOptions
                  .filter((item) => item.name !== "All")
                  .map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </select>

              <select
                value={hallForm.city}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
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
                value={hallForm.area}
                onChange={(e) =>
                  setHallForm({ ...hallForm, area: e.target.value })
                }
              >
                {(locationsByRegion[hallForm.city] || []).map((areaItem) => (
                  <option key={areaItem} value={areaItem}>
                    {areaItem}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={hallForm.rating}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    rating: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Paste direct image URL from Google / website"
                value={hallForm.image}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    image: e.target.value,
                  })
                }
              />

              <div className="image-url-preview-box">
                <img
                  src={getDisplayImage(hallForm.image)}
                  alt="Wedding hall preview"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <span>Image preview</span>
              </div>

              <input
                type="text"
                placeholder="Phone"
                value={hallForm.phone}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Instagram"
                value={hallForm.instagram}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    instagram: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="WhatsApp"
                value={hallForm.whatsapp}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    whatsapp: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Hours"
                value={hallForm.hours}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    hours: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={hallForm.google_maps_link || ""}
                onChange={(e) =>
                  setHallForm({
                    ...hallForm,
                    google_maps_link: e.target.value,
                  })
                }
                placeholder="Paste Google Maps link"
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={saveHall}
              >
                {editingHall ? "Save Changes" : "Add Wedding Hall"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStyleModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-modal">
            <div className="admin-modal-header">
              <h2>Add Style</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddStyleModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Enter style"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={addStyle}
              >
                Add Style
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

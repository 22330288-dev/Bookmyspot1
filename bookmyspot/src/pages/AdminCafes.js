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

export default function AdminCafes() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedCafes, setSelectedCafes] = useState([]);

  const [showAddCafeModal, setShowAddCafeModal] = useState(false);
  const [showAddCuisineModal, setShowAddCuisineModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  const [newCuisine, setNewCuisine] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [locationParentRegion, setLocationParentRegion] =
    useState("North Lebanon");

  const [editingCafe, setEditingCafe] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cuisineOptions, setCuisineOptions] = useState([
    { name: "All", icon: "☕" },
    { name: "Coffee", icon: "☕" },
    { name: "Desserts", icon: "🍰" },
    { name: "Bakery", icon: "🥐" },
    { name: "Ice Cream", icon: "🍨" },
    { name: "Juice", icon: "🧃" },
    { name: "Shisha", icon: "💨" },
    { name: "Snacks", icon: "🍪" },
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

  const [cafeForm, setCafeForm] = useState({
    name: "",
    cuisine: "Coffee",
    city: "Beirut",
    area: "Gemmayze",
    rating: 4.5,
    image: "",
    phone: "",
    instagram: "",
    whatsapp: "",
    hours: "",
    has_smoking: true,
    google_maps_link: "",
  });

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/cafes");
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

  const currentLocations =
    selectedRegion !== "All Regions"
      ? locationsByRegion[selectedRegion] || []
      : [];

  const toggleCafeSelection = (id) => {
    setSelectedCafes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteCafe = async (id) => {
    const confirmDelete = window.confirm("Delete this cafe?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/cafes/${id}`);
      setSelectedCafes((prev) => prev.filter((item) => item !== id));
      fetchCafes();
    } catch (error) {
      console.error("Delete cafe error:", error);
      alert("Failed to delete cafe.");
    }
  };

  const deleteSelectedCafes = async () => {
    if (selectedCafes.length === 0) {
      alert("Please select cafes first.");
      return;
    }

    const confirmDelete = window.confirm("Delete selected cafes?");
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedCafes.map((id) =>
          axios.delete(`http://localhost:5000/api/cafes/${id}`)
        )
      );

      setSelectedCafes([]);
      fetchCafes();
    } catch (error) {
      console.error("Delete selected cafes error:", error);
      alert("Failed to delete selected cafes.");
    }
  };

  const openAddCafe = () => {
    setEditingCafe(null);
    setCafeForm({
      name: "",
      cuisine: selectedCuisine !== "All" ? selectedCuisine : "Coffee",
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
      has_smoking: true,
      google_maps_link: "",
    });
    setShowAddCafeModal(true);
  };

  const openEditCafe = (cafe) => {
    setEditingCafe(cafe);
    setCafeForm({
      name: cafe.name || "",
      cuisine: cafe.cuisine || "Coffee",
      city: cafe.city || "Beirut",
      area: cafe.area || "",
      rating: cafe.rating || 4.5,
      image: cafe.image || "",
      phone: cafe.phone || "",
      instagram: cafe.instagram || "",
      whatsapp: cafe.whatsapp || "",
      hours: cafe.hours || "",
      has_smoking: !!cafe.has_smoking,
      google_maps_link: cafe.google_maps_link || "",
    });
    setShowAddCafeModal(true);
  };

  const saveCafe = async () => {
    if (!cafeForm.name || !cafeForm.cuisine || !cafeForm.city || !cafeForm.area) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ...cafeForm,
        rating: Number(cafeForm.rating),
        image: normalizeImageUrl(cafeForm.image) || DEFAULT_IMAGE,
        has_smoking: cafeForm.has_smoking,
        google_maps_link: cafeForm.google_maps_link || "",
      };

      if (editingCafe) {
        await axios.put(`http://localhost:5000/api/cafes/${editingCafe.id}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/cafes", payload);
      }

      setShowAddCafeModal(false);
      setEditingCafe(null);
      fetchCafes();
    } catch (error) {
      console.error("Save cafe error:", error);
      alert("Failed to save cafe.");
    }
  };

  const addCuisine = () => {
    if (!newCuisine.trim()) {
      alert("Enter cafe type.");
      return;
    }

    const exists = cuisineOptions.some(
      (item) => item.name.toLowerCase() === newCuisine.trim().toLowerCase()
    );

    if (exists) {
      alert("Cafe type already exists.");
      return;
    }

    setCuisineOptions((prev) => [
      ...prev,
      { name: newCuisine.trim(), icon: "☕" },
    ]);

    setNewCuisine("");
    setShowAddCuisineModal(false);
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

        <h1 className="restaurants-title">Manage Cafes</h1>

        <div className="admin-actions-top">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => {
              setIsSelectMode((prev) => !prev);
              setSelectedCafes([]);
            }}
          >
            {isSelectMode ? <CheckSquare size={18} /> : <Square size={18} />}
            <span>Select</span>
          </button>

          <button
            type="button"
            className="admin-action-btn add-btn"
            onClick={openAddCafe}
          >
            <Plus size={18} />
            <span>Add Cafe</span>
          </button>

          {isSelectMode && (
            <button
              type="button"
              className="admin-action-btn delete-btn"
              onClick={deleteSelectedCafes}
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

          <button
            type="button"
            className="cuisine-card"
            onClick={() => setShowAddCuisineModal(true)}
          >
            <div className="cuisine-icon-circle add-cuisine-circle">
              <Plus size={28} />
            </div>
            <span>Add</span>
          </button>
        </div>

        {selectedCuisine !== "All" && (
          <div className="admin-cuisine-bar">
            <span>
              Cafe type selected: <strong>{selectedCuisine}</strong>
            </span>

            <button
              type="button"
              className="small-add-btn"
              onClick={openAddCafe}
            >
              + Add {selectedCuisine} Cafe
            </button>
          </div>
        )}

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
              className={`restaurant-card admin-restaurant-card ${
                selectedCafes.includes(cafe.id) ? "selected-card" : ""
              }`}
              onClick={() => {
                if (isSelectMode) {
                  toggleCafeSelection(cafe.id);
                } else {
                  navigate("/admin-book-cafe", {
                    state: {
                      venue: cafe,
                    },
                  });
                }
              }}
            >
              {isSelectMode && (
                <div className="admin-select-check">
                  {selectedCafes.includes(cafe.id) ? "✓" : ""}
                </div>
              )}

              <div className="restaurant-image-box">
                <img
                  src={getDisplayImage(cafe.image)}
                  alt={cafe.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{cafe.name}</h3>
                <p>{cafe.cuisine}</p>
                <span>
                  {cafe.city} - {cafe.area}
                </span>
                <p>
                  {cafe.has_smoking
                    ? "Smoking Area Available"
                    : "Non-Smoking Only"}
                </p>

                {cafe.google_maps_link && (
                  <p className="restaurant-map-link-preview">Map link added</p>
                )}

                <div className="admin-card-buttons">
                  <button
                    type="button"
                    className="edit-small-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCafe(cafe);
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
                      deleteCafe(cafe.id);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="restaurant-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{cafe.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddCafeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingCafe ? "Edit Cafe" : "Add Cafe"}</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setShowAddCafeModal(false);
                  setEditingCafe(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Cafe Name"
                value={cafeForm.name}
                onChange={(e) =>
                  setCafeForm({ ...cafeForm, name: e.target.value })
                }
              />

              <select
                value={cafeForm.cuisine}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    cuisine: e.target.value,
                  })
                }
              >
                {cuisineOptions
                  .filter((item) => item.name !== "All")
                  .map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </select>

              <select
                value={cafeForm.city}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
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
                value={cafeForm.area}
                onChange={(e) =>
                  setCafeForm({ ...cafeForm, area: e.target.value })
                }
              >
                {(locationsByRegion[cafeForm.city] || []).map((areaItem) => (
                  <option key={areaItem} value={areaItem}>
                    {areaItem}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={cafeForm.rating}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    rating: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Paste direct image URL from Google / website"
                value={cafeForm.image}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    image: e.target.value,
                  })
                }
              />

              <div className="image-url-preview-box">
                <img
                  src={getDisplayImage(cafeForm.image)}
                  alt="Cafe preview"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <span>Image preview</span>
              </div>

              <input
                type="text"
                placeholder="Phone"
                value={cafeForm.phone}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Instagram"
                value={cafeForm.instagram}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    instagram: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="WhatsApp"
                value={cafeForm.whatsapp}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    whatsapp: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Hours"
                value={cafeForm.hours}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    hours: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={cafeForm.google_maps_link || ""}
                onChange={(e) =>
                  setCafeForm({
                    ...cafeForm,
                    google_maps_link: e.target.value,
                  })
                }
                placeholder="Paste Google Maps link"
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <input
                  type="checkbox"
                  checked={cafeForm.has_smoking}
                  onChange={(e) =>
                    setCafeForm({
                      ...cafeForm,
                      has_smoking: e.target.checked,
                    })
                  }
                />
                Has Smoking Area
              </label>

              <button
                type="button"
                className="save-modal-btn"
                onClick={saveCafe}
              >
                {editingCafe ? "Save Changes" : "Add Cafe"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCuisineModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-modal">
            <div className="admin-modal-header">
              <h2>Add Cafe Type</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddCuisineModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Enter cafe type"
                value={newCuisine}
                onChange={(e) => setNewCuisine(e.target.value)}
              />

              <button
                type="button"
                className="save-modal-btn"
                onClick={addCuisine}
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
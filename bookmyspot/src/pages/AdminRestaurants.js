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

export default function AdminRestaurants() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);

  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showAddCuisineModal, setShowAddCuisineModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  const [newCuisine, setNewCuisine] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [locationParentRegion, setLocationParentRegion] =
    useState("North Lebanon");

  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cuisineOptions, setCuisineOptions] = useState([
    { name: "All", icon: "🍽️" },
    { name: "Lebanese", icon: "🥙" },
    { name: "Japanese", icon: "🍣" },
    { name: "Seafood", icon: "🐟" },
    { name: "BBQ/Steak", icon: "🥩" },
    { name: "Italian", icon: "🍝" },
    { name: "American", icon: "🍔" },
    { name: "Indian", icon: "🍛" },
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

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    cuisine: "Lebanese",
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
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/restaurants");
      const data = Array.isArray(response.data) ? response.data : [];
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item) => {
      const matchesRegion =
        selectedRegion === "All Regions" || item.city === selectedRegion;

      const matchesCuisine =
        selectedCuisine === "All" || item.cuisine === selectedCuisine;

      return matchesRegion && matchesCuisine;
    });
  }, [restaurants, selectedRegion, selectedCuisine]);

  const currentLocations =
    selectedRegion !== "All Regions"
      ? locationsByRegion[selectedRegion] || []
      : [];

  const toggleRestaurantSelection = (id) => {
    setSelectedRestaurants((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteRestaurant = async (id) => {
    const confirmDelete = window.confirm("Delete this restaurant?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/restaurants/${id}`);
      setSelectedRestaurants((prev) => prev.filter((item) => item !== id));
      fetchRestaurants();
    } catch (error) {
      console.error("Delete restaurant error:", error);
      alert("Failed to delete restaurant.");
    }
  };

  const deleteSelectedRestaurants = async () => {
    if (selectedRestaurants.length === 0) {
      alert("Please select restaurants first.");
      return;
    }

    const confirmDelete = window.confirm("Delete selected restaurants?");
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedRestaurants.map((id) =>
          axios.delete(`http://localhost:5000/api/restaurants/${id}`)
        )
      );

      setSelectedRestaurants([]);
      fetchRestaurants();
    } catch (error) {
      console.error("Delete selected restaurants error:", error);
      alert("Failed to delete selected restaurants.");
    }
  };

  const openAddRestaurant = () => {
    setEditingRestaurant(null);
    setRestaurantForm({
      name: "",
      cuisine: selectedCuisine !== "All" ? selectedCuisine : "Lebanese",
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
    setShowAddRestaurantModal(true);
  };

  const openEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name || "",
      cuisine: restaurant.cuisine || "Lebanese",
      city: restaurant.city || "Beirut",
      area: restaurant.area || "",
      rating: restaurant.rating || 4.5,
      image: restaurant.image || "",
      phone: restaurant.phone || "",
      instagram: restaurant.instagram || "",
      whatsapp: restaurant.whatsapp || "",
      hours: restaurant.hours || "",
      has_smoking: !!restaurant.has_smoking,
      google_maps_link: restaurant.google_maps_link || "",
    });
    setShowAddRestaurantModal(true);
  };

  const saveRestaurant = async () => {
    if (
      !restaurantForm.name ||
      !restaurantForm.cuisine ||
      !restaurantForm.city ||
      !restaurantForm.area
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ...restaurantForm,
        rating: Number(restaurantForm.rating),
        image: normalizeImageUrl(restaurantForm.image) || DEFAULT_IMAGE,
        has_smoking: restaurantForm.has_smoking,
        google_maps_link: restaurantForm.google_maps_link || "",
      };

      if (editingRestaurant) {
        await axios.put(
          `http://localhost:5000/api/restaurants/${editingRestaurant.id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/restaurants", payload);
      }

      setShowAddRestaurantModal(false);
      setEditingRestaurant(null);
      fetchRestaurants();
    } catch (error) {
      console.error("Save restaurant error:", error);
      alert("Failed to save restaurant.");
    }
  };

  const addCuisine = () => {
    if (!newCuisine.trim()) {
      alert("Enter cuisine name.");
      return;
    }

    const exists = cuisineOptions.some(
      (item) => item.name.toLowerCase() === newCuisine.trim().toLowerCase()
    );

    if (exists) {
      alert("Cuisine already exists.");
      return;
    }

    setCuisineOptions((prev) => [
      ...prev,
      { name: newCuisine.trim(), icon: "🍴" },
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

        <h1 className="restaurants-title">Manage Restaurants</h1>

        <div className="admin-actions-top">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => {
              setIsSelectMode((prev) => !prev);
              setSelectedRestaurants([]);
            }}
          >
            {isSelectMode ? <CheckSquare size={18} /> : <Square size={18} />}
            <span>Select</span>
          </button>

          <button
            type="button"
            className="admin-action-btn add-btn"
            onClick={openAddRestaurant}
          >
            <Plus size={18} />
            <span>Add Restaurant</span>
          </button>

          {isSelectMode && (
            <button
              type="button"
              className="admin-action-btn delete-btn"
              onClick={deleteSelectedRestaurants}
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
              Cuisine selected: <strong>{selectedCuisine}</strong>
            </span>

            <button
              type="button"
              className="small-add-btn"
              onClick={openAddRestaurant}
            >
              + Add {selectedCuisine} Restaurant
            </button>
          </div>
        )}

        <p className="found-count">
          {loading
            ? "Loading venues..."
            : `${filteredRestaurants.length} venues found`}
        </p>

        <div className="restaurants-list">
          {!loading && filteredRestaurants.length === 0 && (
            <div className="no-results-box">No restaurants found.</div>
          )}

          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`restaurant-card admin-restaurant-card ${
                selectedRestaurants.includes(restaurant.id)
                  ? "selected-card"
                  : ""
              }`}
              onClick={() => {
                if (isSelectMode) {
                  toggleRestaurantSelection(restaurant.id);
                } else {
                  navigate("/admin-book-venue", {
                    state: {
                      venue: restaurant,
                    },
                  });
                }
              }}
            >
              {isSelectMode && (
                <div className="admin-select-check">
                  {selectedRestaurants.includes(restaurant.id) ? "✓" : ""}
                </div>
              )}

              <div className="restaurant-image-box">
                <img
                  src={getDisplayImage(restaurant.image)}
                  alt={restaurant.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <span>
                  {restaurant.city} - {restaurant.area}
                </span>
                <p>
                  {restaurant.has_smoking
                    ? "Smoking Area Available"
                    : "Non-Smoking Only"}
                </p>

                {restaurant.google_maps_link && (
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
                      openEditRestaurant(restaurant);
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
                      deleteRestaurant(restaurant.id);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="restaurant-rating">
                <Star size={20} fill="#a1773f" color="#a1773f" />
                <span>{restaurant.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddRestaurantModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingRestaurant ? "Edit Restaurant" : "Add Restaurant"}</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setShowAddRestaurantModal(false);
                  setEditingRestaurant(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Restaurant Name"
                value={restaurantForm.name}
                onChange={(e) =>
                  setRestaurantForm({ ...restaurantForm, name: e.target.value })
                }
              />

              <select
                value={restaurantForm.cuisine}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
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
                value={restaurantForm.city}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
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
                value={restaurantForm.area}
                onChange={(e) =>
                  setRestaurantForm({ ...restaurantForm, area: e.target.value })
                }
              >
                {(locationsByRegion[restaurantForm.city] || []).map(
                  (areaItem) => (
                    <option key={areaItem} value={areaItem}>
                      {areaItem}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={restaurantForm.rating}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    rating: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Paste direct image URL from Google / website"
                value={restaurantForm.image}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    image: e.target.value,
                  })
                }
              />

              <div className="image-url-preview-box">
                <img
                  src={getDisplayImage(restaurantForm.image)}
                  alt="Restaurant preview"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <span>Image preview</span>
              </div>

              <input
                type="text"
                placeholder="Phone"
                value={restaurantForm.phone}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Instagram"
                value={restaurantForm.instagram}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    instagram: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="WhatsApp"
                value={restaurantForm.whatsapp}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    whatsapp: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Hours"
                value={restaurantForm.hours}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    hours: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Google Maps Link"
                value={restaurantForm.google_maps_link}
                onChange={(e) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    google_maps_link: e.target.value,
                  })
                }
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
                  checked={restaurantForm.has_smoking}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      has_smoking: e.target.checked,
                    })
                  }
                />
                Has Smoking Area
              </label>

              <button
                type="button"
                className="save-modal-btn"
                onClick={saveRestaurant}
              >
                {editingRestaurant ? "Save Changes" : "Add Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCuisineModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-modal">
            <div className="admin-modal-header">
              <h2>Add Food Type</h2>
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
                placeholder="Enter food type"
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
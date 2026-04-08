import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Users,
  MessageSquare,
  Save,
  Info,
  UtensilsCrossed,
  AlertTriangle,
} from "lucide-react";
import "./DiningPreferences.css";

export default function DiningPreferences() {
  const navigate = useNavigate();

  const dietaryOptions = useMemo(
    () => [
      "🥗 Vegetarian",
      "🌱 Vegan",
      "🥩 Halal Only",
      "🌾 Gluten-Free",
      "🥛 Dairy-Free",
      "🥜 Nut Allergy",
      "🍤 Shellfish Allergy",
      "🍞 Low Carb",
      "💉 Diabetic Friendly",
    ],
    []
  );

  const allergyOptions = useMemo(
    () => [
      "Peanuts",
      "Tree Nuts",
      "Milk",
      "Eggs",
      "Wheat",
      "Soy",
      "Fish",
      "Shellfish",
      "Sesame",
      "Sulfites",
    ],
    []
  );

  const popularCuisines = useMemo(
    () => ["Italian", "Japanese", "Lebanese", "Mediterranean"],
    []
  );

  const otherCuisines = useMemo(
    () => [
      "American",
      "Cafe",
      "Chinese",
      "French",
      "Greek",
      "Indian",
      "International",
      "Mediterrasian",
      "Mexican",
      "Seafood",
      "Spanish",
      "Thai",
    ],
    []
  );

  const ambianceOptions = useMemo(
    () => [
      "🤫 Quiet & Intimate",
      "🎉 Lively & Social",
      "💕 Romantic",
      "💼 Business Friendly",
      "👪 Family Friendly",
      "🌳 Outdoor Seating",
      "🌄 Great Views",
      "🏛️ Traditional",
      "✨ Modern & Trendy",
    ],
    []
  );

  const partySizes = useMemo(
    () => [
      { number: "1", label: "Solo Dining" },
      { number: "2", label: "Couple" },
      { number: "4", label: "Small Group" },
      { number: "6", label: "Medium Group" },
      { number: "8", label: "Large Group" },
    ],
    []
  );

  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedAmbiance, setSelectedAmbiance] = useState([]);
  const [selectedPartySize, setSelectedPartySize] = useState("1");
  const [specialRequirements, setSpecialRequirements] = useState("");

  const toggleItem = (item, list, setter) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSave = () => {
    const preferences = {
      dietary: selectedDietary,
      allergies: selectedAllergies,
      cuisines: selectedCuisines,
      ambiance: selectedAmbiance,
      partySize: selectedPartySize,
      specialRequirements,
    };

    localStorage.setItem("diningPreferences", JSON.stringify(preferences));
    alert("Preferences saved successfully");
    navigate("/profile");
  };

  return (
    <div className="preferences-page">
      <div className="preferences-container">
        <div className="preferences-topbar">
          <button
            type="button"
            className="preferences-back-btn"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={28} />
          </button>

          <div className="preferences-title-wrap">
            <h1 className="preferences-title">Dining Preferences</h1>
            <div className="preferences-line" />
          </div>
        </div>

        <div className="info-box">
          <div className="info-box-icon">
            <Info size={22} />
          </div>
          <div>
            <h3>Why we ask for preferences</h3>
            <p>
              Your preferences help us recommend restaurants that match your
              taste and dietary needs. Restaurants will also be notified of your
              requirements when you make a booking.
            </p>
          </div>
        </div>

        <section className="pref-section">
          <h2 className="section-heading">
            <UtensilsCrossed size={28} />
            <span>Dietary Restrictions</span>
          </h2>

          <div className="chips-wrap">
            {dietaryOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${selectedDietary.includes(item) ? "chip-active" : ""}`}
                onClick={() =>
                  toggleItem(item, selectedDietary, setSelectedDietary)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="pref-section">
          <h2 className="section-heading alert-heading">
            <AlertTriangle size={28} />
            <span>Allergies & Intolerances</span>
          </h2>

          <div className="chips-wrap">
            {allergyOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${selectedAllergies.includes(item) ? "chip-active" : ""}`}
                onClick={() =>
                  toggleItem(item, selectedAllergies, setSelectedAllergies)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="pref-section">
          <h2 className="section-heading">
            <Heart size={28} />
            <span>Favorite Cuisines</span>
          </h2>

          <p className="section-subtitle">Select cuisines you enjoy most</p>

          <h3 className="mini-title">Popular in Lebanon</h3>
          <div className="chips-wrap">
            {popularCuisines.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${selectedCuisines.includes(item) ? "chip-active" : ""}`}
                onClick={() =>
                  toggleItem(item, selectedCuisines, setSelectedCuisines)
                }
              >
                {item}
              </button>
            ))}
          </div>

          <h3 className="mini-title">Other Cuisines</h3>
          <div className="chips-wrap">
            {otherCuisines.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${selectedCuisines.includes(item) ? "chip-active" : ""}`}
                onClick={() =>
                  toggleItem(item, selectedCuisines, setSelectedCuisines)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="pref-section">
          <h2 className="big-heading">Preferred Ambiance</h2>
          <p className="section-subtitle">
            What type of atmosphere do you enjoy?
          </p>

          <div className="ambiance-list">
            {ambianceOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`ambiance-card ${
                  selectedAmbiance.includes(item) ? "ambiance-active" : ""
                }`}
                onClick={() =>
                  toggleItem(item, selectedAmbiance, setSelectedAmbiance)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="pref-section">
          <h2 className="section-heading">
            <Users size={28} />
            <span>Typical Party Size</span>
          </h2>

          <p className="section-subtitle">
            How many people do you usually dine with?
          </p>

          <div className="party-grid">
            {partySizes.map((item) => (
              <button
                key={item.number}
                type="button"
                className={`party-card ${
                  selectedPartySize === item.number ? "party-active" : ""
                }`}
                onClick={() => setSelectedPartySize(item.number)}
              >
                <strong>{item.number}</strong>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pref-section">
          <h2 className="section-heading">
            <MessageSquare size={28} />
            <span>Special Requirements</span>
          </h2>

          <p className="section-subtitle">
            Any additional notes for restaurants (e.g., wheelchair access, high
            chair needed, celebration)
          </p>

          <textarea
            className="requirements-textarea"
            placeholder="Enter any special requirements..."
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
          />
        </section>

        <div className="save-bar">
          <p className="unsaved-text">You have unsaved changes</p>

          <button type="button" className="save-preferences-btn" onClick={handleSave}>
            <Save size={22} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
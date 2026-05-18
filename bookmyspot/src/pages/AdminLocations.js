import React, { useEffect, useState } from "react";
import "./AdminManage.css";

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [cityName, setCityName] = useState("");
  const [areaName, setAreaName] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function fetchLocations() {
    try {
      const response = await fetch("http://localhost:5000/api/locations");
      const data = await response.json();

      if (response.ok) {
        setLocations(data);
      } else {
        alert(data.message || "Failed to load locations");
      }
    } catch (error) {
      console.error("FETCH LOCATIONS ERROR:", error);
      alert("Server error while loading locations");
    }
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setCityName("");
    setAreaName("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cityName.trim() || !areaName.trim()) {
      alert("Please enter city name and area name");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/locations/${editingId}`
        : "http://localhost:5000/api/locations";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city_name: cityName,
          area_name: areaName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(data.message || "Saved successfully");
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error("SAVE LOCATION ERROR:", error);
      alert("Server error while saving location");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCityName(item.city_name);
    setAreaName(item.area_name);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this location?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert(data.message || "Deleted successfully");
      fetchLocations();
    } catch (error) {
      console.error("DELETE LOCATION ERROR:", error);
      alert("Server error while deleting location");
    }
  };

  return (
    <div className="admin-manage-page">
      <div className="admin-manage-container">
        <h1>Manage Locations</h1>

        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>City Name</label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Bekaa"
            />
          </div>

          <div className="admin-form-group">
            <label>Area Name</label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Chtoura"
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn">
              {editingId ? "Update Location" : "Add Location"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="admin-list-card">
          <h2>All Locations</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>City</th>
                <th>Area</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No locations found
                  </td>
                </tr>
              ) : (
                locations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.city_name}</td>
                    <td>{item.area_name}</td>
                    <td>
                      <button
                        className="table-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="table-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
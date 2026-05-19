import React, { useEffect, useState, useCallback } from "react";
import "./AdminManage.css";

export default function AdminAreas() {
  const [venueId, setVenueId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [areaName, setAreaName] = useState("");
  const [mapLayout, setMapLayout] = useState("[]");
  const [areas, setAreas] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchAreas = useCallback(async () => {
    if (!venueId || !sectionId) {
      setAreas([]);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin-areas/${venueId}/${sectionId}`
      );
      const data = await response.json();

      if (response.ok) {
        setAreas(Array.isArray(data) ? data : []);
      } else {
        alert(data.message || "Failed to load areas");
      }
    } catch (error) {
      console.error("FETCH AREAS ERROR:", error);
      alert("Server error while loading areas");
    }
  }, [venueId, sectionId]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const resetForm = () => {
    setAreaName("");
    setMapLayout("[]");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!venueId.trim() || !sectionId.trim() || !areaName.trim()) {
      alert("Please fill venue ID, section ID, and area name");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/admin-areas/${editingId}`
        : "http://localhost:5000/api/admin-areas";

      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? {
            area_name: areaName,
            map_layout: mapLayout,
          }
        : {
            venue_id: venueId,
            section_id: sectionId,
            area_name: areaName,
            map_layout: mapLayout,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed");
        return;
      }

      alert(data.message || "Saved successfully");
      resetForm();
      fetchAreas();
    } catch (error) {
      console.error("SAVE AREA ERROR:", error);
      alert("Server error while saving area");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setAreaName(item.area_name || "");
    setMapLayout(item.map_layout || "[]");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this area?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin-areas/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert(data.message || "Deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchAreas();
    } catch (error) {
      console.error("DELETE AREA ERROR:", error);
      alert("Server error while deleting area");
    }
  };

  return (
    <div className="admin-manage-page">
      <div className="admin-manage-container">
        <h1>Manage Restaurant Areas</h1>

        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Venue ID</label>
            <input
              type="number"
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="admin-form-group">
            <label>Section ID</label>
            <input
              type="number"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="admin-form-group">
            <label>Area Name</label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Smoking Area"
            />
          </div>

          <div className="admin-form-group">
            <label>Map Layout (JSON)</label>
            <textarea
              value={mapLayout}
              onChange={(e) => setMapLayout(e.target.value)}
              rows="8"
              placeholder='[{"id":1,"shape":"round","seats":4,"top":"100px","left":"120px"}]'
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn">
              {editingId ? "Update Area" : "Add Area"}
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
          <h2>Areas</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Venue ID</th>
                <th>Section ID</th>
                <th>Area Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {areas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No areas found
                  </td>
                </tr>
              ) : (
                areas.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.venue_id}</td>
                    <td>{item.section_id}</td>
                    <td>{item.area_name}</td>
                    <td>
                      <button
                        type="button"
                        className="table-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
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

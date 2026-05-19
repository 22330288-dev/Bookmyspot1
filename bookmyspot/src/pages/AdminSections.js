import React, { useEffect, useState } from "react";
import "./AdminManage.css";

export default function AdminSections() {
  const [venueId, setVenueId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState([]);
  const [editingId, setEditingId] = useState(null);

  async function fetchSections(id) {
    if (!id) {
      setSections([]);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin-sections/${id}`
      );
      const data = await response.json();

      if (response.ok) {
        setSections(data);
      } else {
        alert(data.message || "Failed to load sections");
      }
    } catch (error) {
      console.error("FETCH SECTIONS ERROR:", error);
      alert("Server error while loading sections");
    }
  }

  useEffect(() => {
    fetchSections(venueId);
  }, [venueId]);

  const resetForm = () => {
    setSectionName("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!venueId.trim()) {
      alert("Please enter venue ID");
      return;
    }

    if (!sectionName.trim()) {
      alert("Please enter section name");
      return;
    }

    try {
      const url = editingId
        ? `${process.env.REACT_APP_API_URL}/api/admin-sections/${editingId}`
        : "${process.env.REACT_APP_API_URL}/api/admin-sections";

      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? { section_name: sectionName }
        : { venue_id: venueId, section_name: sectionName };

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
      fetchSections(venueId);
    } catch (error) {
      console.error("SAVE SECTION ERROR:", error);
      alert("Server error while saving section");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSectionName(item.section_name);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this section?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin-sections/${id}`,
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
      fetchSections(venueId);
    } catch (error) {
      console.error("DELETE SECTION ERROR:", error);
      alert("Server error while deleting section");
    }
  };

  return (
    <div className="admin-manage-page">
      <div className="admin-manage-container">
        <h1>Manage Restaurant Sections</h1>

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
            <label>Section Name</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Indoor"
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn">
              {editingId ? "Update Section" : "Add Section"}
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
          <h2>Sections</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Venue ID</th>
                <th>Section Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sections.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No sections found
                  </td>
                </tr>
              ) : (
                sections.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.venue_id}</td>
                    <td>{item.section_name}</td>
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

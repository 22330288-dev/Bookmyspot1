import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Circle,
  Square,
  Armchair,
  Trash2,
} from "lucide-react";
import "./CreateSeats.css";

export default function CreateSeats() {
  const navigate = useNavigate();
  const location = useLocation();

  const venue = location.state?.venue || {
    name: "Venue Layout Designer",
  };

  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const addItem = (type) => {
    const newItem = {
      id: Date.now() + Math.random(),
      type,
      x: 180,
      y: 180,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();

    const item = items.find((i) => i.id === id);
    if (!item) return;

    setDraggingId(id);
    setOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === draggingId
          ? {
              ...item,
              x: e.clientX - offset.x,
              y: e.clientY - offset.y,
            }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleDeleteLast = () => {
    setItems((prev) => prev.slice(0, -1));
  };

  const handleSaveLayout = () => {
    const savedLayouts =
      JSON.parse(localStorage.getItem("customSeatsLayouts")) || [];

    const newLayout = {
      venueName: venue.name,
      createdAt: new Date().toISOString(),
      layout: items,
    };

    localStorage.setItem(
      "customSeatsLayouts",
      JSON.stringify([...savedLayouts, newLayout])
    );

    alert("Seats layout saved successfully");
    navigate(-1);
  };

  return (
    <div
      className="create-seats-page"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="create-seats-header">
        <button
          type="button"
          className="create-seats-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>

        <div className="create-seats-title-wrap">
          <h1>Create Seats</h1>
          <p>{venue.name}</p>
        </div>
      </div>

      <div className="designer-board">
        {items.length === 0 && (
          <div className="empty-layout-message">
            <h2>Start Designing</h2>
            <p>
              Add tables and chairs from the toolbar below, then drag them to
              arrange the venue layout as you want.
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`designer-item ${item.type}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            {item.type === "round-table" && <span>Round</span>}
            {item.type === "rect-table" && <span>Rect</span>}
            {item.type === "chair" && <span>Chair</span>}
          </div>
        ))}
      </div>

      <div className="designer-toolbar">
        <button type="button" onClick={() => addItem("round-table")}>
          <Circle size={18} />
          <span>Round Table</span>
        </button>

        <button type="button" onClick={() => addItem("rect-table")}>
          <Square size={18} />
          <span>Rect Table</span>
        </button>

        <button type="button" onClick={() => addItem("chair")}>
          <Armchair size={18} />
          <span>Chair</span>
        </button>

        <button type="button" onClick={handleDeleteLast}>
          <Trash2 size={18} />
          <span>Delete Last</span>
        </button>

        <button
          type="button"
          className="save-layout-btn"
          onClick={handleSaveLayout}
        >
          <Save size={18} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
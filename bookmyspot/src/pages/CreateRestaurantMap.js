import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, Circle, Square, Trash2 } from "lucide-react";
import "./CreateSeats.css";

export default function CreateRestaurantMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardRef = useRef(null);

  const venue = useMemo(() => location.state?.venue || null, [location.state]);

  const normalizeLayout = (layout = []) => {
    return layout.map((item, index) => {
      const type =
        item.type ||
        (item.shape === "rect"
          ? "rect-table"
          : item.shape === "square"
          ? "square-table"
          : "round-table");

      const shape =
        type === "rect-table"
          ? "rect"
          : type === "square-table"
          ? "square"
          : "round";

      const x =
        typeof item.x === "number"
          ? item.x
          : typeof item.left === "string"
          ? parseInt(item.left, 10) || 160
          : 160;

      const y =
        typeof item.y === "number"
          ? item.y
          : typeof item.top === "string"
          ? parseInt(item.top, 10) || 160
          : 160;

      return {
        id: item.id ?? Date.now() + index,
        type,
        shape,
        seats:
          typeof item.seats === "number"
            ? item.seats
            : type === "rect-table"
            ? 6
            : 4,
        status: item.status || "available",
        x,
        y,
        top: `${y}px`,
        left: `${x}px`,
      };
    });
  };

  const [items, setItems] = useState(() =>
    normalizeLayout(venue?.mapLayout || [])
  );
  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const getItemSize = (type) => {
    if (type === "round-table") return { width: 90, height: 90 };
    if (type === "rect-table") return { width: 130, height: 80 };
    if (type === "square-table") return { width: 90, height: 90 };
    return { width: 90, height: 90 };
  };

  const askSeats = (type) => {
    let defaultSeats = 4;

    if (type === "rect-table") defaultSeats = 6;
    if (type === "square-table") defaultSeats = 4;
    if (type === "round-table") defaultSeats = 4;

    const value = Number(
      window.prompt("Enter number of seats for this table:", defaultSeats)
    );

    if (!Number.isFinite(value) || value < 1) {
      return defaultSeats;
    }

    return Math.floor(value);
  };

  const addItem = (type) => {
    const seats = askSeats(type);

    const newItem = {
      id: Date.now() + Math.random(),
      type,
      shape:
        type === "rect-table"
          ? "rect"
          : type === "square-table"
          ? "square"
          : "round",
      seats,
      status: "available",
      x: 160,
      y: 160,
      top: "160px",
      left: "160px",
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const board = boardRef.current;
    const item = items.find((i) => i.id === id);

    if (!board || !item) return;

    const rect = board.getBoundingClientRect();

    setDraggingId(id);
    setOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !boardRef.current) return;

    const board = boardRef.current;
    const rect = board.getBoundingClientRect();

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== draggingId) return item;

        const size = getItemSize(item.type);

        let newX = e.clientX - rect.left - offset.x;
        let newY = e.clientY - rect.top - offset.y;

        const maxX = rect.width - size.width;
        const maxY = rect.height - size.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        return {
          ...item,
          x: newX,
          y: newY,
          top: `${newY}px`,
          left: `${newX}px`,
        };
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleDeleteLast = () => {
    setItems((prev) => prev.slice(0, -1));
  };

  const handleSaveLayout = async () => {
    if (!venue?.id) {
      alert("Venue not found.");
      return;
    }

    const normalizedLayout = items.map((item) => ({
      id: item.id,
      type: item.type,
      shape: item.shape,
      seats: item.seats,
      status: item.status || "available",
      x: Math.round(item.x),
      y: Math.round(item.y),
      top: `${Math.round(item.y)}px`,
      left: `${Math.round(item.x)}px`,
    }));

    try {
      await axios.put(`http://localhost:5000/api/restaurants/${venue.id}/map`, {
        mapLayout: normalizedLayout,
      });

      alert("Map saved successfully");

      navigate("/admin-book-venue", {
        state: {
          venue: {
            ...venue,
            mapLayout: normalizedLayout,
          },
        },
      });
    } catch (error) {
      console.error("Save map error:", error);
      alert("Failed to save map");
    }
  };

  return (
    <div
      className="create-seats-page"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
          <h1>Create Map</h1>
          <p>{venue?.name || "Venue"}</p>
        </div>
      </div>

      <div className="designer-board" ref={boardRef}>
        {items.length === 0 && (
          <div className="empty-layout-message">
            <h2>Start Designing</h2>
            <p>Add tables, choose their seat count, then drag them into place.</p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`designer-item ${
              item.type === "rect-table"
                ? "rect-table"
                : item.type === "square-table"
                ? "square-table"
                : "round-table"
            }`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            title={`${item.seats} seats`}
          >
            {item.seats}
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

        <button type="button" onClick={() => addItem("square-table")}>
          <Square size={18} />
          <span>Square Table</span>
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
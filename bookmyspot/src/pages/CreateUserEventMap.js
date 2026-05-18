import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Circle,
  Square,
  Armchair,
  Trash2,
  Crown,
} from "lucide-react";
import "./CreateSeats.css";
import "./CreateRestaurantMap.css";

export default function CreateUserEventMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardRef = useRef(null);

  const { venue, sectionId, sectionName, existingMap } = location.state || {};

  const fixedTypes = ["window", "door", "pool", "plant", "dance-floor", "stage"];

  const [items, setItems] = useState(
    Array.isArray(existingMap)
      ? existingMap.map((item, index) => ({
          ...item,
          id: item.id || `event-item-${index}`,
          label: item.label || "",
          locked: fixedTypes.includes(item.type || item.item_type),
        }))
      : []
  );

  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  const getItemSize = (type) => {
    switch (type) {
      case "round-table":
        return { width: 90, height: 90 };
      case "rect-table":
        return { width: 150, height: 80 };
      case "chair":
        return { width: 34, height: 34 };
      case "stage":
        return { width: 260, height: 90 };
      default:
        return { width: 90, height: 90 };
    }
  };

  const createChairsAroundTable = (table, seats) => {
    const chairs = [];
    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;

    const radiusX = table.type === "rect-table" ? table.width / 2 + 35 : 75;
    const radiusY = table.type === "rect-table" ? table.height / 2 + 35 : 75;

    for (let i = 0; i < seats; i += 1) {
      const angle = (2 * Math.PI * i) / seats;

      const guestName = prompt(
        `Enter guest name for chair ${i + 1} around ${
          table.label || "this table"
        }:`
      );

      chairs.push({
        id: `${table.id}-chair-${i}`,
        type: "chair",
        item_type: "chair",
        parentTableId: table.id,
        parent_table_id: table.id,
        x: centerX + radiusX * Math.cos(angle) - 17,
        y: centerY + radiusY * Math.sin(angle) - 17,
        width: 34,
        height: 34,
        rotation: 0,
        seats: 1,
        seats_count: 1,
        label: guestName || `Chair ${i + 1}`,
        locked: false,
      });
    }

    return chairs;
  };

  const addTable = (type) => {
    const seatsInput = prompt("How many seats do you want?");
    const seats = Number(seatsInput);

    if (!seats || seats < 1) {
      alert("Please enter a valid number.");
      return;
    }

    const tableLabel = prompt(
      "Enter table label/name. Example: VIP Table, Friends Table:"
    );

    const size = getItemSize(type);
    const tableId = `event-user-table-${Date.now()}-${Math.random()}`;

    const table = {
      id: tableId,
      type,
      item_type: type,
      x: 220,
      y: 220,
      width: size.width,
      height: size.height,
      rotation: 0,
      seats,
      seats_count: seats,
      label: tableLabel || `Table ${seats} seats`,
      locked: false,
    };

    const chairs = createChairsAroundTable(table, seats);

    setItems((prev) => [...prev, table, ...chairs]);
    setSelectedId(tableId);
  };

  const addItem = (type) => {
    const size = getItemSize(type);

    let label = "";

    if (type === "chair") {
      label = prompt("Enter guest name for this chair:") || "Guest Chair";
    } else if (type === "stage") {
      label = "Stage";
    }

    const item = {
      id: `event-user-item-${Date.now()}-${Math.random()}`,
      type,
      item_type: type,
      x: 200,
      y: 200,
      width: size.width,
      height: size.height,
      rotation: 0,
      seats: type === "chair" ? 1 : 0,
      seats_count: type === "chair" ? 1 : 0,
      label,
      locked: false,
    };

    setItems((prev) => [...prev, item]);
    setSelectedId(item.id);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const item = items.find((i) => i.id === id);
    const board = boardRef.current;

    if (!item || !board) return;

    setSelectedId(id);

    if (item.locked) return;

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
        if (item.id !== draggingId || item.locked) return item;

        let newX = e.clientX - rect.left - offset.x;
        let newY = e.clientY - rect.top - offset.y;

        newX = Math.max(0, Math.min(newX, rect.width - item.width));
        newY = Math.max(0, Math.min(newY, rect.height - item.height));

        return {
          ...item,
          x: newX,
          y: newY,
        };
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const deleteSelected = () => {
    if (!selectedItem) {
      alert("Select an item first.");
      return;
    }

    if (selectedItem.locked) {
      alert("This item is fixed by the admin and cannot be deleted.");
      return;
    }

    if (
      selectedItem.type === "round-table" ||
      selectedItem.type === "rect-table"
    ) {
      setItems((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedItem.id &&
            item.parentTableId !== selectedItem.id
        )
      );
    } else {
      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    }

    setSelectedId(null);
  };

  const updateSelectedItem = (field, value) => {
    if (!selectedItem || selectedItem.locked) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const saveCustomMap = () => {
    const mapWithLabels = items.map((item) => ({
      ...item,
      label: item.label || "",
    }));

    navigate("/book-event-venue", {
      state: {
        venue,
        sectionId,
        sectionName,
        customLayout: mapWithLabels,
      },
    });
  };

  const getHoverTitle = (item) => {
    if (item.label) {
      if (item.type === "chair") {
        return `Guest: ${item.label}`;
      }

      if (item.type === "round-table" || item.type === "rect-table") {
        return `Table Label: ${item.label}`;
      }

      return item.label;
    }

    if (item.locked) {
      return "Fixed by admin";
    }

    return "Editable item";
  };

  const renderItemContent = (item) => {
    if (item.type === "chair") {
      return (
        <span className="wedding-item-label wedding-chair-label">
          {item.label || "Chair"}
        </span>
      );
    }

    if (item.type === "round-table" || item.type === "rect-table") {
      return (
        <span className="wedding-item-label wedding-table-label">
          {item.label || `Table ${item.seats || ""}`}
        </span>
      );
    }

    switch (item.type) {
      case "window":
        return "Window";
      case "door":
        return "Door";
      case "pool":
        return "Pool";
      case "plant":
        return "Plant";
      case "dance-floor":
        return "Dance Floor";
      case "stage":
        return item.label || "Stage";
      default:
        return item.label || "";
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
          <h1>Create Your Own Event Map</h1>
          <p>
            {venue?.name || "Event Venue"} — {sectionName || "Section"}
          </p>
        </div>
      </div>

      <div className="designer-layout-wrapper">
        <div className="designer-side-panel">
          <h3>Editable Items</h3>

          <button type="button" onClick={() => addTable("round-table")}>
            <Circle size={18} />
            <span>Round Table</span>
          </button>

          <button type="button" onClick={() => addTable("rect-table")}>
            <Square size={18} />
            <span>Rectangle Table</span>
          </button>

          <button type="button" onClick={() => addItem("chair")}>
            <Armchair size={18} />
            <span>Single Chair</span>
          </button>

          <button type="button" onClick={() => addItem("stage")}>
            <Crown size={18} />
            <span>Stage</span>
          </button>

          <button type="button" onClick={deleteSelected}>
            <Trash2 size={18} />
            <span>Delete Selected</span>
          </button>

          <button
            type="button"
            className="save-layout-btn"
            onClick={saveCustomMap}
          >
            <Save size={18} />
            <span>Save My Map</span>
          </button>

          <p style={{ fontSize: "13px", marginTop: "12px" }}>
            Add names for tables and chairs. Hover on any table or chair to see
            its label.
          </p>

          <p style={{ fontSize: "13px", marginTop: "8px" }}>
            Windows, doors, pool, plants, and dance floor are fixed by admin.
          </p>
        </div>

        <div className="designer-main-area">
         <div
  className="designer-board event-fixed-board"
  ref={boardRef}
  onClick={() => setSelectedId(null)}
>
            {items.length === 0 && (
              <div className="empty-layout-message">
                <h2>No admin map found</h2>
                <p>Please ask the admin to create the event venue map first.</p>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className={`designer-item ${item.type} ${
                  selectedId === item.id ? "selected" : ""
                } ${item.locked ? "locked-item" : ""}`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  transform: `rotate(${item.rotation || 0}deg)`,
                  opacity: item.locked ? 0.75 : 1,
                  cursor: item.locked ? "not-allowed" : "move",
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(item.id);
                }}
                title={getHoverTitle(item)}
              >
                {renderItemContent(item)}
              </div>
            ))}
          </div>
        </div>

        <div className="designer-properties-panel">
          <h3>Properties</h3>

          {!selectedItem && <p>Select any editable item.</p>}

          {selectedItem && selectedItem.locked && (
            <p>This item is fixed by admin and cannot be changed.</p>
          )}

          {selectedItem && !selectedItem.locked && (
            <>
              <div className="property-group">
                <label>Type</label>
                <input type="text" value={selectedItem.type} disabled />
              </div>

              <div className="property-group">
                <label>
                  {selectedItem.type === "chair"
                    ? "Guest Name"
                    : selectedItem.type === "round-table" ||
                      selectedItem.type === "rect-table"
                    ? "Table Label"
                    : "Label"}
                </label>

                <input
                  type="text"
                  value={selectedItem.label || ""}
                  placeholder={
                    selectedItem.type === "chair"
                      ? "Example: Maria"
                      : "Example: VIP Table"
                  }
                  onChange={(e) => updateSelectedItem("label", e.target.value)}
                />
              </div>

              <div className="property-group">
                <label>Width</label>
                <input
                  type="number"
                  value={selectedItem.width}
                  onChange={(e) =>
                    updateSelectedItem("width", Number(e.target.value) || 20)
                  }
                />
              </div>

              <div className="property-group">
                <label>Height</label>
                <input
                  type="number"
                  value={selectedItem.height}
                  onChange={(e) =>
                    updateSelectedItem("height", Number(e.target.value) || 20)
                  }
                />
              </div>

              <div className="property-group">
                <label>Rotation</label>
                <input
                  type="number"
                  value={selectedItem.rotation || 0}
                  onChange={(e) =>
                    updateSelectedItem("rotation", Number(e.target.value) || 0)
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
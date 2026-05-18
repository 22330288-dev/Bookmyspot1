import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Circle,
  Square,
  Armchair,
  Trash2,
  DoorOpen,
  Waves,
  PanelTop,
  Minus,
  UtensilsCrossed,
  Leaf,
} from "lucide-react";
import "./CreateSeats.css";
import "./CreateRestaurantMap.css";

const API_BASE = "http://localhost:5000/api/cafe-layouts";

export default function CreateCafeMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardRef = useRef(null);

  const { venue, sectionId, sectionName, areaId, areaName } =
    location.state || {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);

  const canLoadMap = useMemo(() => {
    return Boolean(venue?.id && sectionId && areaId);
  }, [venue, sectionId, areaId]);

  const getItemSize = (type) => {
    switch (type) {
      case "round-table":
        return { width: 90, height: 90 };

      case "rect-table":
        return { width: 130, height: 80 };

      case "square-table":
        return { width: 90, height: 90 };

      case "chair":
        return { width: 34, height: 34 };

      case "window":
        return { width: 120, height: 26 };

      case "door":
        return { width: 70, height: 26 };

      case "bar":
        return { width: 180, height: 65 };

      case "pool":
        return { width: 180, height: 110 };

      case "wall":
        return { width: 180, height: 16 };

      case "sofa":
        return { width: 110, height: 55 };

      case "plant":
        return { width: 50, height: 50 };

      default:
        return { width: 90, height: 90 };
    }
  };

  const isTableType = (type) => {
    return ["round-table", "rect-table", "square-table"].includes(type);
  };

  const isSeatType = (type) => {
    return type === "chair" || type === "sofa";
  };

  const isReservableType = (type) => {
    return [
      "round-table",
      "rect-table",
      "square-table",
      "chair",
      "sofa",
    ].includes(type);
  };

  const getDefaultSeats = (type) => {
    switch (type) {
      case "chair":
        return 1;

      case "sofa":
        return 2;

      default:
        return 0;
    }
  };

  const countExistingTablesByType = (type) => {
    return items.filter((item) => item.type === type).length + 1;
  };

  const getDefaultLabel = (type) => {
    switch (type) {
      case "round-table":
        return `Round Table ${countExistingTablesByType(type)}`;

      case "rect-table":
        return `Rectangle Table ${countExistingTablesByType(type)}`;

      case "square-table":
        return `Square Table ${countExistingTablesByType(type)}`;

      case "chair":
        return "Chair";

      case "window":
        return "Window";

      case "door":
        return "Door";

      case "bar":
        return "Bar";

      case "pool":
        return "Pool";

      case "wall":
        return "Wall";

      case "sofa":
        return "Sofa";

      case "plant":
        return "Plant";

      default:
        return "";
    }
  };

  const getTableDisplayName = (table, index) => {
    if (table.label && String(table.label).trim()) {
      return String(table.label).trim();
    }

    if (table.type === "round-table") {
      return `Round Table ${index + 1}`;
    }

    if (table.type === "rect-table") {
      return `Rectangle Table ${index + 1}`;
    }

    if (table.type === "square-table") {
      return `Square Table ${index + 1}`;
    }

    return `Table ${index + 1}`;
  };

  const normalizeApiItem = useCallback((item, index = 0) => {
    const type = item.item_type || item.type || "round-table";
    const size = getItemSize(type);

    return {
      id: String(item.id ?? `temp-${Date.now()}-${index}`),
      dbId: item.id ?? null,
      type,
      label: item.label || "",
      x: Number(item.x ?? 160),
      y: Number(item.y ?? 160),
      width: Number(item.width ?? size.width),
      height: Number(item.height ?? size.height),
      rotation: Number(item.rotation ?? 0),
      seats: Number(item.seats_count ?? item.seats ?? getDefaultSeats(type)),
      status: item.status || "available",
      isReservable:
        typeof item.is_reservable === "number"
          ? item.is_reservable
          : isReservableType(type)
          ? 1
          : 0,
      parentTableId:
        item.parent_table_id !== null && item.parent_table_id !== undefined
          ? String(item.parent_table_id)
          : item.parentTableId !== null && item.parentTableId !== undefined
          ? String(item.parentTableId)
          : "",
    };
  }, []);

  const fetchMapItems = useCallback(async () => {
    if (!canLoadMap) return;

    try {
      setLoading(true);

      const response = await axios.get(API_BASE, {
        params: {
          venue_id: venue.id,
          section_id: sectionId,
          area_id: areaId,
        },
      });

      const normalized = Array.isArray(response.data)
        ? response.data.map((item, index) => normalizeApiItem(item, index))
        : [];

      const withTableLabels = normalized.map((item, index, allItems) => {
        if (!isTableType(item.type)) return item;

        const tableIndex = allItems
          .filter((x) => isTableType(x.type))
          .findIndex((x) => String(x.id) === String(item.id));

        return {
          ...item,
          label: item.label || getTableDisplayName(item, tableIndex),
        };
      });

      setItems(withTableLabels);
      setSelectedId(null);
    } catch (error) {
      console.error("Fetch cafe map items error:", error);
      alert("Failed to load cafe map items");
    } finally {
      setLoading(false);
    }
  }, [canLoadMap, venue?.id, sectionId, areaId, normalizeApiItem]);

  useEffect(() => {
    fetchMapItems();
  }, [fetchMapItems]);

  const tableOptions = useMemo(() => {
    return items.filter((item) => isTableType(item.type));
  }, [items]);

  const addItem = (type) => {
    const size = getItemSize(type);

    let parentTableId = "";

    if (isSeatType(type)) {
      if (tableOptions.length === 0) {
        alert("Please add a table first, then add chairs or sofas.");
        return;
      }

      const selectedTable = tableOptions[tableOptions.length - 1];
      parentTableId = String(selectedTable.id);
    }

    const newItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      dbId: null,
      type,
      label: getDefaultLabel(type),
      x: 160,
      y: 160,
      width: size.width,
      height: size.height,
      rotation: 0,
      seats: getDefaultSeats(type),
      status: "available",
      isReservable: isReservableType(type) ? 1 : 0,
      parentTableId,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const board = boardRef.current;
    const item = items.find((i) => String(i.id) === String(id));

    if (!board || !item) return;

    const rect = board.getBoundingClientRect();

    setSelectedId(String(id));
    setDraggingId(String(id));
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
        if (String(item.id) !== String(draggingId)) return item;

        let newX = e.clientX - rect.left - offset.x;
        let newY = e.clientY - rect.top - offset.y;

        const maxX = rect.width - item.width;
        const maxY = rect.height - item.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        const snapDistance = 25;
        const wallSnapTypes = ["window", "door", "bar", "chair", "sofa"];
        let newRotation = item.rotation || 0;

        if (wallSnapTypes.includes(item.type)) {
          if (newY <= snapDistance) {
            newY = 0;
            newRotation = 0;
          } else if (maxY - newY <= snapDistance) {
            newY = maxY;
            newRotation = 0;
          } else if (newX <= snapDistance) {
            newRotation = 90;
            newX = -((item.width - item.height) / 2);
          } else if (maxX - newX <= snapDistance) {
            newRotation = 90;
            newX = rect.width - (item.width + item.height) / 2;
          }
        }

        return {
          ...item,
          x: newX,
          y: newY,
          rotation: newRotation,
        };
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const selectedItem =
    items.find((item) => String(item.id) === String(selectedId)) || null;

  const updateSelectedItem = (field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(selectedId)
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const getParentTableName = (parentTableId) => {
    if (!parentTableId) return "No parent table selected";

    const index = tableOptions.findIndex(
      (table) => String(table.id) === String(parentTableId)
    );

    if (index === -1) return "No parent table selected";

    return getTableDisplayName(tableOptions[index], index);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) {
      alert("Select an item first");
      return;
    }

    const itemToDelete = items.find(
      (item) => String(item.id) === String(selectedId)
    );

    if (!itemToDelete) return;

    if (isTableType(itemToDelete.type)) {
      const hasChildren = items.some(
        (item) => String(item.parentTableId) === String(itemToDelete.id)
      );

      if (hasChildren) {
        const confirmDelete = window.confirm(
          "This table has chairs or sofas linked to it. Delete the table with its chairs and sofas?"
        );

        if (!confirmDelete) return;

        setItems((prev) =>
          prev.filter(
            (item) =>
              String(item.id) !== String(selectedId) &&
              String(item.parentTableId) !== String(itemToDelete.id)
          )
        );

        setSelectedId(null);
        return;
      }
    }

    setItems((prev) =>
      prev.filter((item) => String(item.id) !== String(selectedId))
    );

    setSelectedId(null);
  };

  const handleDeleteLast = () => {
    if (items.length === 0) return;

    const lastItem = items[items.length - 1];

    setItems((prev) => prev.slice(0, -1));

    if (String(selectedId) === String(lastItem.id)) {
      setSelectedId(null);
    }
  };

  const validateBeforeSave = () => {
    const tables = items.filter((item) => isTableType(item.type));
    const chairsAndSofas = items.filter((item) => isSeatType(item.type));

    if (tables.length === 0 && chairsAndSofas.length > 0) {
      alert("You cannot save chairs or sofas without any table.");
      return false;
    }

    const invalidItems = chairsAndSofas.filter(
      (item) =>
        item.parentTableId === null ||
        item.parentTableId === undefined ||
        item.parentTableId === "" ||
        !tables.some(
          (table) => String(table.id) === String(item.parentTableId)
        )
    );

    if (invalidItems.length > 0) {
      alert(
        "Some chairs or sofas are not linked to a table. Please select a Parent Table for each chair/sofa."
      );
      return false;
    }

    return true;
  };

  const handleSaveLayout = async () => {
    if (!venue?.id || !sectionId || !areaId) {
      alert("Missing cafe, section, or area");
      return;
    }

    if (!validateBeforeSave()) return;

    try {
      setSaving(true);

      const layoutWithLabels = items.map((item, index) => {
        if (isTableType(item.type)) {
          const tableIndex = items
            .filter((x) => isTableType(x.type))
            .findIndex((x) => String(x.id) === String(item.id));

          return {
            ...item,
            label: item.label || getTableDisplayName(item, tableIndex),
            parentTableId: "",
          };
        }

        return {
          ...item,
          parentTableId: item.parentTableId ? String(item.parentTableId) : "",
        };
      });

      await axios.post(`${API_BASE}/save`, {
        cafe_id: venue.id,
        section_id: sectionId,
        area_id: areaId,
        layout: layoutWithLabels,
      });

      alert("Cafe map saved successfully");
      fetchMapItems();
    } catch (error) {
      console.error("Save cafe layout error:", error);
      alert("Failed to save cafe map");
    } finally {
      setSaving(false);
    }
  };

  const renderItemContent = (item) => {
    if (isTableType(item.type)) {
      return (
        <span className="map-label-text">
          {item.label || "Table"}
        </span>
      );
    }

    if (item.type === "chair") {
      const parentTable = tableOptions.find(
        (table) => String(table.id) === String(item.parentTableId)
      );

      return (
        <span className="map-label-text small-label">
          {parentTable ? "Chair" : "No Table"}
        </span>
      );
    }

    if (item.type === "sofa") {
      const parentTable = tableOptions.find(
        (table) => String(table.id) === String(item.parentTableId)
      );

      return (
        <span className="map-label-text small-label">
          {parentTable ? "Sofa" : "No Table"}
        </span>
      );
    }

    switch (item.type) {
      case "window":
        return <span>Window</span>;

      case "door":
        return <span>Door</span>;

      case "bar":
        return <span>Bar</span>;

      case "pool":
        return <span>Pool</span>;

      case "wall":
        return <span>Wall</span>;

      case "plant":
        return <span>Plant</span>;

      default:
        return null;
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
          <h1>Create Cafe Map</h1>
          <p>
            {venue?.name || "Cafe"} — {sectionName || "Section"} /{" "}
            {areaName || "Area"}
          </p>
        </div>
      </div>

      <div className="designer-layout-wrapper">
        <div className="designer-side-panel">
          <h3>Add Items</h3>

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

          <button type="button" onClick={() => addItem("chair")}>
            <Armchair size={18} />
            <span>Chair</span>
          </button>

          <button type="button" onClick={() => addItem("window")}>
            <PanelTop size={18} />
            <span>Window</span>
          </button>

          <button type="button" onClick={() => addItem("door")}>
            <DoorOpen size={18} />
            <span>Door</span>
          </button>

          <button type="button" onClick={() => addItem("bar")}>
            <UtensilsCrossed size={18} />
            <span>Bar</span>
          </button>

          <button type="button" onClick={() => addItem("pool")}>
            <Waves size={18} />
            <span>Pool</span>
          </button>

          <button type="button" onClick={() => addItem("wall")}>
            <Minus size={18} />
            <span>Wall</span>
          </button>

          <button type="button" onClick={() => addItem("sofa")}>
            <span>🛋️</span>
            <span>Sofa</span>
          </button>

          <button type="button" onClick={() => addItem("plant")}>
            <Leaf size={18} />
            <span>Plant</span>
          </button>

          <button type="button" onClick={handleDeleteSelected}>
            <Trash2 size={18} />
            <span>Delete Selected</span>
          </button>

          <button type="button" onClick={handleDeleteLast}>
            <Trash2 size={18} />
            <span>Delete Last</span>
          </button>

          <button
            type="button"
            className="save-layout-btn"
            onClick={handleSaveLayout}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save Layout"}</span>
          </button>

          <p style={{ fontSize: "13px", marginTop: "12px", lineHeight: "1.5" }}>
            Important: every chair or sofa must be linked to a parent table.
            A chair without a table cannot be reserved by the user.
          </p>
        </div>

        <div className="designer-main-area">
          <div
            className="designer-board"
            ref={boardRef}
            onClick={() => setSelectedId(null)}
          >
            {loading && (
              <div className="empty-layout-message">
                <h2>Loading...</h2>
                <p>Please wait while the cafe layout is loading.</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="empty-layout-message">
                <h2>Start Designing Cafe</h2>
                <p>
                  Add tables first, then add chairs and link each chair to a
                  parent table.
                </p>
              </div>
            )}

            {!loading &&
              items.map((item) => (
                <div
                  key={item.id}
                  className={`designer-item ${item.type} ${
                    String(selectedId) === String(item.id) ? "selected" : ""
                  } ${
                    isSeatType(item.type) &&
                    (!item.parentTableId ||
                      !tableOptions.some(
                        (table) =>
                          String(table.id) === String(item.parentTableId)
                      ))
                      ? "unlinked-seat"
                      : ""
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation || 0}deg)`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(String(item.id));
                  }}
                  title={
                    isSeatType(item.type)
                      ? getParentTableName(item.parentTableId)
                      : item.label || item.type
                  }
                >
                  {renderItemContent(item)}
                </div>
              ))}
          </div>
        </div>

        <div className="designer-properties-panel">
          <h3>Properties</h3>

          {!selectedItem && <p>Select any item to edit its properties.</p>}

          {selectedItem && (
            <>
              <div className="property-group">
                <label>Type</label>
                <input type="text" value={selectedItem.type} disabled />
              </div>

              <div className="property-group">
                <label>
                  {isTableType(selectedItem.type) ? "Table Name" : "Label"}
                </label>

                <input
                  type="text"
                  value={selectedItem.label || ""}
                  placeholder={
                    isTableType(selectedItem.type)
                      ? "Example: Table A / Family Table"
                      : "Label"
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
                  value={selectedItem.rotation}
                  onChange={(e) =>
                    updateSelectedItem("rotation", Number(e.target.value) || 0)
                  }
                />
              </div>

              {isSeatType(selectedItem.type) && (
                <>
                  <div className="property-group">
                    <label>Seats Count</label>
                    <input
                      type="number"
                      value={selectedItem.seats}
                      onChange={(e) =>
                        updateSelectedItem("seats", Number(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="property-group">
                    <label>Parent Table</label>

                    <select
                      value={
                        selectedItem.parentTableId
                          ? String(selectedItem.parentTableId)
                          : ""
                      }
                      onChange={(e) =>
                        updateSelectedItem(
                          "parentTableId",
                          e.target.value === "" ? "" : e.target.value
                        )
                      }
                      className="property-select"
                    >
                      <option value="">Select parent table</option>

                      {tableOptions.map((table, index) => (
                        <option key={String(table.id)} value={String(table.id)}>
                          {getTableDisplayName(table, index)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p style={{ fontSize: "12px", color: "#7b1b1b" }}>
                    Linked to:{" "}
                    <strong>
                      {getParentTableName(selectedItem.parentTableId)}
                    </strong>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
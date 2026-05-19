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
  Leaf,
  Music,
  Crown,
} from "lucide-react";
import "./CreateSeats.css";
import "./CreateRestaurantMap.css";

export default function CreateWeddingHallMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardRef = useRef(null);

  const { venue, sectionId, sectionName } = location.state || {};

  const API_URL = `${process.env.REACT_APP_API_URL}/api/wedding-options/${venue?.id}`;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);

  const canLoadMap = useMemo(() => {
    return Boolean(venue?.id && sectionId);
  }, [venue, sectionId]);

  const getItemSize = (type) => {
    switch (type) {
      case "round-table":
        return { width: 90, height: 90 };
      case "rect-table":
        return { width: 150, height: 80 };
      case "chair":
        return { width: 34, height: 34 };
      case "window":
        return { width: 120, height: 26 };
      case "door":
        return { width: 75, height: 28 };
      case "pool":
        return { width: 190, height: 110 };
      case "plant":
        return { width: 50, height: 50 };
      case "dance-floor":
        return { width: 230, height: 160 };
      case "bride-groom-stage":
        return { width: 260, height: 90 };
      default:
        return { width: 90, height: 90 };
    }
  };

  const getDefaultLabel = (type) => {
    switch (type) {
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
      case "bride-groom-stage":
        return "Bride & Groom";
      default:
        return "";
    }
  };

  const normalizeItem = useCallback((item, index = 0) => {
    const type = item.type || "round-table";
    const size = getItemSize(type);

    return {
      id: item.id || `temp-${Date.now()}-${index}`,
      type,
      label: item.label || getDefaultLabel(type),
      x: Number(item.x ?? 160),
      y: Number(item.y ?? 160),
      width: Number(item.width ?? size.width),
      height: Number(item.height ?? size.height),
      rotation: Number(item.rotation ?? 0),
      seats: Number(item.seats ?? 0),
      parentTableId: item.parentTableId || null,
      isReservable:
        type === "round-table" || type === "rect-table" || type === "chair"
          ? 1
          : 0,
    };
  }, []);

  const fetchMapItems = useCallback(async () => {
    if (!canLoadMap) return;

    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/layout/${sectionId}`);
      const mapData = Array.isArray(response.data?.map) ? response.data.map : [];

      setItems(mapData.map((item, index) => normalizeItem(item, index)));
      setSelectedId(null);
    } catch (error) {
      console.error("Fetch wedding map error:", error);
      alert("Failed to load wedding hall map");
    } finally {
      setLoading(false);
    }
  }, [API_URL, sectionId, canLoadMap, normalizeItem]);

  useEffect(() => {
    fetchMapItems();
  }, [fetchMapItems]);

  const createChairsAroundTable = (table, seats) => {
    const chairs = [];

    const centerX = table.x + table.width / 2;
    const centerY = table.y + table.height / 2;

    const radiusX = table.type === "rect-table" ? table.width / 2 + 35 : 75;
    const radiusY = table.type === "rect-table" ? table.height / 2 + 35 : 75;

    for (let i = 0; i < seats; i += 1) {
      const angle = (2 * Math.PI * i) / seats;

      chairs.push({
        id: `${table.id}-chair-${i}`,
        type: "chair",
        label: "",
        parentTableId: table.id,
        x: centerX + radiusX * Math.cos(angle) - 17,
        y: centerY + radiusY * Math.sin(angle) - 17,
        width: 34,
        height: 34,
        rotation: 0,
        seats: 1,
        isReservable: 1,
      });
    }

    return chairs;
  };

  const addWeddingTable = (type) => {
    const seatsInput = prompt("How many seats do you want around this table?");
    const seats = Number(seatsInput);

    if (!seats || seats < 1) {
      alert("Please enter a valid number of seats.");
      return;
    }

    const size = getItemSize(type);
    const tableId = `table-${Date.now()}-${Math.random()}`;

    const table = {
      id: tableId,
      type,
      label: "",
      x: 220,
      y: 220,
      width: size.width,
      height: size.height,
      rotation: 0,
      seats,
      parentTableId: null,
      isReservable: 1,
    };

    const chairs = createChairsAroundTable(table, seats);

    setItems((prev) => [...prev, table, ...chairs]);
    setSelectedId(tableId);
  };

  const addItem = (type) => {
    const size = getItemSize(type);

    const newItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      type,
      label: getDefaultLabel(type),
      x: 180,
      y: 180,
      width: size.width,
      height: size.height,
      rotation: 0,
      seats: type === "chair" ? 1 : 0,
      parentTableId: null,
      isReservable: type === "chair" ? 1 : 0,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const board = boardRef.current;
    const item = items.find((i) => i.id === id);

    if (!board || !item) return;

    const rect = board.getBoundingClientRect();

    setSelectedId(id);
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

        let newX = e.clientX - rect.left - offset.x;
        let newY = e.clientY - rect.top - offset.y;

        const maxX = rect.width - item.width;
        const maxY = rect.height - item.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        const snapDistance = 25;
        let newRotation = item.rotation || 0;

        if (["window", "door"].includes(item.type)) {
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

  const handleDeleteSelected = () => {
    if (!selectedId) {
      alert("Select an item first.");
      return;
    }

    const selectedItem = items.find((item) => item.id === selectedId);

    if (!selectedItem) return;

    if (selectedItem.type === "round-table" || selectedItem.type === "rect-table") {
      setItems((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedId && item.parentTableId !== selectedItem.id
        )
      );
    } else {
      setItems((prev) => prev.filter((item) => item.id !== selectedId));
    }

    setSelectedId(null);
  };

  const handleDeleteLast = () => {
    if (items.length === 0) return;

    const lastItem = items[items.length - 1];
    setItems((prev) => prev.filter((item) => item.id !== lastItem.id));
    setSelectedId(null);
  };

  const updateSelectedItem = (field, value) => {
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

  const handleSaveLayout = async () => {
    if (!venue?.id || !sectionId) {
      alert("Missing wedding hall or section.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${API_URL}/layout`, {
        section_id: sectionId,
        map: items,
      });

      alert("Wedding hall map saved successfully");
      fetchMapItems();
    } catch (error) {
      console.error("Save wedding map error:", error);
      alert("Failed to save wedding hall map");
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  const renderItemContent = (item) => {
    switch (item.type) {
      case "window":
        return <span>Window</span>;
      case "door":
        return <span>Door</span>;
      case "pool":
        return <span>Pool</span>;
      case "plant":
        return <span>Plant</span>;
      case "dance-floor":
        return <span>Dance Floor</span>;
      case "bride-groom-stage":
        return <span>Bride & Groom</span>;
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
          <h1>Create Wedding Hall Map</h1>
          <p>
            {venue?.name || "Wedding Hall"} — {sectionName || "Section"}
          </p>
        </div>
      </div>

      <div className="designer-layout-wrapper">
        <div className="designer-side-panel">
          <h3>Add Items</h3>

          <button type="button" onClick={() => addWeddingTable("round-table")}>
            <Circle size={18} />
            <span>Round Table</span>
          </button>

          <button type="button" onClick={() => addWeddingTable("rect-table")}>
            <Square size={18} />
            <span>Rectangle Table</span>
          </button>

          <button type="button" onClick={() => addItem("chair")}>
            <Armchair size={18} />
            <span>Single Chair</span>
          </button>

          <button type="button" onClick={() => addItem("window")}>
            <PanelTop size={18} />
            <span>Window</span>
          </button>

          <button type="button" onClick={() => addItem("door")}>
            <DoorOpen size={18} />
            <span>Door</span>
          </button>

          <button type="button" onClick={() => addItem("pool")}>
            <Waves size={18} />
            <span>Pool</span>
          </button>

          <button type="button" onClick={() => addItem("plant")}>
            <Leaf size={18} />
            <span>Plant</span>
          </button>

          <button type="button" onClick={() => addItem("dance-floor")}>
            <Music size={18} />
            <span>Dance Floor</span>
          </button>

          <button type="button" onClick={() => addItem("bride-groom-stage")}>
            <Crown size={18} />
            <span>Bride & Groom Stage</span>
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
                <p>Please wait while the wedding hall layout is loading.</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="empty-layout-message">
                <h2>Start Designing Wedding Hall</h2>
                <p>
                  Add tables, chairs, dance floor, bride and groom stage, pool,
                  doors, windows, and plants.
                </p>
              </div>
            )}

            {!loading &&
              items.map((item) => (
                <div
                  key={item.id}
                  className={`designer-item ${item.type} ${
                    selectedId === item.id ? "selected" : ""
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
                    setSelectedId(item.id);
                  }}
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
                <label>Label</label>
                <input
                  type="text"
                  value={selectedItem.label || ""}
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

              {(selectedItem.type === "round-table" ||
                selectedItem.type === "rect-table") && (
                <div className="property-group">
                  <label>Seats</label>
                  <input type="number" value={selectedItem.seats} disabled />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

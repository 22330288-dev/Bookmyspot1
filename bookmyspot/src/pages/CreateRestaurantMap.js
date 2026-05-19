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

const API_BASE = "${process.env.REACT_APP_API_URL}/api/venue-map";

export default function CreateRestaurantMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const boardRef = useRef(null);

  const { venue, sectionId, sectionName, areaId, areaName } = location.state || {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [deletedIds, setDeletedIds] = useState([]);
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

  const isReservableType = (type) => {
    return ["round-table", "rect-table", "square-table", "chair", "sofa"].includes(type);
  };

  const getDefaultSeats = (type) => {
    switch (type) {
      case "chair":
        return 1;
      case "sofa":
        return 1;
      default:
        return 0;
    }
  };

  const getDefaultLabel = (type) => {
    switch (type) {
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

  const normalizeApiItem = useCallback((item, index = 0) => {
    const type = item.item_type || item.type || "round-table";
    const size = getItemSize(type);

    return {
      id: item.id ?? `temp-${Date.now()}-${index}`,
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
          ? Number(item.parent_table_id)
          : item.parentTableId !== null && item.parentTableId !== undefined
          ? Number(item.parentTableId)
          : null,
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

      setItems(normalized);
      setDeletedIds([]);
      setSelectedId(null);
    } catch (error) {
      console.error("Fetch map items error:", error);
      alert("Failed to load map items");
    } finally {
      setLoading(false);
    }
  }, [canLoadMap, venue?.id, sectionId, areaId, normalizeApiItem]);

  useEffect(() => {
    fetchMapItems();
  }, [fetchMapItems]);

  const addItem = (type) => {
    const size = getItemSize(type);

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
      parentTableId: null,
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
            newX = rect.width - ((item.width + item.height) / 2);
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
      alert("Select an item first");
      return;
    }

    const itemToDelete = items.find((item) => item.id === selectedId);
    if (!itemToDelete) return;

    if (itemToDelete.dbId) {
      setDeletedIds((prev) => [...prev, itemToDelete.dbId]);
    }

    setItems((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const handleDeleteLast = () => {
    if (items.length === 0) return;

    const lastItem = items[items.length - 1];

    if (lastItem.dbId) {
      setDeletedIds((prev) => [...prev, lastItem.dbId]);
    }

    setItems((prev) => prev.slice(0, -1));

    if (selectedId === lastItem.id) {
      setSelectedId(null);
    }
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

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  const tableOptions = useMemo(() => {
    return items.filter((item) =>
      ["round-table", "rect-table", "square-table"].includes(item.type)
    );
  }, [items]);

  const handleSaveLayout = async () => {
    if (!venue?.id || !sectionId || !areaId) {
      alert("Missing venue, section, or area");
      return;
    }

    try {
      setSaving(true);

      if (deletedIds.length > 0) {
        await Promise.all(
          deletedIds.map((id) => axios.delete(`${API_BASE}/${id}`))
        );
      }

      for (const item of items) {
        const payload = {
          venue_id: venue.id,
          section_id: sectionId,
          area_id: areaId,
          item_type: item.type,
          label: item.label || null,
          x: Math.round(item.x),
          y: Math.round(item.y),
          width: Number(item.width),
          height: Number(item.height),
          rotation: Number(item.rotation || 0),
          seats_count: Number(item.seats || 0),
          is_reservable: Number(item.isReservable || 0),
          parent_table_id:
            item.parentTableId !== null && item.parentTableId !== undefined && item.parentTableId !== ""
              ? Number(item.parentTableId)
              : null,
        };

        if (item.dbId) {
          await axios.put(`${API_BASE}/${item.dbId}`, {
            label: payload.label,
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
            rotation: payload.rotation,
            seats_count: payload.seats_count,
            is_reservable: payload.is_reservable,
            parent_table_id: payload.parent_table_id,
          });
        } else {
          const response = await axios.post(API_BASE, payload);
          item.dbId = response.data?.id || null;
        }
      }

      alert("Map saved successfully");
      fetchMapItems();
    } catch (error) {
      console.error("Save layout error:", error);
      alert("Failed to save map");
    } finally {
      setSaving(false);
    }
  };

  const renderItemContent = (item) => {
    switch (item.type) {
      case "round-table":
      case "rect-table":
      case "square-table":
        return null;

      case "chair":
        return null;

      case "window":
        return <span>Window</span>;

      case "door":
        return <span>Door</span>;

      case "bar":
        return <span>Bar</span>;

      case "pool":
        return <span>Pool</span>;

      case "sofa":
        return <span>Sofa</span>;

      case "plant":
        return <span>Plant</span>;

      case "wall":
        return null;

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
          <h1>Create Restaurant Map</h1>
          <p>
            {venue?.name || "Restaurant"} — {sectionName || "Section"} /{" "}
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
                <p>Please wait while the layout is loading.</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="empty-layout-message">
                <h2>Start Designing</h2>
                <p>
                  Add tables, chairs, windows, doors, walls, bar, pool, sofa,
                  and plant, then drag them into place.
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

              {(selectedItem.type === "chair" || selectedItem.type === "sofa") && (
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
                      value={selectedItem.parentTableId ?? ""}
                      onChange={(e) =>
                        updateSelectedItem(
                          "parentTableId",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="property-select"
                    >
                      <option value="">Select parent table</option>
                      {tableOptions.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.type} #{table.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

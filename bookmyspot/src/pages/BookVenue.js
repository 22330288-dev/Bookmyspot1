import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Camera,
  MessageCircle,
  MapPin,
  Clock3,
  Users,
} from "lucide-react";
import "./BookVenue.css";

export default function BookVenue() {
  const navigate = useNavigate();
  const location = useLocation();

  const venue = useMemo(
    () =>
      location.state?.venue || {
        id: null,
        name: "Venue Name",
        city: "Beirut",
        area: "Downtown",
        description: "Venue Description",
        image: "/images/restaurants/default-restaurant.jpg",
        address: "Downtown, Beirut",
        phone: "+961 70 000 000",
        instagram: "@venue",
        whatsapp: "+96170000000",
        hours: "8:30 PM - 1:00 AM",
        category: "Restaurant",
        rating: 4.5,
        mapLayout: [],
      },
    [location.state]
  );

  const [preferredTime, setPreferredTime] = useState("19:00");
  const [duration, setDuration] = useState("1 hour");
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedChairIds, setSelectedChairIds] = useState([]);

  const defaultTables = useMemo(
    () => [
      {
        id: 1,
        type: "round-table",
        shape: "round",
        seats: 6,
        status: "available",
        top: "100px",
        left: "120px",
      },
      {
        id: 2,
        type: "rect-table",
        shape: "rect",
        seats: 6,
        status: "available",
        top: "100px",
        left: "420px",
      },
      {
        id: 3,
        type: "square-table",
        shape: "square",
        seats: 4,
        status: "reserved",
        top: "260px",
        left: "220px",
      },
    ],
    []
  );

  const normalizedTables = useMemo(() => {
    const layout =
      Array.isArray(venue?.mapLayout) && venue.mapLayout.length > 0
        ? venue.mapLayout
        : defaultTables;

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

      return {
        ...item,
        id: item.id ?? index + 1,
        type,
        shape,
        seats: typeof item.seats === "number" ? item.seats : 4,
        status: item.status || "available",
        top:
          typeof item.top === "string"
            ? item.top
            : typeof item.y === "number"
            ? `${item.y}px`
            : "100px",
        left:
          typeof item.left === "string"
            ? item.left
            : typeof item.x === "number"
            ? `${item.x}px`
            : "100px",
      };
    });
  }, [venue?.mapLayout, defaultTables]);

  const getTableMetrics = (table) => {
    const left = parseInt(table.left, 10) || 0;
    const top = parseInt(table.top, 10) || 0;

    if (table.shape === "rect") {
      return {
        centerX: left + 65,
        centerY: top + 40,
        radius: 84,
      };
    }

    if (table.shape === "square") {
      return {
        centerX: left + 45,
        centerY: top + 45,
        radius: 76,
      };
    }

    return {
      centerX: left + 40,
      centerY: top + 40,
      radius: 74,
    };
  };

  const getChairsAroundTable = (table) => {
    const chairCount = table.seats || 4;
    const chairs = [];
    const { centerX, centerY, radius } = getTableMetrics(table);

    for (let i = 0; i < chairCount; i += 1) {
      const angle = (2 * Math.PI * i) / chairCount;
      const x = centerX + radius * Math.cos(angle) - 14;
      const y = centerY + radius * Math.sin(angle) - 14;

      chairs.push({
        id: `${table.id}-chair-${i}`,
        tableId: table.id,
        index: i + 1,
        left: `${x}px`,
        top: `${y}px`,
      });
    }

    return chairs;
  };

  const allChairs = normalizedTables.flatMap((table) =>
    getChairsAroundTable(table)
  );

  const selectedSeatsCount = selectedChairIds.length;
  const totalPrice = selectedSeatsCount * 20;
  const deposit = Math.round(totalPrice * 0.1);

  const handleTableClick = (table) => {
    if (table.status === "reserved") return;

    setSelectedTable(table);
    setSelectedChairIds([]);
  };

  const handleChairClick = (chair) => {
    if (!selectedTable) {
      alert("Please select a table first.");
      return;
    }

    if (selectedTable.id !== chair.tableId) {
      alert("You can only select chairs from the selected table.");
      return;
    }

    setSelectedChairIds((prev) => {
      if (prev.includes(chair.id)) {
        return prev.filter((id) => id !== chair.id);
      }

      if (prev.length >= selectedTable.seats) {
        return prev;
      }

      return [...prev, chair.id];
    });
  };

  const handlePayment = () => {
    if (!selectedTable) {
      alert("Please select a table first.");
      return;
    }

    if (selectedSeatsCount < 1) {
      alert("Please select at least one chair.");
      return;
    }

    navigate("/pay-deposit", {
      state: {
        booking: {
          venueId: venue.id,
          venueName: venue.name,
          tableId: selectedTable.id,
          tableType: selectedTable.type,
          tableCapacity: selectedTable.seats,
          selectedChairIds,
          bookedSeats: selectedSeatsCount,
          time: preferredTime,
          duration,
          totalPrice,
          deposit,
          category: venue.category,
          address: venue.address,
        },
      },
    });
  };

  const showCreateSeats =
    venue.category === "Wedding Hall" || venue.category === "Event Venue";

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={venue.image || "/images/restaurants/default-restaurant.jpg"}
            alt={venue.name}
            onError={(e) => {
              e.target.src = "/images/restaurants/default-restaurant.jpg";
            }}
          />

          <button
            type="button"
            className="book-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="book-info-card">
          <h1>{venue.name}</h1>

          <p className="book-type">
            {venue.category} • {venue.description}
          </p>

          <div className="book-info-row">
            <MapPin size={18} />
            <span>{venue.address}</span>
          </div>

          <div className="book-info-row">
            <Clock3 size={18} />
            <span>{venue.hours}</span>
          </div>

          <div className="contact-actions">
            <a href={`tel:${venue.phone}`} className="contact-btn">
              <Phone size={20} />
              <span>Call</span>
            </a>

            <a
              href={`https://wa.me/${(venue.whatsapp || "").replace(/\+/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://instagram.com/${(venue.instagram || "").replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <Camera size={20} />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {showCreateSeats && (
          <button
            type="button"
            className="create-seats-btn"
            onClick={() =>
              navigate("/create-seats", {
                state: { venue },
              })
            }
          >
            Create Seats
          </button>
        )}

        <div className="table-map-card">
          <h2>Choose Table and Chairs</h2>

          <p className="table-legend">
            <span className="legend-item">
              <span className="legend-box available"></span>
              Available
            </span>

            <span className="legend-item">
              <span className="legend-box reserved"></span>
              Reserved
            </span>

            <span className="legend-item">
              <span className="legend-box chair-selected"></span>
              Selected Chair
            </span>
          </p>

          <div className="table-map">
            {normalizedTables.map((table) => (
              <div
                key={table.id}
                className={`table-shape ${
                  table.shape === "square"
                    ? "square"
                    : table.shape === "rect"
                    ? "rect"
                    : "round"
                } ${table.status} ${
                  selectedTable?.id === table.id ? "selected-table" : ""
                }`}
                style={{
                  top: table.top,
                  left: table.left,
                }}
                onClick={() => handleTableClick(table)}
                title={`Table ${table.id} - Capacity ${table.seats}`}
              >
                {table.seats}
              </div>
            ))}

            {allChairs.map((chair) => {
              const isFromSelectedTable = selectedTable?.id === chair.tableId;
              const isSelected = selectedChairIds.includes(chair.id);

              return (
                <div
                  key={chair.id}
                  className={`table-shape chair ${
                    isFromSelectedTable ? "chair-active-table" : ""
                  } ${isSelected ? "chair-selected" : ""}`}
                  style={{
                    top: chair.top,
                    left: chair.left,
                  }}
                  onClick={() => handleChairClick(chair)}
                  title={`Chair ${chair.index}`}
                >
                  1
                </div>
              );
            })}
          </div>
        </div>

        <div className="reservation-details-card">
          <h2>Reservation Details</h2>

          <label className="reserve-label">
            <Users size={18} />
            <span>Selected Seats</span>
          </label>

          <input
            type="number"
            value={selectedSeatsCount}
            readOnly
            className="book-input"
          />

          <label className="reserve-label">
            <Clock3 size={18} />
            <span>Preferred Time</span>
          </label>

          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="book-input"
          />

          <label className="reserve-label">
            <Clock3 size={18} />
            <span>Duration</span>
          </label>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="book-input"
          >
            <option>1 hour</option>
            <option>2 hours</option>
            <option>3 hours</option>
            <option>4 hours</option>
          </select>

          <div className="selected-info">
            {selectedTable ? (
              <>
                <p>
                  Selected Table: <strong>Table {selectedTable.id}</strong>
                </p>
                <p>
                  Table Capacity: <strong>{selectedTable.seats}</strong>
                </p>
                <p>
                  Selected Chairs: <strong>{selectedSeatsCount}</strong>
                </p>
                <p>
                  Total: <strong>${totalPrice}</strong>
                </p>
                <p>
                  Deposit (10%): <strong>${deposit}</strong>
                </p>
              </>
            ) : (
              <p>No table selected yet.</p>
            )}
          </div>

          <button
            type="button"
            className="payment-btn"
            onClick={handlePayment}
          >
            Reserve & Pay ${deposit > 0 ? deposit : 0}
          </button>
        </div>
      </div>
    </div>
  );
}
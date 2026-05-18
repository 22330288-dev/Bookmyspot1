import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Camera,
  MessageCircle,
  MapPin,
  Clock3,
  Users,
  CalendarDays,
} from "lucide-react";
import "./BookVenue.css";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function parseArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

export default function BookVenueCafe() {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingMode = location.state?.mode || "create";
  const bookingToShow = location.state?.booking || null;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userEmail = user?.email || bookingToShow?.email || "";

  const venue = useMemo(
    () =>
      location.state?.venue || {
        id: bookingToShow?.venue_id || bookingToShow?.cafe_id || null,
        name:
          bookingToShow?.venue_name ||
          bookingToShow?.cafe_name ||
          "Cafe Name",
        city: "Beirut",
        area: "Downtown",
        description: "Cafe Description",
        image: "/images/beirut/kami.jpeg",
        address: "Downtown, Beirut",
        phone: "+961 70 000 000",
        instagram: "@cafe",
        whatsapp: "+96170000000",
        hours: "8:30 PM - 1:00 AM",
        category: "Cafe",
        type: "cafe",
        rating: 4.5,
        has_smoking: true,
        google_maps_link: "",
      },
    [location.state, bookingToShow]
  );

  const [todayValue, setTodayValue] = useState(getTodayString());

  const minDate = todayValue;

  const maxDateObj = new Date(todayValue);
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [bookingDate, setBookingDate] = useState(
    bookingToShow?.booking_date || getTodayString()
  );

  const [preferredTime, setPreferredTime] = useState(
    bookingToShow?.booking_time || "19:00"
  );

  const [duration, setDuration] = useState(
    bookingToShow?.duration || "1 hour"
  );

  const [sections, setSections] = useState([]);
  const [areas, setAreas] = useState([]);

  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState(
    bookingToShow?.section || ""
  );

  const [areaId, setAreaId] = useState("");
  const [areaName, setAreaName] = useState(bookingToShow?.area || "");

  const [mapLayout, setMapLayout] = useState([]);

  const [selectedTable, setSelectedTable] = useState(
    bookingToShow?.table_id
      ? {
          id: String(bookingToShow.table_id),
          type: "round-table",
        }
      : null
  );

  const [selectedChairIds, setSelectedChairIds] = useState(
    parseArray(bookingToShow?.selected_chairs)
  );

  const [selectedSofaIds, setSelectedSofaIds] = useState(
    parseArray(bookingToShow?.selected_sofas)
  );

  const [editingBookingId, setEditingBookingId] = useState(
    bookingToShow?.id || null
  );

  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [reservedChairIds, setReservedChairIds] = useState([]);
  const [reservedSofaIds, setReservedSofaIds] = useState([]);

  const [reservedInfoByTableId, setReservedInfoByTableId] = useState({});
  const [reservedInfoByItemId, setReservedInfoByItemId] = useState({});

  const openLocationMap = () => {
    const locationText =
      venue.address ||
      `${venue.area || ""}, ${venue.city || ""}` ||
      `${venue.city || ""} ${venue.area || ""}`;

    const mapUrl =
      venue.google_maps_link ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        locationText
      )}`;

    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getTodayString();
      setTodayValue(newToday);

      if (bookingDate < newToday) {
        setBookingDate(newToday);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [bookingDate]);

  useEffect(() => {
    if (!venue?.id) return;

    async function fetchSections() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/cafe-options/${venue.id}/sections`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load cafe sections");
          return;
        }

        const fetchedSections = Array.isArray(data) ? data : [];
        setSections(fetchedSections);

        if (bookingToShow?.section) {
          const foundSection = fetchedSections.find(
            (item) =>
              String(item.section_name).toLowerCase() ===
              String(bookingToShow.section).toLowerCase()
          );

          if (foundSection) {
            setSectionId(String(foundSection.id));
            setSectionName(foundSection.section_name || "");
            return;
          }
        }

        if (fetchedSections.length > 0) {
          setSectionId(String(fetchedSections[0].id));
          setSectionName(fetchedSections[0].section_name || "");
        } else {
          setSectionId("");
          setSectionName("");
        }
      } catch (error) {
        console.error("FETCH CAFE SECTIONS ERROR:", error);
      }
    }

    fetchSections();
  }, [venue?.id, bookingToShow]);

  useEffect(() => {
    if (!venue?.id || !sectionId) {
      setAreas([]);
      setAreaId("");
      setAreaName("");
      return;
    }

    async function fetchAreas() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/cafe-options/${venue.id}/areas/${sectionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load cafe areas");
          return;
        }

        const fetchedAreas = Array.isArray(data) ? data : [];
        setAreas(fetchedAreas);

        if (bookingToShow?.area) {
          const foundArea = fetchedAreas.find(
            (item) =>
              String(item.area_name).toLowerCase() ===
              String(bookingToShow.area).toLowerCase()
          );

          if (foundArea) {
            setAreaId(String(foundArea.id));
            setAreaName(foundArea.area_name || "");
            return;
          }
        }

        if (fetchedAreas.length > 0) {
          setAreaId(String(fetchedAreas[0].id));
          setAreaName(fetchedAreas[0].area_name || "");
        } else {
          setAreaId("");
          setAreaName("");
        }
      } catch (error) {
        console.error("FETCH CAFE AREAS ERROR:", error);
      }
    }

    fetchAreas();
  }, [venue?.id, sectionId, bookingToShow]);

  useEffect(() => {
    if (bookingMode !== "create") return;

    setSelectedTable(null);
    setSelectedChairIds([]);
    setSelectedSofaIds([]);
  }, [sectionId, areaId, bookingMode]);

  useEffect(() => {
    if (!venue?.id || !sectionId || !areaId) {
      setMapLayout([]);
      return;
    }

    async function fetchMapLayout() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/cafe-layouts?venue_id=${venue.id}&section_id=${sectionId}&area_id=${areaId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load cafe map");
          setMapLayout([]);
          return;
        }

        setMapLayout(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("FETCH CAFE MAP ERROR:", error);
        setMapLayout([]);
      }
    }

    fetchMapLayout();
  }, [venue?.id, sectionId, areaId]);

  useEffect(() => {
    if (!venue?.id || !bookingDate || !preferredTime) return;

    async function fetchReservedItems() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bookings/venue/${venue.id}?booking_date=${bookingDate}&booking_time=${preferredTime}&duration=${encodeURIComponent(
            duration
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.message || "Failed to fetch reserved cafe tables");
          return;
        }

        const tableIds = [];
        const chairIds = [];
        const sofaIds = [];

        const tableInfoMap = {};
        const itemInfoMap = {};

        (Array.isArray(data) ? data : []).forEach((booking) => {
          if (
            bookingMode === "edit" &&
            String(booking.id) === String(editingBookingId)
          ) {
            return;
          }

          const tableId = String(booking.table_id);

          const bookingInfo = {
            from: booking.reserved_from || booking.booking_time || "",
            until: booking.reserved_until || "",
            duration: booking.duration || "",
            bookingNumber: booking.booking_number || `BK-${booking.id}`,
          };

          if (tableId && tableId !== "undefined" && tableId !== "null") {
            tableIds.push(tableId);
            tableInfoMap[tableId] = bookingInfo;
          }

          parseArray(booking.selected_chairs).forEach((id) => {
            const chairId = String(id);
            chairIds.push(chairId);
            itemInfoMap[chairId] = bookingInfo;
          });

          parseArray(booking.selected_sofas).forEach((id) => {
            const sofaId = String(id);
            sofaIds.push(sofaId);
            itemInfoMap[sofaId] = bookingInfo;
          });
        });

        setReservedTableIds(tableIds);
        setReservedChairIds(chairIds);
        setReservedSofaIds(sofaIds);

        setReservedInfoByTableId(tableInfoMap);
        setReservedInfoByItemId(itemInfoMap);
      } catch (error) {
        console.error("FETCH CAFE RESERVED ITEMS ERROR:", error);
      }
    }

    fetchReservedItems();
  }, [
    venue?.id,
    bookingDate,
    preferredTime,
    duration,
    bookingMode,
    editingBookingId,
  ]);

  useEffect(() => {
    if (!bookingToShow) return;

    setEditingBookingId(bookingToShow.id || null);

    if (bookingToShow.booking_date) {
      setBookingDate(bookingToShow.booking_date);
    }

    if (bookingToShow.booking_time) {
      setPreferredTime(bookingToShow.booking_time);
    }

    if (bookingToShow.duration) {
      setDuration(bookingToShow.duration);
    }

    if (bookingToShow.section) {
      setSectionName(bookingToShow.section);
    }

    if (bookingToShow.area) {
      setAreaName(bookingToShow.area);
    }

    if (bookingToShow.table_id) {
      setSelectedTable({
        id: String(bookingToShow.table_id),
        type: "round-table",
      });
    }

    setSelectedChairIds(parseArray(bookingToShow.selected_chairs));
    setSelectedSofaIds(parseArray(bookingToShow.selected_sofas));
  }, [bookingToShow]);

  const normalizeItemType = (item) => {
    const rawType = String(
      item.item_type || item.type || item.shape || ""
    ).toLowerCase();

    if (rawType.includes("round")) return "round-table";
    if (rawType.includes("rect")) return "rect-table";
    if (rawType.includes("square")) return "square-table";
    if (rawType.includes("chair")) return "chair";
    if (rawType.includes("sofa")) return "sofa";
    if (rawType.includes("window")) return "window";
    if (rawType.includes("door")) return "door";
    if (rawType.includes("plant")) return "plant";
    if (rawType.includes("bar")) return "bar";
    if (rawType.includes("pool")) return "pool";

    return rawType || "round-table";
  };

  const getItemRealId = (item, index) => {
    return String(
      item.map_item_id ||
        item.item_id ||
        item.layout_id ||
        item.id ||
        `item-${index + 1}`
    );
  };

  const cafeMapItems = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => {
      const type = normalizeItemType(item);
      const id = getItemRealId(item, index);

      const reservableTypes = [
        "round-table",
        "rect-table",
        "square-table",
        "chair",
        "sofa",
      ];

      const isReservable = reservableTypes.includes(type);

      let isReserved = false;

      if (["round-table", "rect-table", "square-table"].includes(type)) {
        isReserved = reservedTableIds.map(String).includes(String(id));
      } else if (type === "chair") {
        isReserved = reservedChairIds.map(String).includes(String(id));
      } else if (type === "sofa") {
        isReserved = reservedSofaIds.map(String).includes(String(id));
      }

      return {
        ...item,
        id,
        type,
        label: item.label || "",
        x:
          typeof item.x === "number"
            ? item.x
            : Number(item.x) || Number(parseInt(item.left, 10)) || 100,
        y:
          typeof item.y === "number"
            ? item.y
            : Number(item.y) || Number(parseInt(item.top, 10)) || 100,
        width:
          typeof item.width === "number"
            ? item.width
            : Number(item.width) || 90,
        height:
          typeof item.height === "number"
            ? item.height
            : Number(item.height) || 90,
        rotation:
          typeof item.rotation === "number"
            ? item.rotation
            : Number(item.rotation) || 0,
        seats:
          typeof item.seats_count === "number"
            ? item.seats_count
            : typeof item.seats === "number"
            ? item.seats
            : Number(item.seats_count || item.seats) || 0,
        parentTableId:
          item.parent_table_id !== null && item.parent_table_id !== undefined
            ? String(item.parent_table_id)
            : item.parentTableId !== null && item.parentTableId !== undefined
            ? String(item.parentTableId)
            : "",
        isReservable: isReservable ? 1 : 0,
        status: isReserved ? "reserved" : "available",
      };
    });
  }, [mapLayout, reservedTableIds, reservedChairIds, reservedSofaIds]);

  const selectedSeatsCount = useMemo(() => {
    return selectedChairIds.length + selectedSofaIds.length * 2;
  }, [selectedChairIds, selectedSofaIds]);

  const deposit = useMemo(() => {
    if (!selectedTable) return 0;
    return Math.round(selectedSeatsCount * 10 * 0.1);
  }, [selectedTable, selectedSeatsCount]);

  const isTableType = (type) => {
    return ["round-table", "rect-table", "square-table"].includes(type);
  };

  const getReservedInfoForItem = (item) => {
    if (isTableType(item.type)) {
      return reservedInfoByTableId[String(item.id)] || null;
    }

    if (item.type === "chair" || item.type === "sofa") {
      return reservedInfoByItemId[String(item.id)] || null;
    }

    return null;
  };

  const isReservedItem = (item) => {
    if (isTableType(item.type)) {
      return reservedTableIds.map(String).includes(String(item.id));
    }

    if (item.type === "chair") {
      return reservedChairIds.map(String).includes(String(item.id));
    }

    if (item.type === "sofa") {
      return reservedSofaIds.map(String).includes(String(item.id));
    }

    return false;
  };

  const getItemHoverTitle = (item) => {
    const info = getReservedInfoForItem(item);

    if (info) {
      return `Booking Number: ${info.bookingNumber}\nDuration: ${info.duration}\nFrom: ${info.from}\nTo: ${info.until}`;
    }

    if (item.type === "chair") return "Available chair";
    if (item.type === "sofa") return "Available sofa";
    if (isTableType(item.type)) return "Available table";

    return item.type;
  };

  const handleMapItemClick = (item) => {
    if (bookingMode === "view") return;

    if (item.isReservable !== 1) return;

    if (isReservedItem(item)) {
      const info = getReservedInfoForItem(item);

      if (info) {
        alert(
          `This item is already reserved.\nBooking Number: ${info.bookingNumber}\nDuration: ${info.duration}\nFrom: ${info.from}\nTo: ${info.until}`
        );
      } else {
        alert("This item is already reserved.");
      }

      return;
    }

    if (isTableType(item.type)) {
      setSelectedTable({
        ...item,
        id: String(item.id),
      });

      setSelectedChairIds([]);
      setSelectedSofaIds([]);
      return;
    }

    if (item.type === "chair") {
      if (!selectedTable) {
        alert("Please select a table first.");
        return;
      }

      if (
        item.parentTableId &&
        String(item.parentTableId) !== String(selectedTable.id)
      ) {
        alert("You can only select chairs from the selected table.");
        return;
      }

      setSelectedChairIds((prev) =>
        prev.map(String).includes(String(item.id))
          ? prev.filter((id) => String(id) !== String(item.id))
          : [...prev, String(item.id)]
      );

      return;
    }

    if (item.type === "sofa") {
      if (!selectedTable) {
        alert("Please select a table first.");
        return;
      }

      if (
        item.parentTableId &&
        String(item.parentTableId) !== String(selectedTable.id)
      ) {
        alert("You can only select sofas from the selected table.");
        return;
      }

      setSelectedSofaIds((prev) =>
        prev.map(String).includes(String(item.id))
          ? prev.filter((id) => String(id) !== String(item.id))
          : [...prev, String(item.id)]
      );
    }
  };

  const handleSectionChange = (e) => {
    if (bookingMode === "view") return;

    const selectedId = e.target.value;
    const foundSection = sections.find(
      (item) => String(item.id) === String(selectedId)
    );

    setSectionId(selectedId);
    setSectionName(foundSection?.section_name || "");
  };

  const handleAreaChange = (e) => {
    if (bookingMode === "view") return;

    const selectedId = e.target.value;
    const foundArea = areas.find(
      (item) => String(item.id) === String(selectedId)
    );

    setAreaId(selectedId);
    setAreaName(foundArea?.area_name || "");
  };

  const handlePayment = async () => {
    if (bookingMode === "view") return;

    if (!selectedTable) {
      alert("Please select a table first.");
      return;
    }

    if (selectedSeatsCount < 1) {
      alert("Please select at least one chair or sofa.");
      return;
    }

    if (!bookingDate) {
      alert("Please select a date.");
      return;
    }

    if (bookingDate < minDate || bookingDate > maxDate) {
      alert("Please choose a date between today and the next 10 days.");
      return;
    }

    if (!sectionName) {
      alert("Please choose a section.");
      return;
    }

    if (!areaName) {
      alert("Please choose an area.");
      return;
    }

    if (!userEmail) {
      alert("User email is missing. Please log in again.");
      return;
    }

    if (bookingMode === "edit") {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bookings/${editingBookingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              table_id: String(selectedTable.id),
              selected_chairs: selectedChairIds.map(String),
              selected_sofas: selectedSofaIds.map(String),
              booked_seats: selectedSeatsCount,
              booking_date: bookingDate,
              booking_time: preferredTime,
              duration,
              section: sectionName,
              area: areaName,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Update failed");
          return;
        }

        alert("Booking updated successfully");
        navigate("/my-bookings");
      } catch (error) {
        console.error("CAFE UPDATE ERROR:", error);
        alert("Server error while updating booking");
      }

      return;
    }

    navigate("/pay-deposit", {
      state: {
        booking: {
          user_id: user?.id || bookingToShow?.user_id || null,
          userId: user?.id || bookingToShow?.user_id || null,

          venueId: venue.id,
          venue_id: venue.id,
          venueName: venue.name,
          venue_name: venue.name,

          tableId: String(selectedTable.id),
          table_id: String(selectedTable.id),
          tableType: selectedTable.type,
          tableCapacity: selectedTable.seats,

          selectedChairIds: selectedChairIds.map(String),
          selected_chairs: selectedChairIds.map(String),

          selectedSofaIds: selectedSofaIds.map(String),
          selected_sofas: selectedSofaIds.map(String),

          bookedSeats: selectedSeatsCount,
          booked_seats: selectedSeatsCount,

          bookingDate,
          booking_date: bookingDate,

          time: preferredTime,
          booking_time: preferredTime,

          duration,
          deposit,

          section: sectionName,
          area: areaName,

          category: "Cafe",
          item_type: "cafe",

          address: venue.address || `${venue.city || ""} - ${venue.area || ""}`,
          email: userEmail,
        },
      },
    });
  };

  const isSelectedItem = (item) => {
    if (
      selectedTable &&
      isTableType(item.type) &&
      String(selectedTable.id) === String(item.id)
    ) {
      return true;
    }

    if (item.type === "chair") {
      return selectedChairIds.map(String).includes(String(item.id));
    }

    if (item.type === "sofa") {
      return selectedSofaIds.map(String).includes(String(item.id));
    }

    return false;
  };

  const renderItemContent = (item) => {
    const info = getReservedInfoForItem(item);

    if (info && isTableType(item.type)) {
      return (
        <span className="booking-number-on-table">
          {info.bookingNumber}
        </span>
      );
    }

    if (info && (item.type === "chair" || item.type === "sofa")) {
      return "";
    }

    if (isSelectedItem(item)) {
      if (isTableType(item.type)) return item.seats || "";
      if (item.type === "chair") return "";
      if (item.type === "sofa") return "";
    }

    switch (item.type) {
      case "round-table":
      case "rect-table":
      case "square-table":
        return item.seats || "";

      case "chair":
        return "";

      case "sofa":
        return "";

      case "plant":
        return "Plant";

      case "window":
        return "Window";

      case "door":
        return "Door";

      case "bar":
        return "Bar";

      case "pool":
        return "Pool";

      default:
        return "";
    }
  };

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={venue.image || "/images/beirut/kami.jpeg"}
            alt={venue.name}
            onError={(e) => {
              e.currentTarget.src = "/images/beirut/kami.jpeg";
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

          <p className="book-type">Cafe • {venue.description}</p>

          {bookingMode !== "create" && bookingToShow && (
            <p className="book-type">
              Booking Number:{" "}
              <strong>
                {bookingToShow.booking_number || bookingToShow.id}
              </strong>
            </p>
          )}

          <div className="book-info-row cafe-location-row">
            <MapPin size={22} className="cafe-location-icon" />

            <button
              type="button"
              className="cafe-location-btn"
              onClick={openLocationMap}
            >
              {venue.address || `${venue.city || ""} - ${venue.area || ""}`}
            </button>
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
              href={`https://instagram.com/${(venue.instagram || "").replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noreferrer"
              className="contact-btn"
            >
              <Camera size={20} />
              <span>Instagram</span>
            </a>

            {venue.google_maps_link && (
              <a
                href={venue.google_maps_link}
                target="_blank"
                rel="noreferrer"
                className="contact-btn"
              >
                <MapPin size={20} />
                <span>View on Map</span>
              </a>
            )}
          </div>
        </div>

        <div className="reservation-details-card section-top-card">
          <label className="reserve-label">
            <MapPin size={18} />
            <span>Select Section</span>
          </label>

          <select
            value={sectionId}
            onChange={handleSectionChange}
            className="book-input"
            disabled={bookingMode === "view"}
          >
            <option value="">Select Section</option>

            {sections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.section_name}
              </option>
            ))}
          </select>

          <label className="reserve-label">
            <Users size={18} />
            <span>Select Area</span>
          </label>

          <select
            value={areaId}
            onChange={handleAreaChange}
            className="book-input"
            disabled={bookingMode === "view" || !sectionId || areas.length === 0}
          >
            <option value="">
              {areas.length === 0 ? "No available areas" : "Select Area"}
            </option>

            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.area_name}
              </option>
            ))}
          </select>
        </div>

        <div className="cafe-booking-split">
          <div className="cafe-map-side">
            <div className="table-map-card">
              <h2>
                {bookingMode === "view"
                  ? "Your Reserved Cafe Table"
                  : bookingMode === "edit"
                  ? "Edit Cafe Reservation"
                  : "Choose Cafe Table and Chairs"}
              </h2>

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
                  Selected / My Booking
                </span>
              </p>

              <div className="admin-floor-map">
                {cafeMapItems.length === 0 ? (
                  <p className="no-map-message">
                    No cafe map available for this section and area.
                  </p>
                ) : (
                  cafeMapItems.map((item) => (
                    <div
                      key={String(item.id)}
                      className={`admin-map-item ${item.type} ${
                        isReservedItem(item) ? "reserved-map-item" : ""
                      } ${
                        !isReservedItem(item) && isSelectedItem(item)
                          ? "selected-book-item"
                          : ""
                      } ${item.isReservable === 1 ? "clickable-item" : ""}`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                        transform: `rotate(${item.rotation || 0}deg)`,
                      }}
                      onClick={() => handleMapItemClick(item)}
                      title={getItemHoverTitle(item)}
                    >
                      {renderItemContent(item)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="cafe-details-side">
            <div className="reservation-details-card">
              <h2>Reservation Details</h2>

              <label className="reserve-label">
                <CalendarDays size={18} />
                <span>Select Date</span>
              </label>

              <input
                type="date"
                value={bookingDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="book-input"
                disabled={bookingMode === "view"}
              />

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
                disabled={bookingMode === "view"}
              />

              <label className="reserve-label">
                <Clock3 size={18} />
                <span>Duration</span>
              </label>

              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="book-input"
                disabled={bookingMode === "view"}
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
                      Selected Chairs: <strong>{selectedChairIds.length}</strong>
                    </p>

                    <p>
                      Selected Sofas: <strong>{selectedSofaIds.length}</strong>
                    </p>

                    <p>
                      Total Selected Seats:{" "}
                      <strong>{selectedSeatsCount}</strong>
                    </p>

                    <p>
                      Section: <strong>{sectionName}</strong>
                    </p>

                    <p>
                      Area: <strong>{areaName}</strong>
                    </p>

                    <p>
                      Booking Date: <strong>{bookingDate}</strong>
                    </p>

                    <p>
                      Booking Time: <strong>{preferredTime}</strong>
                    </p>

                    <p>
                      Duration: <strong>{duration}</strong>
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
                disabled={bookingMode === "view"}
              >
                {bookingMode === "edit"
                  ? "Save Changes"
                  : bookingMode === "view"
                  ? "Viewing Reservation"
                  : `Reserve & Pay $${deposit > 0 ? deposit : 0}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
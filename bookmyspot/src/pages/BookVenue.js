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

const MAP_API = "http://localhost:5000/api/venue-map";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export default function BookVenue() {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingMode = location.state?.mode || "create";
  const bookingToShow = location.state?.booking || null;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userEmail = user?.email || bookingToShow?.email || "";

  const venue = useMemo(
    () =>
      location.state?.venue || {
        id: bookingToShow?.venue_id || null,
        name: bookingToShow?.venue_name || "Venue Name",
        city: "Beirut",
        area: "Downtown",
        description: "Venue Description",
        image: "/images/beirut/kami.jpeg",
        address: "Downtown, Beirut",
        phone: "+961 70 000 000",
        instagram: "@venue",
        whatsapp: "+96170000000",
        hours: "8:30 PM - 1:00 AM",
        category: "Restaurant",
        rating: 4.5,
        has_smoking: true,
        google_maps_link: "",
      },
    [location.state, bookingToShow]
  );

  const [todayValue, setTodayValue] = useState(getTodayString());

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
          id: bookingToShow.table_id,
          type: "round-table",
        }
      : null
  );

  const [selectedChairIds, setSelectedChairIds] = useState(
    Array.isArray(bookingToShow?.selected_chairs)
      ? bookingToShow.selected_chairs
      : []
  );

  const [selectedSofaIds, setSelectedSofaIds] = useState(
    Array.isArray(bookingToShow?.selected_sofas)
      ? bookingToShow.selected_sofas
      : []
  );

  const [editingBookingId, setEditingBookingId] = useState(
    bookingToShow?.id || null
  );

  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [reservedChairIds, setReservedChairIds] = useState([]);
  const [reservedSofaIds, setReservedSofaIds] = useState([]);
  const [reservedInfoByTableId, setReservedInfoByTableId] = useState({});

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

  const minDate = todayValue;

  const maxDateObj = new Date(todayValue);
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  useEffect(() => {
    if (!venue?.id) return;

    async function fetchSections() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/venue-options/${venue.id}/sections`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load sections");
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
        console.error("FETCH SECTIONS ERROR:", error);
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
          `http://localhost:5000/api/venue-options/${venue.id}/areas/${sectionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load areas");
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
        console.error("FETCH AREAS ERROR:", error);
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
          `${MAP_API}?venue_id=${venue.id}&section_id=${sectionId}&area_id=${areaId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load map");
          setMapLayout([]);
          return;
        }

        setMapLayout(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("FETCH MAP ERROR:", error);
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
          console.error(data.message || "Failed to fetch reserved items");
          return;
        }

        const tableIds = [];
        const chairIds = [];
        const sofaIds = [];
        const infoMap = {};

        (Array.isArray(data) ? data : []).forEach((booking) => {
          if (
            bookingMode === "edit" &&
            Number(booking.id) === Number(editingBookingId)
          ) {
            return;
          }

          const tableId = Number(booking.table_id);

          if (!Number.isNaN(tableId)) {
            tableIds.push(tableId);

            infoMap[tableId] = {
              from: booking.reserved_from,
              until: booking.reserved_until,
              duration: booking.duration,
              bookingNumber: booking.booking_number,
            };
          }

          (booking.selected_chairs || []).forEach((id) =>
            chairIds.push(Number(id))
          );

          (booking.selected_sofas || []).forEach((id) =>
            sofaIds.push(Number(id))
          );
        });

        setReservedTableIds(tableIds);
        setReservedChairIds(chairIds);
        setReservedSofaIds(sofaIds);
        setReservedInfoByTableId(infoMap);
      } catch (error) {
        console.error("FETCH RESERVED ITEMS ERROR:", error);
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
        id: Number(bookingToShow.table_id),
        type: "round-table",
      });
    }

    setSelectedChairIds(
      Array.isArray(bookingToShow.selected_chairs)
        ? bookingToShow.selected_chairs.map(Number)
        : []
    );

    setSelectedSofaIds(
      Array.isArray(bookingToShow.selected_sofas)
        ? bookingToShow.selected_sofas.map(Number)
        : []
    );
  }, [bookingToShow]);

  const mapItems = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => {
      const type = item.item_type || item.type || "round-table";
      const generatedId = item.id ?? index + 1;

      const reservableTypes = [
        "round-table",
        "rect-table",
        "square-table",
        "chair",
        "sofa",
      ];

      const isReservable = reservableTypes.includes(type) ? 1 : 0;

      let isReserved = false;

      if (["round-table", "rect-table", "square-table"].includes(type)) {
        isReserved = reservedTableIds.includes(Number(generatedId));
      } else if (type === "chair") {
        isReserved = reservedChairIds.includes(Number(generatedId));
      } else if (type === "sofa") {
        isReserved = reservedSofaIds.includes(Number(generatedId));
      }

      return {
        id: Number(generatedId),
        type,
        label: item.label || "",
        x: typeof item.x === "number" ? item.x : Number(item.x) || 100,
        y: typeof item.y === "number" ? item.y : Number(item.y) || 100,
        width:
          typeof item.width === "number" ? item.width : Number(item.width) || 90,
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
            ? Number(item.parent_table_id)
            : item.parentTableId !== null && item.parentTableId !== undefined
            ? Number(item.parentTableId)
            : null,
        isReservable,
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

  const handleTableClick = (item) => {
    if (bookingMode === "view") return;

    if (item.status === "reserved") {
      const info = reservedInfoByTableId[item.id];

      if (info) {
        alert(
          `This table is already reserved.\nBooking Number: ${info.bookingNumber}\nFrom: ${info.from}\nTo: ${info.until}`
        );
      } else {
        alert("This table is already reserved.");
      }

      return;
    }

    setSelectedTable(item);
    setSelectedChairIds([]);
    setSelectedSofaIds([]);
  };

  const handleChairClick = (item) => {
    if (bookingMode === "view") return;

    if (item.status === "reserved") {
      alert("This chair is already reserved.");
      return;
    }

    if (!selectedTable) {
      alert("Please select a table first.");
      return;
    }

    if (Number(item.parentTableId) !== Number(selectedTable.id)) {
      alert("You can only select chairs from the selected table.");
      return;
    }

    setSelectedChairIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  const handleSofaClick = (item) => {
    if (bookingMode === "view") return;

    if (item.status === "reserved") {
      alert("This sofa is already reserved.");
      return;
    }

    if (!selectedTable) {
      alert("Please select a table first.");
      return;
    }

    if (
      item.parentTableId !== null &&
      item.parentTableId !== undefined &&
      Number(item.parentTableId) !== Number(selectedTable.id)
    ) {
      alert("You can only select sofas from the selected table.");
      return;
    }

    setSelectedSofaIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  const handleItemClick = (item) => {
    if (bookingMode === "view") return;
    if (item.isReservable !== 1) return;

    if (isTableType(item.type)) {
      handleTableClick(item);
      return;
    }

    if (item.type === "chair") {
      handleChairClick(item);
      return;
    }

    if (item.type === "sofa") {
      handleSofaClick(item);
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
      alert("Please select at least one chair or sofa from the selected table.");
      return;
    }

    if (!bookingDate) {
      alert("Please select a date.");
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

    if (bookingDate < minDate || bookingDate > maxDate) {
      alert("Please choose a date between today and the next 10 days.");
      return;
    }

    // EDIT MODE:
    // هون منعدّل الحجز الموجود مباشرة، لأنو الحجز already مدفوع/محجوز.
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
              table_id: selectedTable.id,
              selected_chairs: selectedChairIds,
              selected_sofas: selectedSofaIds,
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
        console.error("UPDATE BOOKING ERROR:", error);
        alert("Server error while updating booking");
      }

      return;
    }

    // CREATE MODE:
    // ممنوع نعمل booking هون.
    // منروح على PayDeposit، وهناك المستخدم بيختار Wish / OMT / Credit Card.
    // بعد الضغط على Pay، PayDeposit.js يعمل POST للbackend، وبوقتها بس بينبعت الإيميل.
    navigate("/pay-deposit", {
      state: {
        booking: {
          user_id: user?.id || null,
          userId: user?.id || null,

          venueId: venue.id,
          venue_id: venue.id,
          venueName: venue.name,
          venue_name: venue.name,

          tableId: selectedTable.id,
          table_id: selectedTable.id,
          tableType: selectedTable.type,
          tableCapacity: selectedTable.seats,

          selectedChairIds,
          selected_chairs: selectedChairIds,

          selectedSofaIds,
          selected_sofas: selectedSofaIds,

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

          category: "Restaurant",
          item_type: "table_group",

          address: venue.address || `${venue.city} - ${venue.area}`,
          email: userEmail,
        },
      },
    });
  };

  const renderItemContent = (item) => {
    if (
      bookingToShow &&
      isTableType(item.type) &&
      Number(item.id) === Number(bookingToShow.table_id)
    ) {
      return (
        <span className="booking-number-on-table">
          {bookingToShow.booking_number || "My Booking"}
        </span>
      );
    }

    if (isTableType(item.type) && reservedInfoByTableId[item.id]) {
      return (
        <span className="booking-number-on-table">
          {reservedInfoByTableId[item.id].bookingNumber}
        </span>
      );
    }

    switch (item.type) {
      case "round-table":
      case "rect-table":
      case "square-table":
        return item.seats || "";

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

      default:
        return null;
    }
  };

  const isSelectedItem = (item) => {
    if (
      bookingToShow &&
      isTableType(item.type) &&
      Number(item.id) === Number(bookingToShow.table_id)
    ) {
      return true;
    }

    if (
      selectedTable &&
      isTableType(item.type) &&
      Number(item.id) === Number(selectedTable.id)
    ) {
      return true;
    }

    if (item.type === "chair" && selectedChairIds.includes(item.id)) {
      return true;
    }

    if (item.type === "sofa" && selectedSofaIds.includes(item.id)) {
      return true;
    }

    return false;
  };

  const getItemTitle = (item) => {
    if (
      bookingToShow &&
      isTableType(item.type) &&
      Number(item.id) === Number(bookingToShow.table_id)
    ) {
      return `My Booking: ${bookingToShow.booking_number}`;
    }

    if (isTableType(item.type) && reservedInfoByTableId[item.id]) {
      const info = reservedInfoByTableId[item.id];

      return `Booking: ${info.bookingNumber} | Reserved from ${info.from} until ${info.until} (${info.duration})`;
    }

    return item.label || item.type;
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

          <p className="book-type">
            {venue.category} • {venue.description}
          </p>

          {bookingMode !== "create" && bookingToShow && (
            <p className="book-type">
              Booking Number: <strong>{bookingToShow.booking_number}</strong>
            </p>
          )}

          <div className="book-info-row">
            <MapPin size={18} />

            {venue.google_maps_link ? (
              <a
                href={venue.google_maps_link}
                target="_blank"
                rel="noreferrer"
                className="location-link"
              >
                {venue.city} - {venue.area}
              </a>
            ) : (
              <span>{venue.city} - {venue.area}</span>
            )}
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
              href={`https://wa.me/${(venue.whatsapp || "").replace(
                /\+/g,
                ""
              )}`}
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

        <div className="booking-main-split">
          <div className="booking-map-side">
            <div className="table-map-card">
              <h2>
                {bookingMode === "view"
                  ? "Your Reserved Place"
                  : bookingMode === "edit"
                  ? "Edit Your Reservation"
                  : "Choose Table and Chairs"}
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
                {mapItems.length === 0 ? (
                  <p className="no-map-message">
                    No map available for this section and area yet.
                  </p>
                ) : (
                  mapItems.map((item) => (
                    <div
                      key={item.id}
                      className={`admin-map-item ${item.type} ${
                        item.status === "reserved" ? "reserved-item" : ""
                      } ${isSelectedItem(item) ? "selected-book-item" : ""} ${
                        item.isReservable === 1 ? "clickable-item" : ""
                      }`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                        transform: `rotate(${item.rotation || 0}deg)`,
                      }}
                      onClick={() => handleItemClick(item)}
                      title={getItemTitle(item)}
                    >
                      {renderItemContent(item)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="booking-details-side">
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
                      Selected Table: <strong>#{selectedTable.id}</strong>
                    </p>

                    <p>
                      Selected Chairs:{" "}
                      <strong>{selectedChairIds.length}</strong>
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
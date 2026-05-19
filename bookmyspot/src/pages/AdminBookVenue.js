import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Phone,
  Camera,
  MessageCircle,
  MapPin,
  Clock3,
  Users,
  PencilRuler,
  Search,
  Trash2,
  Save,
  CalendarDays,
} from "lucide-react";
import "./BookVenue.css";

const MAP_API = `${process.env.REACT_APP_API_URL}/api/venue-map`;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function durationToMinutes(duration) {
  const value = String(duration || "").toLowerCase();

  if (value.includes("4")) return 240;
  if (value.includes("3")) return 180;
  if (value.includes("2")) return 120;

  return 60;
}

function addDurationToTime(startTime, duration) {
  if (!startTime) return "";

  const [h, m] = String(startTime).split(":").map(Number);

  const date = new Date();
  date.setHours(h || 0);
  date.setMinutes(m || 0);
  date.setSeconds(0);

  date.setMinutes(date.getMinutes() + durationToMinutes(duration));

  return date.toTimeString().slice(0, 5);
}

export default function AdminBookVenue() {
  const navigate = useNavigate();
  const location = useLocation();

  const venueFromState = location.state?.venue || null;

  const [venue, setVenue] = useState(venueFromState);
  const [selectedItem, setSelectedItem] = useState(null);

  const [guests, setGuests] = useState(2);
  const [previewDate, setPreviewDate] = useState(getTodayString());
  const [preferredTime, setPreferredTime] = useState("19:00");
  const [duration, setDuration] = useState("1 hour");

  const [sections, setSections] = useState([]);
  const [areas, setAreas] = useState([]);

  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [areaId, setAreaId] = useState("");
  const [areaName, setAreaName] = useState("");

  const [mapLayout, setMapLayout] = useState([]);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  const [reservedInfoByTableId, setReservedInfoByTableId] = useState({});

  const [bookingSearch, setBookingSearch] = useState("");
  const [foundBooking, setFoundBooking] = useState(null);
  const [searchedTableId, setSearchedTableId] = useState(null);

  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editStatus, setEditStatus] = useState("reserved");
  const [editPaymentStatus, setEditPaymentStatus] = useState("paid");

  useEffect(() => {
    if (!venueFromState?.id) return;

    const fetchVenueDetails = async () => {
      try {
        setLoadingVenue(true);

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/restaurants/${venueFromState.id}`
        );

        setVenue(response.data);
      } catch (error) {
        console.error("Failed to fetch venue details:", error);
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchVenueDetails();
  }, [venueFromState]);

  useEffect(() => {
    if (!venue?.id) return;

    const fetchSections = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/venue-options/${venue.id}/sections`
        );

        const data = Array.isArray(response.data) ? response.data : [];
        setSections(data);

        if (data.length > 0) {
          setSectionId(String(data[0].id));
          setSectionName(data[0].section_name || "");
        } else {
          setSectionId("");
          setSectionName("");
        }
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        setSections([]);
        setSectionId("");
        setSectionName("");
      }
    };

    fetchSections();
  }, [venue?.id]);

  useEffect(() => {
    if (!venue?.id || !sectionId) {
      setAreas([]);
      setAreaId("");
      setAreaName("");
      return;
    }

    const fetchAreas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/venue-options/${venue.id}/admin-areas/${sectionId}`
        );

        const data = Array.isArray(response.data) ? response.data : [];
        setAreas(data);

        if (data.length > 0) {
          setAreaId(String(data[0].id));
          setAreaName(data[0].area_name || "");
        } else {
          setAreaId("");
          setAreaName("");
        }
      } catch (error) {
        console.error("Failed to fetch areas:", error);
        setAreas([]);
        setAreaId("");
        setAreaName("");
      }
    };

    fetchAreas();
  }, [venue?.id, sectionId]);

  useEffect(() => {
    setSelectedItem(null);
  }, [sectionId, areaId]);

  useEffect(() => {
    if (!venue?.id || !sectionId || !areaId) {
      setMapLayout([]);
      return;
    }

    const fetchMapLayout = async () => {
      try {
        setLoadingMap(true);

        const response = await axios.get(MAP_API, {
          params: {
            venue_id: venue.id,
            section_id: sectionId,
            area_id: areaId,
          },
        });

        const mapData = Array.isArray(response.data) ? response.data : [];
        setMapLayout(mapData);
      } catch (error) {
        console.error("Failed to fetch map layout:", error);
        setMapLayout([]);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchMapLayout();
  }, [venue?.id, sectionId, areaId]);

  const fetchReservedBookings = async () => {
    if (!venue?.id || !previewDate || !preferredTime) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/bookings/venue/${venue.id}`,
        {
          params: {
            booking_date: previewDate,
            booking_time: preferredTime,
            duration,
          },
        }
      );

      const data = Array.isArray(response.data) ? response.data : [];
      const infoMap = {};

      data.forEach((booking) => {
        const tableId = Number(booking.table_id);

        if (!Number.isNaN(tableId)) {
          infoMap[tableId] = {
            bookingId: booking.id,
            bookingNumber: booking.booking_number,
            from: booking.reserved_from,
            until: booking.reserved_until,
            duration: booking.duration,
            bookingDate: booking.booking_date,
          };
        }
      });

      setReservedInfoByTableId(infoMap);
    } catch (error) {
      console.error("Failed to fetch reserved bookings:", error);
      setReservedInfoByTableId({});
    }
  };

  useEffect(() => {
    if (venue?.id) {
      fetchReservedBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue?.id, previewDate, preferredTime, duration]);

  const items = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => {
      const id = item.id ?? index + 1;
      const type = item.item_type || item.type || "round-table";

      const isReservable =
        typeof item.is_reservable === "number"
          ? item.is_reservable
          : ["round-table", "rect-table", "square-table", "chair", "sofa"].includes(
              type
            )
          ? 1
          : 0;

      const isTable = ["round-table", "rect-table", "square-table"].includes(
        type
      );

      return {
        id,
        type,
        label: item.label || "",
        x: typeof item.x === "number" ? item.x : 100,
        y: typeof item.y === "number" ? item.y : 100,
        width: typeof item.width === "number" ? item.width : 90,
        height: typeof item.height === "number" ? item.height : 90,
        rotation: typeof item.rotation === "number" ? item.rotation : 0,
        seats:
          typeof item.seats_count === "number"
            ? item.seats_count
            : typeof item.seats === "number"
            ? item.seats
            : 0,
        isReservable,
        isTable,
        status:
          isTable && reservedInfoByTableId[id] ? "reserved" : "available",
      };
    });
  }, [mapLayout, reservedInfoByTableId]);

  const handleItemClick = (item) => {
    if (item.isReservable !== 1) return;
    setSelectedItem(item);
  };

  const handleSectionChange = (e) => {
    const selectedId = e.target.value;
    const foundSection = sections.find(
      (item) => String(item.id) === String(selectedId)
    );

    setSectionId(selectedId);
    setSectionName(foundSection?.section_name || "");
  };

  const handleAreaChange = (e) => {
    const selectedId = e.target.value;
    const foundArea = areas.find(
      (item) => String(item.id) === String(selectedId)
    );

    setAreaId(selectedId);
    setAreaName(foundArea?.area_name || "");
  };

  const handleCreateMap = () => {
    if (!venue?.id) {
      alert("Venue not found.");
      return;
    }

    if (!sectionId) {
      alert("Please select a section first.");
      return;
    }

    if (!areaId) {
      alert("Please select an area first.");
      return;
    }

    navigate("/create-restaurant-map", {
      state: {
        venue,
        sectionId,
        sectionName,
        areaId,
        areaName,
      },
    });
  };

  const searchBooking = async () => {
    if (!bookingSearch.trim()) {
      alert("Enter booking number.");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/bookings/search/${bookingSearch.trim()}`
      );

      const booking = response.data;
      const tableId = Number(booking.table_id);

      setFoundBooking(booking);
      setSearchedTableId(Number.isNaN(tableId) ? null : tableId);

      setEditDate(booking.booking_date?.split("T")[0] || booking.booking_date || "");
      setEditTime(booking.booking_time || "");
      setEditDuration(booking.duration || "1 hour");
      setEditSection(booking.section || "");
      setEditArea(booking.area || "");
      setEditStatus(booking.status || "reserved");
      setEditPaymentStatus(booking.payment_status || "paid");

      if (booking.booking_date) {
        setPreviewDate(
          booking.booking_date?.split("T")[0] || booking.booking_date
        );
      }

      if (booking.booking_time) {
        setPreferredTime(booking.booking_time);
      }

      if (booking.duration) {
        setDuration(booking.duration);
      }

      if (!Number.isNaN(tableId)) {
        const foundItemOnCurrentMap = items.find(
          (item) => Number(item.id) === tableId
        );

        if (foundItemOnCurrentMap) {
          setSelectedItem(foundItemOnCurrentMap);
        } else {
          setSelectedItem(null);
          alert(
            `Booking found, but table #${tableId} is not on the current selected section/area map.\nBooking section: ${booking.section}\nBooking area: ${booking.area}`
          );
        }
      }
    } catch (error) {
      console.error("Search booking error:", error);
      alert("Booking not found.");
      setFoundBooking(null);
      setSearchedTableId(null);
    }
  };

  const updateBooking = async () => {
    if (!foundBooking?.id) return;

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bookings/${foundBooking.id}`, {
        booking_date: editDate,
        booking_time: editTime,
        duration: editDuration,
        section: editSection,
        area: editArea,
      });

      setFoundBooking((prev) => ({
        ...prev,
        booking_date: editDate,
        booking_time: editTime,
        duration: editDuration,
        section: editSection,
        area: editArea,
      }));

      setPreviewDate(editDate);
      setPreferredTime(editTime);
      setDuration(editDuration);

      const newInfoMap = { ...reservedInfoByTableId };
      const tableId = Number(foundBooking.table_id);

      if (!Number.isNaN(tableId)) {
        const end = addDurationToTime(editTime, editDuration);

        newInfoMap[tableId] = {
          bookingId: foundBooking.id,
          bookingNumber: foundBooking.booking_number,
          from: editTime,
          until: end,
          duration: editDuration,
          bookingDate: editDate,
        };

        setReservedInfoByTableId(newInfoMap);
        setSearchedTableId(tableId);

        const foundItemOnCurrentMap = items.find(
          (item) => Number(item.id) === tableId
        );

        if (foundItemOnCurrentMap) {
          setSelectedItem(foundItemOnCurrentMap);
        }
      }

      alert("Booking updated successfully");
    } catch (error) {
      console.error("Update booking error:", error);
      alert("Failed to update booking");
    }
  };

  const deleteBooking = async () => {
    if (!foundBooking?.id) return;

    const confirmDelete = window.confirm(
      `Delete booking ${foundBooking.booking_number}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/bookings/${foundBooking.id}`);

      alert("Booking deleted successfully.");
      setFoundBooking(null);
      setBookingSearch("");
      setSearchedTableId(null);
      fetchReservedBookings();
    } catch (error) {
      console.error("Delete booking error:", error);
      alert("Failed to delete booking.");
    }
  };

  const renderMapItemContent = (item) => {
    if (item.isTable && reservedInfoByTableId[item.id]) {
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
        return "Window";
      case "door":
        return "Door";
      case "bar":
        return "Bar";
      case "pool":
        return "Pool";
      case "sofa":
        return "Sofa";
      case "plant":
        return "Plant";
      default:
        return null;
    }
  };

  const getItemTitle = (item) => {
    if (item.isTable && reservedInfoByTableId[item.id]) {
      const info = reservedInfoByTableId[item.id];

      return `Booking: ${info.bookingNumber} | Date: ${
        info.bookingDate || previewDate
      } | Reserved from ${info.from} until ${info.until} (${info.duration})`;
    }

    return item.label || item.type;
  };

  if (!venue && loadingVenue) {
    return <div className="book-page">Loading venue...</div>;
  }

  if (!venue) {
    return <div className="book-page">Venue not found.</div>;
  }

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={venue.image || "/images/beirut/default-restaurant.jpg"}
            alt={venue.name}
            onError={(e) => {
              e.target.src = "/images/beirut/default-restaurant.jpg";
            }}
          />

          <button
            type="button"
            className="book-back-btn"
            onClick={() => navigate("/admin-restaurants")}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="book-info-card">
          <h1>{venue.name}</h1>

          <p className="book-type">
            {venue.category || "Restaurant"} •{" "}
            {venue.cuisine || venue.description || "Venue"}
          </p>

          <div className="book-info-row">
            <MapPin size={18} />
            <span>
              {venue.address || `${venue.area || ""}, ${venue.city || ""}`}
            </span>
          </div>

          <div className="book-info-row">
            <Clock3 size={18} />
            <span>{venue.hours || "8:30 PM - 1:00 AM"}</span>
          </div>

          <div className="contact-actions">
            <a href={`tel:${venue.phone || ""}`} className="contact-btn">
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
            disabled={!sectionId}
          >
            <option value="">Select Area</option>

            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.area_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="create-seats-btn"
            onClick={handleCreateMap}
          >
            <PencilRuler size={18} />
            <span>Create Map</span>
          </button>
        </div>

        <div className="reservation-details-card">
          <h2>Search Booking</h2>

          <label className="reserve-label">
            <Search size={18} />
            <span>Booking Number</span>
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Example: BK-10001"
              className="book-input"
            />

            <button
              type="button"
              className="create-seats-btn"
              onClick={searchBooking}
            >
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>

          {foundBooking && (
            <div className="selected-info">
              <p>
                Booking Number:{" "}
                <strong>{foundBooking.booking_number}</strong>
              </p>

              <p>
                Venue: <strong>{foundBooking.venue_name}</strong>
              </p>

              <p>
                Table: <strong>{foundBooking.table_id}</strong>
              </p>

              <p>
                Current Section: <strong>{foundBooking.section}</strong>
              </p>

              <p>
                Current Area: <strong>{foundBooking.area}</strong>
              </p>

              <label>Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="book-input"
              />

              <label>Time</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="book-input"
              />

              <label>Duration</label>
              <select
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="book-input"
              >
                <option>1 hour</option>
                <option>2 hours</option>
                <option>3 hours</option>
                <option>4 hours</option>
              </select>

              <label>Section</label>
              <input
                type="text"
                value={editSection}
                onChange={(e) => setEditSection(e.target.value)}
                className="book-input"
              />

              <label>Area</label>
              <input
                type="text"
                value={editArea}
                onChange={(e) => setEditArea(e.target.value)}
                className="book-input"
              />

              <label>Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="book-input"
              >
                <option value="reserved">reserved</option>
                <option value="pending_payment">pending_payment</option>
                <option value="cancelled">cancelled</option>
              </select>

              <label>Payment Status</label>
              <select
                value={editPaymentStatus}
                onChange={(e) => setEditPaymentStatus(e.target.value)}
                className="book-input"
              >
                <option value="paid">paid</option>
                <option value="pending">pending</option>
              </select>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="create-seats-btn"
                  onClick={updateBooking}
                >
                  <Save size={18} />
                  <span>Save Edit</span>
                </button>

                <button
                  type="button"
                  className="create-seats-btn"
                  onClick={deleteBooking}
                  style={{ background: "#c0392b" }}
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="table-map-card">
          <h2>Current Restaurant Map</h2>

          <p className="table-legend">
            <span className="legend-item">
              Current Section: <strong>{sectionName || "Not selected"}</strong>
            </span>

            <span className="legend-item">
              Current Area: <strong>{areaName || "Not selected"}</strong>
            </span>

            <span className="legend-item">
              Preview Date: <strong>{previewDate}</strong>
            </span>

            <span className="legend-item">
              Preview Time: <strong>{preferredTime}</strong>
            </span>
          </p>

          <div className="admin-floor-map">
            {loadingMap ? (
              <p className="no-map-message">Loading map...</p>
            ) : items.length === 0 ? (
              <p className="no-map-message">
                No map available for this section and area yet.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`admin-map-item ${item.type} ${
                    item.status === "reserved" ? "reserved-item" : ""
                  } ${
                    selectedItem?.id === item.id ? "selected-admin-item" : ""
                  } ${
                    Number(searchedTableId) === Number(item.id)
                      ? "booking-search-highlight"
                      : ""
                  } ${item.isReservable === 1 ? "clickable-item" : ""}`}
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
                  {renderMapItemContent(item)}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="reservation-details-card">
          <h2>Preview Reservation</h2>

          <label className="reserve-label">
            <CalendarDays size={18} />
            <span>Preview Date</span>
          </label>

          <input
            type="date"
            value={previewDate}
            onChange={(e) => setPreviewDate(e.target.value)}
            className="book-input"
          />

          <label className="reserve-label">
            <Users size={18} />
            <span>Number of Guests</span>
          </label>

          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
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
            {selectedItem ? (
              <>
                <p>
                  Selected Item: <strong>{selectedItem.type}</strong>
                </p>

                <p>
                  Item ID: <strong>{selectedItem.id}</strong>
                </p>

                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>

                <p>
                  Area: <strong>{areaName || "Not selected"}</strong>
                </p>

                <p>
                  Preview Date: <strong>{previewDate}</strong>
                </p>

                <p>
                  Preferred Time: <strong>{preferredTime}</strong>
                </p>

                <p>
                  Duration: <strong>{duration}</strong>
                </p>
              </>
            ) : (
              <>
                <p>No reservable table/chair selected yet.</p>

                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
                </p>

                <p>
                  Area: <strong>{areaName || "Not selected"}</strong>
                </p>

                <p>
                  Preview Date: <strong>{previewDate}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

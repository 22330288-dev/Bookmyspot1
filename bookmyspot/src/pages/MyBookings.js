import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  Eye,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";
import "./Profile.css";

function parseArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.bookings)) return data.bookings;

    return [];
  } catch (err) {
    console.error("Fetch bookings error:", url, err);
    return [];
  }
}

function normalizeRestaurantBooking(booking) {
  const text = String(
    booking.category || booking.item_type || booking.venue_name || ""
  ).toLowerCase();

  const isCafe =
    text.includes("cafe") ||
    text.includes("coffee") ||
    text.includes("café");

  return {
    ...booking,
    source: "main",
    type: isCafe ? "Cafe" : "Restaurant",
    booking_number: booking.booking_number || `BK-${booking.id}`,
    venue_id: booking.venue_id,
    venue_name: booking.venue_name,
    table_or_items: booking.table_id,
    seats_or_guests: booking.booked_seats || 0,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    duration: booking.duration,
    section: booking.section || "N/A",
    area: booking.area || "N/A",
    selected_chairs: parseArray(booking.selected_chairs),
    selected_sofas: parseArray(booking.selected_sofas),
    address: booking.address || "",
    original: {
      ...booking,
      selected_chairs: parseArray(booking.selected_chairs),
      selected_sofas: parseArray(booking.selected_sofas),
      category: isCafe ? "Cafe" : "Restaurant",
    },
  };
}

function normalizeCafeBooking(booking) {
  return {
    ...booking,
    source: "cafe",
    type: "Cafe",
    booking_number: booking.booking_number || `CAFE-${booking.id}`,
    venue_id: booking.cafe_id || booking.venue_id,
    venue_name: booking.cafe_name || booking.venue_name,
    table_or_items: booking.table_id,
    seats_or_guests: booking.booked_seats || 0,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    duration: booking.duration,
    section: booking.section || "N/A",
    area: booking.area || "Cafe",
    selected_chairs: parseArray(booking.selected_chairs),
    selected_sofas: parseArray(booking.selected_sofas),
    address: booking.address || "",
    original: {
      ...booking,
      id: booking.id,
      venue_id: booking.cafe_id || booking.venue_id,
      venue_name: booking.cafe_name || booking.venue_name,
      cafe_id: booking.cafe_id || booking.venue_id,
      cafe_name: booking.cafe_name || booking.venue_name,
      table_id: booking.table_id,
      selected_chairs: parseArray(booking.selected_chairs),
      selected_sofas: parseArray(booking.selected_sofas),
      category: "Cafe",
    },
  };
}

function normalizeWeddingBooking(booking) {
  const selectedItems = parseArray(
    booking.selected_items || booking.selected_items_json
  );

  const customLayout =
    Array.isArray(booking.custom_layout) && booking.custom_layout.length > 0
      ? booking.custom_layout
      : parseArray(booking.custom_layout_json);

  return {
    ...booking,
    source: "wedding",
    type: "Wedding Hall",
    booking_number: booking.booking_number || `WED-${booking.id}`,
    venue_id: booking.wedding_hall_id || booking.venue_id,
    venue_name: booking.hall_name || booking.venue_name,
    table_or_items:
      selectedItems.length > 0
        ? `${selectedItems.length} selected item(s)`
        : "Wedding Map",
    seats_or_guests: booking.expected_guests || selectedItems.length || 0,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    duration: booking.duration,
    section: booking.section || "N/A",
    area: "Wedding Hall",
    selected_items: selectedItems,
    custom_layout: customLayout,
    address: booking.address || "",
    original: {
      ...booking,
      id: booking.id,
      wedding_hall_id: booking.wedding_hall_id || booking.venue_id,
      hall_name: booking.hall_name || booking.venue_name,
      venue_id: booking.wedding_hall_id || booking.venue_id,
      venue_name: booking.hall_name || booking.venue_name,
      selected_items: selectedItems,
      custom_layout_json: customLayout,
      custom_layout: customLayout,
      category: "Wedding Hall",
    },
  };
}

function normalizeEventBooking(booking) {
  const selectedItems = parseArray(
    booking.selected_items || booking.selected_items_json
  );

  const customLayout =
    Array.isArray(booking.custom_layout) && booking.custom_layout.length > 0
      ? booking.custom_layout
      : parseArray(booking.custom_layout_json);

  return {
    ...booking,
    source: "event",
    type: "Event Venue",
    booking_number: booking.booking_number || `EV-${booking.id}`,
    venue_id: booking.event_venue_id || booking.venue_id,
    venue_name: booking.event_name || booking.venue_name,
    table_or_items:
      selectedItems.length > 0
        ? `${selectedItems.length} selected item(s)`
        : "Event Map",
    seats_or_guests: booking.expected_guests || selectedItems.length || 0,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    duration: booking.duration,
    section: booking.section || "N/A",
    area: "Event Venue",
    selected_items: selectedItems,
    custom_layout: customLayout,
    address: booking.address || "",
    original: {
      ...booking,
      id: booking.id,
      event_venue_id: booking.event_venue_id || booking.venue_id,
      event_name: booking.event_name || booking.venue_name,
      venue_id: booking.event_venue_id || booking.venue_id,
      venue_name: booking.event_name || booking.venue_name,
      selected_items: selectedItems,
      selected_items_json: selectedItems,
      custom_layout_json: customLayout,
      custom_layout: customLayout,
      category: "Event",
      item_type: "event",
    },
  };
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const userId = user.id;

    const [
      restaurantBookings,
      cafeBookings,
      weddingBookings,
      eventBookings,
    ] = await Promise.all([
      fetchJsonSafe(`http://localhost:5000/api/bookings/user/${userId}`),
      fetchJsonSafe(`http://localhost:5000/api/cafe-bookings/user/${userId}`),
      fetchJsonSafe(`http://localhost:5000/api/wedding-bookings/user/${userId}`),
      fetchJsonSafe(`http://localhost:5000/api/event-bookings/user/${userId}`),
    ]);

    const allBookings = [
      ...restaurantBookings.map(normalizeRestaurantBooking),
      ...cafeBookings.map(normalizeCafeBooking),
      ...weddingBookings.map(normalizeWeddingBooking),
      ...eventBookings.map(normalizeEventBooking),
    ];

    allBookings.sort((a, b) => {
      const dateA = new Date(
        `${a.booking_date || ""}T${String(a.booking_time || "").slice(
          0,
          5
        )}:00`
      );

      const dateB = new Date(
        `${b.booking_date || ""}T${String(b.booking_time || "").slice(
          0,
          5
        )}:00`
      );

      if (!Number.isNaN(dateA.getTime()) && !Number.isNaN(dateB.getTime())) {
        return dateB - dateA;
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

    setBookings(allBookings);
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const canEditBooking = (booking) => {
    if (!booking.booking_date || !booking.booking_time) return false;

    const timeValue = String(booking.booking_time).slice(0, 5);
    const bookingStart = new Date(`${booking.booking_date}T${timeValue}:00`);

    if (Number.isNaN(bookingStart.getTime())) return false;

    return new Date() < bookingStart;
  };

  const getBookingMapPath = (booking) => {
    if (booking.type === "Cafe") return "/book-venue-cafe";
    if (booking.type === "Wedding Hall") return "/book-wedding-hall";
    if (booking.type === "Event Venue") return "/book-event-venue";

    return "/book-venue";
  };

  const openMap = (booking) => {
    navigate(getBookingMapPath(booking), {
      state: {
        mode: "view",
        booking: booking.original || booking,
        venue: {
          id: booking.venue_id,
          name: booking.venue_name,
          category: booking.type,
          type:
            booking.type === "Event Venue"
              ? "event"
              : booking.type === "Wedding Hall"
              ? "wedding_hall"
              : booking.type === "Cafe"
              ? "cafe"
              : "restaurant",
          description: booking.type,
          address: booking.address || "",
        },
      },
    });
  };

  const editBooking = (booking) => {
    if (!canEditBooking(booking)) {
      alert(
        "You cannot edit this booking because the reservation time already started."
      );
      return;
    }

    navigate(getBookingMapPath(booking), {
      state: {
        mode: "edit",
        booking: booking.original || booking,
        venue: {
          id: booking.venue_id,
          name: booking.venue_name,
          category: booking.type,
          type:
            booking.type === "Event Venue"
              ? "event"
              : booking.type === "Wedding Hall"
              ? "wedding_hall"
              : booking.type === "Cafe"
              ? "cafe"
              : "restaurant",
          description: booking.type,
          address: booking.address || "",
        },
      },
    });
  };

  const getDeleteUrl = (booking) => {
    if (booking.source === "cafe") {
      return `http://localhost:5000/api/cafe-bookings/${booking.id}`;
    }

    if (booking.source === "wedding") {
      return `http://localhost:5000/api/wedding-bookings/${booking.id}`;
    }

    if (booking.source === "event") {
      return `http://localhost:5000/api/event-bookings/${booking.id}`;
    }

    return `http://localhost:5000/api/bookings/${booking.id}`;
  };

  const deleteBooking = async (booking) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete booking ${
        booking.booking_number || booking.id
      }?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(getDeleteUrl(booking), {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Booking deleted successfully");
      fetchBookings();
    } catch (err) {
      console.error("Delete booking error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-topbar">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={22} />
            <span>Back</span>
          </button>
        </div>

        <div className="profile-header">
          <div className="profile-avatar">
            <CalendarCheck size={32} />
          </div>

          <h1 className="profile-name">My Bookings</h1>

          <p className="profile-email">
            Restaurants, cafes, wedding halls, and events
          </p>
        </div>

        <div className="profile-card">
          {bookings.length === 0 ? (
            <div className="profile-row">
              <div className="profile-texts">
                <span className="profile-row-title">No bookings found</span>
              </div>
            </div>
          ) : (
            bookings.map((booking) => {
              const editable = canEditBooking(booking);

              return (
                <div
                  className="profile-row"
                  key={`${booking.source}-${booking.id}`}
                >
                  <div className="profile-row-left">
                    <div className="profile-texts">
                      <span className="profile-row-title">
                        Booking #{booking.booking_number || booking.id}
                      </span>

                      <p className="profile-row-subtitle">
                        Type: <strong>{booking.type}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Place:{" "}
                        <strong>{booking.venue_name || "Venue Name"}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Table / Items:{" "}
                        <strong>{booking.table_or_items || "N/A"}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Seats / Guests:{" "}
                        <strong>{booking.seats_or_guests || 0}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Date: <strong>{booking.booking_date || "N/A"}</strong>{" "}
                        | Time:{" "}
                        <strong>{booking.booking_time || "N/A"}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Duration: <strong>{booking.duration || "N/A"}</strong>
                      </p>

                      <p className="profile-row-subtitle">
                        Section: <strong>{booking.section || "N/A"}</strong>{" "}
                        | Area: <strong>{booking.area || "N/A"}</strong>
                      </p>

                      {booking.address && (
                        <p className="profile-row-subtitle">
                          <MapPin size={14} /> {booking.address}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openMap(booking)}
                          style={{
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={16} /> View Map
                        </button>

                        {editable ? (
                          <button
                            type="button"
                            onClick={() => editBooking(booking)}
                            style={{
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              cursor: "pointer",
                            }}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#999",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              background: "#f3f3f3",
                            }}
                          >
                            Edit expired
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteBooking(booking)}
                          style={{
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            color: "red",
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
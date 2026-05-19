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
  PencilRuler,
} from "lucide-react";
import "./BookVenue.css";
import "./CreateRestaurantMap.css";

function safeParseArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export default function BookEventVenue() {
  const navigate = useNavigate();
  const location = useLocation();

  const customLayoutFromState = location.state?.customLayout || null;
  const bookingMode = location.state?.mode || "create";
  const bookingToShow = location.state?.booking || null;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userEmail = user?.email || bookingToShow?.email || "";

  const venue = useMemo(
    () =>
      location.state?.venue || {
        id: bookingToShow?.event_venue_id || bookingToShow?.venue_id || null,
        name:
          bookingToShow?.event_name ||
          bookingToShow?.venue_name ||
          "Event Venue",
        city: "Beirut",
        area: "Downtown",
        description: "Event Venue",
        image: "/images/events/default-event.jpg",
        address: "Downtown, Beirut",
        phone: "+961 70 000 000",
        instagram: "@eventvenue",
        whatsapp: "+96170000000",
        hours: "Open all day",
        category: "Event",
        type: "event",
        rating: 4.5,
      },
    [location.state, bookingToShow]
  );

  const minDate = getTodayString();

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [bookingDate, setBookingDate] = useState(
    bookingToShow?.booking_date || minDate
  );

  const [preferredTime, setPreferredTime] = useState(
    bookingToShow?.booking_time || "19:00"
  );

  const [duration, setDuration] = useState(
    bookingToShow?.duration || "4 hours"
  );

  const [sections, setSections] = useState([]);

  const [sectionId, setSectionId] = useState(location.state?.sectionId || "");

  const [sectionName, setSectionName] = useState(
    bookingToShow?.section || location.state?.sectionName || ""
  );

  const [mapLayout, setMapLayout] = useState(
    Array.isArray(customLayoutFromState)
      ? customLayoutFromState
      : bookingToShow?.custom_layout_json
      ? safeParseArray(bookingToShow.custom_layout_json)
      : bookingToShow?.custom_layout
      ? safeParseArray(bookingToShow.custom_layout)
      : []
  );

  const [selectedItemIds, setSelectedItemIds] = useState(
    Array.isArray(bookingToShow?.selected_items)
      ? bookingToShow.selected_items.map(String)
      : safeParseArray(bookingToShow?.selected_items_json).map(String)
  );

  const [reservedItems, setReservedItems] = useState([]);
  const [guestSearch, setGuestSearch] = useState("");

  useEffect(() => {
    if (!venue?.id) return;

    async function fetchSections() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/event-options/${venue.id}/sections`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load event sections");
          return;
        }

        const fetchedSections = Array.isArray(data) ? data : [];
        setSections(fetchedSections);

        if (!sectionId && fetchedSections.length > 0) {
          setSectionId(String(fetchedSections[0].id));
          setSectionName(fetchedSections[0].section_name || "");
        }
      } catch (error) {
        console.error("FETCH EVENT SECTIONS ERROR:", error);
      }
    }

    fetchSections();
  }, [venue?.id, sectionId]);

  useEffect(() => {
    if (bookingMode !== "create") return;

    setSelectedItemIds([]);
  }, [sectionId, bookingMode]);

  useEffect(() => {
    if (
      Array.isArray(customLayoutFromState) &&
      customLayoutFromState.length > 0
    ) {
      setMapLayout(customLayoutFromState);
      return;
    }

    if (bookingToShow?.custom_layout_json) {
      const parsedCustomLayout = safeParseArray(
        bookingToShow.custom_layout_json
      );

      if (parsedCustomLayout.length > 0) {
        setMapLayout(parsedCustomLayout);
        return;
      }
    }

    if (bookingToShow?.custom_layout) {
      const parsedCustomLayout = safeParseArray(bookingToShow.custom_layout);

      if (parsedCustomLayout.length > 0) {
        setMapLayout(parsedCustomLayout);
        return;
      }
    }

    if (!venue?.id || !sectionId) {
      setMapLayout([]);
      return;
    }

    async function fetchMapLayout() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/event-options/${venue.id}/layout/${sectionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load event map");
          return;
        }

        setMapLayout(Array.isArray(data.map) ? data.map : []);
      } catch (error) {
        console.error("FETCH EVENT MAP ERROR:", error);
        setMapLayout([]);
      }
    }

    fetchMapLayout();
  }, [venue?.id, sectionId, customLayoutFromState, bookingToShow]);

  useEffect(() => {
    if (!venue?.id || !bookingDate || !preferredTime || !duration) return;

    async function fetchReservedItems() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/event-bookings/venue/${venue.id}?booking_date=${bookingDate}&booking_time=${preferredTime}&duration=${encodeURIComponent(
            duration
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          const result = Array.isArray(data) ? data : [];

          const filteredResult =
            bookingMode === "edit" && bookingToShow?.id
              ? result.filter(
                  (item) =>
                    Number(item.booking_id || item.id) !==
                    Number(bookingToShow.id)
                )
              : result;

          setReservedItems(filteredResult);
        } else {
          setReservedItems([]);
        }
      } catch (error) {
        console.error("FETCH RESERVED EVENT ITEMS ERROR:", error);
        setReservedItems([]);
      }
    }

    fetchReservedItems();
  }, [
    venue?.id,
    bookingDate,
    preferredTime,
    duration,
    bookingMode,
    bookingToShow,
  ]);

  const reservedMap = useMemo(() => {
    const map = {};

    reservedItems.forEach((item) => {
      map[String(item.item_id)] = {
        from: item.from || item.booking_time || "",
        to: item.to || item.reserved_until || item.end_time || "",
        duration: item.duration || "",
        bookingNumber: item.booking_number || "",
      };
    });

    return map;
  }, [reservedItems]);

  const mapItems = useMemo(() => {
    if (!Array.isArray(mapLayout)) return [];

    return mapLayout.map((item, index) => {
      const type = item.type || item.item_type || "round-table";
      const id = String(item.id || item.item_id || `item-${index}`);

      return {
        ...item,
        id,
        type,
        label: item.label || "",
        x: Number(item.x || 100),
        y: Number(item.y || 100),
        width: Number(item.width || 90),
        height: Number(item.height || 90),
        rotation: Number(item.rotation || 0),
        seats: Number(item.seats || item.seats_count || 0),
        parentTableId:
          item.parentTableId !== null && item.parentTableId !== undefined
            ? String(item.parentTableId)
            : item.parent_table_id !== null &&
              item.parent_table_id !== undefined
            ? String(item.parent_table_id)
            : "",
        isSelectable: [
          "round-table",
          "rect-table",
          "square-table",
          "chair",
          "sofa",
        ].includes(type),
        isReserved: Boolean(reservedMap[id]),
        reservedInfo: reservedMap[id] || null,
        reservedFrom: reservedMap[id]?.from || "",
        reservedTo: reservedMap[id]?.to || "",
      };
    });
  }, [mapLayout, reservedMap]);

  const selectedItems = useMemo(() => {
    return mapItems.filter((item) =>
      selectedItemIds.map(String).includes(String(item.id))
    );
  }, [mapItems, selectedItemIds]);

  const selectedTables = selectedItems.filter((item) =>
    ["round-table", "rect-table", "square-table"].includes(item.type)
  );

  const selectedChairs = selectedItems.filter((item) => item.type === "chair");
  const selectedSofas = selectedItems.filter((item) => item.type === "sofa");

  const expectedGuests =
    selectedChairs.length + selectedSofas.length * 2 > 0
      ? selectedChairs.length + selectedSofas.length * 2
      : selectedTables.reduce(
          (sum, table) => sum + Number(table.seats || 0),
          0
        );

  const searchedGuests = useMemo(() => {
    const search = guestSearch.trim().toLowerCase();

    if (!search) return [];

    return mapItems.filter((item) =>
      String(item.label || "").toLowerCase().includes(search)
    );
  }, [guestSearch, mapItems]);

  const getParentTableLabel = (chairItem) => {
    const parentId = chairItem.parentTableId || chairItem.parent_table_id || "";

    if (!parentId) return "";

    const parentTable = mapItems.find(
      (item) => String(item.id) === String(parentId)
    );

    if (!parentTable) return "";

    return parentTable.label || `Table ${parentTable.seats || ""}`;
  };

  const isGuestSearchMatch = (item) => {
    const search = guestSearch.trim().toLowerCase();

    if (!search) return false;

    const label = String(item.label || "").toLowerCase();

    return label.includes(search);
  };

  const handleItemClick = (item) => {
    if (bookingMode === "view") return;
    if (!item.isSelectable) return;

    if (item.isReserved) {
      const info = item.reservedInfo;

      alert(
        `This item is reserved.\nBooking Number: ${
          info?.bookingNumber || ""
        }\nFrom: ${info?.from || ""}\nTo: ${info?.to || ""}`
      );
      return;
    }

    setSelectedItemIds((prev) =>
      prev.map(String).includes(String(item.id))
        ? prev.filter((id) => String(id) !== String(item.id))
        : [...prev, String(item.id)]
    );
  };

  const handleSectionChange = (e) => {
    if (bookingMode === "view") return;

    const selectedId = e.target.value;
    const foundSection = sections.find(
      (item) => String(item.id) === String(selectedId)
    );

    setSectionId(selectedId);
    setSectionName(foundSection?.section_name || "");
    setSelectedItemIds([]);
  };

  const handleReserve = async () => {
  if (bookingMode === "view") return;

  if (!user?.id && !bookingToShow?.user_id) {
    alert("Please login first.");
    navigate("/login");
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

  if (selectedItemIds.length === 0) {
    alert("Please select at least one table, chair, sofa, or seat.");
    return;
  }

  if (bookingMode === "edit" && bookingToShow?.id) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/event-bookings/${bookingToShow.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selected_items: selectedItemIds.map(String),
            booking_date: bookingDate,
            booking_time: preferredTime,
            duration,
            section: sectionName,
            custom_layout_json:
              Array.isArray(customLayoutFromState) &&
              customLayoutFromState.length > 0
                ? customLayoutFromState
                : mapLayout,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Event booking updated successfully");
      navigate("/my-bookings");
    } catch (error) {
      console.error("EVENT UPDATE ERROR:", error);
      alert("Server error while updating event booking");
    }

    return;
  }

  navigate("/pay-deposit", {
    state: {
      booking: {
        user_id: user?.id || bookingToShow?.user_id || null,
        userId: user?.id || bookingToShow?.user_id || null,
        email: userEmail,

        venueId: venue.id,
        venue_id: venue.id,
        venueName: venue.name,
        venue_name: venue.name,

        event_venue_id: venue.id,
        event_name: venue.name,

        selectedItems: selectedItemIds.map(String),
        selected_items: selectedItemIds.map(String),
        selectedTables,
        selectedChairs,
        selectedSofas,

        expectedGuests,
        expected_guests: expectedGuests,

        bookingDate,
        booking_date: bookingDate,

        time: preferredTime,
        booking_time: preferredTime,

        duration,
        deposit: 20,

        section: sectionName,

        category: "Event",
        item_type: "event",

        address: venue.address || `${venue.area || ""}, ${venue.city || ""}`,
        customLayout:
          Array.isArray(customLayoutFromState) &&
          customLayoutFromState.length > 0
            ? customLayoutFromState
            : mapLayout,
        custom_layout:
          Array.isArray(customLayoutFromState) &&
          customLayoutFromState.length > 0
            ? customLayoutFromState
            : mapLayout,
      },
    },
  });
};

  const renderMapItemContent = (item) => {
    if (item.isReserved && item.reservedInfo?.bookingNumber) {
      return (
        <span className="booking-number-on-table">
          {item.reservedInfo.bookingNumber}
        </span>
      );
    }

    if (item.type === "chair") {
      return (
        <span className="wedding-chair-label">{item.label || "Chair"}</span>
      );
    }

    if (
      item.type === "round-table" ||
      item.type === "rect-table" ||
      item.type === "square-table"
    ) {
      return (
        <span className="wedding-table-label">
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

      case "bride-groom-stage":
        return item.label || "Stage";

      case "stage":
        return item.label || "Stage";

      default:
        return item.label || "";
    }
  };

  const getItemTitle = (item) => {
    if (item.isReserved) {
      const info = item.reservedInfo;

      return `Booking: ${info?.bookingNumber || ""} | Reserved from ${
        info?.from || ""
      } to ${info?.to || ""} (${info?.duration || ""})`;
    }

    if (item.type === "chair") {
      const tableLabel = getParentTableLabel(item);

      return item.label
        ? `Guest: ${item.label}${tableLabel ? ` | Table: ${tableLabel}` : ""}`
        : "Chair";
    }

    if (
      item.type === "round-table" ||
      item.type === "rect-table" ||
      item.type === "square-table"
    ) {
      return item.label ? `Table: ${item.label}` : `Table ${item.seats || ""}`;
    }

    return item.label || item.type;
  };

  return (
    <div className="book-page">
      <div className="book-container">
        <div className="book-top-image">
          <img
            src={
              typeof venue.image === "string" && venue.image.trim()
                ? venue.image.trim()
                : "/images/events/default-event.jpg"
            }
            alt={venue.name}
            onError={(e) => {
              e.currentTarget.src = "/images/events/default-event.jpg";
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
            Event • {venue.description || venue.style_type || venue.type}
          </p>

          {bookingMode !== "create" && bookingToShow && (
            <p className="book-type">
              Booking Number:{" "}
              <strong>
                {bookingToShow.booking_number || bookingToShow.id}
              </strong>
            </p>
          )}

          <div className="book-info-row">
            <MapPin size={18} />
            <span>
              {venue.address || `${venue.area || ""}, ${venue.city || ""}`}
            </span>
          </div>

          <div className="book-info-row">
            <Clock3 size={18} />
            <span>{venue.hours || "Open all day"}</span>
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

          {bookingMode !== "view" && (
            <button
              type="button"
              className="create-seats-btn"
              style={{ marginTop: "16px" }}
              onClick={() =>
                navigate("/create-user-event-map", {
                  state: {
                    venue,
                    sectionId,
                    sectionName,
                    existingMap: mapLayout,
                  },
                })
              }
            >
              <PencilRuler size={18} />
              <span>Create Your Own Event Map</span>
            </button>
          )}
        </div>

        <div className="booking-main-split">
          <div className="booking-map-side">
            <div className="table-map-card">
              <h2>
                {Array.isArray(customLayoutFromState) &&
                customLayoutFromState.length > 0
                  ? "Your Custom Event Map"
                  : bookingMode === "view"
                  ? "View Event Reservation Map"
                  : "Event Venue Map"}
              </h2>

              <div className="guest-search-box">
                <label>Search Guest Name</label>

                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Example: Maria"
                  className="book-input"
                />

                {guestSearch.trim() && searchedGuests.length === 0 && (
                  <p className="guest-search-result not-found">
                    No guest found with this name.
                  </p>
                )}

                {guestSearch.trim() && searchedGuests.length > 0 && (
                  <div className="guest-search-result found">
                    {searchedGuests.map((item) => (
                      <p key={item.id}>
                        <strong>{item.label}</strong>
                        {item.type === "chair" && (
                          <>
                            {" "}
                            is on{" "}
                            <strong>
                              {getParentTableLabel(item) || "unknown table"}
                            </strong>
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>

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
                  Selected / Search Result
                </span>
              </p>

              <div className="admin-floor-map event-fixed-board">
                {mapItems.length === 0 ? (
                  <p className="no-map-message">
                    No event map available for this section.
                  </p>
                ) : (
                  mapItems.map((item) => (
                    <div
                      key={item.id}
                      className={`admin-map-item ${item.type} ${
                        item.isReserved ? "reserved-map-item" : ""
                      } ${
                        selectedItemIds.map(String).includes(String(item.id))
                          ? "selected-book-item"
                          : ""
                      } ${
                        isGuestSearchMatch(item) ? "guest-search-green" : ""
                      } ${item.isSelectable ? "clickable-item" : ""}`}
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
                <span>Expected Guests</span>
              </label>

              <input
                type="number"
                value={expectedGuests || 0}
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
                <option>2 hours</option>
                <option>3 hours</option>
                <option>4 hours</option>
                <option>5 hours</option>
                <option>6 hours</option>
              </select>

              <div className="selected-info">
                <p>
                  Selected Items: <strong>{selectedItemIds.length}</strong>
                </p>

                <p>
                  Selected Tables: <strong>{selectedTables.length}</strong>
                </p>

                <p>
                  Selected Chairs: <strong>{selectedChairs.length}</strong>
                </p>

                <p>
                  Selected Sofas: <strong>{selectedSofas.length}</strong>
                </p>

                <p>
                  Section: <strong>{sectionName || "Not selected"}</strong>
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
                  Deposit: <strong>$20</strong>
                </p>
              </div>

              <button
                type="button"
                className="payment-btn"
                onClick={handleReserve}
                disabled={bookingMode === "view"}
              >
                {bookingMode === "edit"
                  ? "Save Changes"
                  : bookingMode === "view"
                  ? "Viewing Reservation"
                  : "Reserve & Pay $20"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

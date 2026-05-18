const express = require("express");
const router = express.Router();
const db = require("../db");

function durationToHours(duration) {
  const value = String(duration || "").toLowerCase();

  if (value.includes("6")) return 6;
  if (value.includes("5")) return 5;
  if (value.includes("4")) return 4;
  if (value.includes("3")) return 3;
  if (value.includes("2")) return 2;

  return 1;
}

function calculateEndTime(startTime, duration) {
  const hours = durationToHours(duration);
  const [h, m] = String(startTime).split(":").map(Number);

  const date = new Date();
  date.setHours(h || 0);
  date.setMinutes(m || 0);
  date.setSeconds(0);
  date.setHours(date.getHours() + hours);

  return date.toTimeString().slice(0, 8);
}

function parseJsonArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// CREATE event booking
router.post("/", (req, res) => {
  const {
    user_id,
    event_venue_id,
    event_name,
    selected_items,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    payment_status,
    section,
    custom_layout_json,
  } = req.body;

  if (!event_venue_id || !event_name || !booking_date || !booking_time || !duration) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Array.isArray(selected_items) || selected_items.length === 0) {
    return res.status(400).json({
      message: "Please select tables, chairs, or seats",
    });
  }

  const end_time = calculateEndTime(booking_time, duration);

  const checkSql = `
    SELECT id, selected_items_json
    FROM event_bookings
    WHERE event_venue_id = ?
      AND booking_date = ?
      AND status = 'reserved'
      AND booking_time < ?
      AND end_time > ?
  `;

  db.query(
    checkSql,
    [event_venue_id, booking_date, end_time, booking_time],
    (checkErr, result) => {
      if (checkErr) {
        console.error("CHECK EVENT BOOKING ERROR:", checkErr);
        return res.status(500).json({ message: "Database error" });
      }

      const alreadyReserved = [];

      result.forEach((booking) => {
        alreadyReserved.push(...parseJsonArray(booking.selected_items_json));
      });

      const conflict = selected_items.some((id) =>
        alreadyReserved.map(String).includes(String(id))
      );

      if (conflict) {
        return res.status(409).json({
          message: "Some selected items are already reserved at this time",
        });
      }

      const insertSql = `
        INSERT INTO event_bookings
        (
          user_id,
          event_venue_id,
          event_name,
          selected_items_json,
          booking_date,
          booking_time,
          end_time,
          duration,
          deposit,
          payment_method,
          payment_status,
          section,
          custom_layout_json,
          status,
          check_in_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id || null,
          event_venue_id,
          event_name,
          JSON.stringify(selected_items.map(String)),
          booking_date,
          booking_time,
          end_time,
          duration,
          deposit || 0,
          payment_method || "Wish",
          payment_status || "paid",
          section || null,
          custom_layout_json ? JSON.stringify(custom_layout_json) : null,
          "reserved",
          "not_arrived",
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("INSERT EVENT BOOKING ERROR:", insertErr);
            return res.status(500).json({ message: "Booking failed" });
          }

          const bookingId = insertResult.insertId;
          const bookingNumber = `EV-${10000 + bookingId}`;

          const updateSql = `
            UPDATE event_bookings
            SET booking_number = ?
            WHERE id = ?
          `;

          db.query(updateSql, [bookingNumber, bookingId], (updateErr) => {
            if (updateErr) {
              console.error("UPDATE EVENT BOOKING NUMBER ERROR:", updateErr);
              return res.status(500).json({ message: "Booking number failed" });
            }

            return res.status(201).json({
              message: "Event booking created successfully",
              booking_id: bookingId,
              bookingNumber,
            });
          });
        }
      );
    }
  );
});

// GET reserved event items
router.get("/venue/:eventVenueId", (req, res) => {
  const { eventVenueId } = req.params;
  const { booking_date, booking_time, duration = "1 hour" } = req.query;

  if (!booking_date || !booking_time) {
    return res.status(400).json({
      message: "Date and time are required",
    });
  }

  const end_time = calculateEndTime(booking_time, duration);

  const sql = `
    SELECT 
      id,
      booking_number,
      selected_items_json,
      booking_time,
      end_time,
      duration
    FROM event_bookings
    WHERE event_venue_id = ?
      AND booking_date = ?
      AND status = 'reserved'
      AND booking_time < ?
      AND end_time > ?
  `;

  db.query(
    sql,
    [eventVenueId, booking_date, end_time, booking_time],
    (err, result) => {
      if (err) {
        console.error("GET RESERVED EVENT ITEMS ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const reservedItems = [];

      result.forEach((booking) => {
        const items = parseJsonArray(booking.selected_items_json);

        items.forEach((itemId) => {
          reservedItems.push({
            booking_id: booking.id,
            booking_number: booking.booking_number,
            item_id: String(itemId),
            from: booking.booking_time,
            to: booking.end_time,
            duration: booking.duration,
          });
        });
      });

      return res.status(200).json(reservedItems);
    }
  );
});

// GET user event bookings
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM event_bookings
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET USER EVENT BOOKINGS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = result.map((booking) => ({
      ...booking,
      selected_items: parseJsonArray(booking.selected_items_json),
      category: "Event",
      venue_id: booking.event_venue_id,
      venue_name: booking.event_name,
    }));

    return res.status(200).json(formatted);
  });
});

// UPDATE event booking
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    selected_items,
    booking_date,
    booking_time,
    duration,
    section,
    custom_layout_json,
  } = req.body;

  const end_time = calculateEndTime(booking_time, duration);

  const sql = `
    UPDATE event_bookings
    SET
      selected_items_json = ?,
      booking_date = ?,
      booking_time = ?,
      end_time = ?,
      duration = ?,
      section = ?,
      custom_layout_json = COALESCE(?, custom_layout_json),
      status = 'reserved',
      payment_status = 'paid'
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      JSON.stringify(selected_items || []),
      booking_date,
      booking_time,
      end_time,
      duration,
      section || null,
      custom_layout_json ? JSON.stringify(custom_layout_json) : null,
      id,
    ],
    (err) => {
      if (err) {
        console.error("UPDATE EVENT BOOKING ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      return res.status(200).json({
        message: "Event booking updated successfully",
      });
    }
  );
});

// DELETE event booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM event_bookings WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE EVENT BOOKING ERROR:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    return res.status(200).json({
      message: "Event booking deleted successfully",
    });
  });
});

module.exports = router;
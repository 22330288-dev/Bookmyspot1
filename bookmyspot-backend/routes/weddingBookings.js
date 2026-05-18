const express = require("express");
const router = express.Router();
const db = require("../db");

function calculateEndTime(startTime, duration) {
  const hours = parseInt(duration, 10) || 4;
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

function parseCustomLayout(value) {
  if (!value) return null;

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// GET wedding bookings for one user
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM wedding_hall_bookings
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET USER WEDDING BOOKINGS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const bookings = result.map((booking) => ({
      ...booking,
      booking_number: booking.booking_number || `WED-${booking.id}`,
      selected_items: parseJsonArray(booking.selected_items_json),
      custom_layout: parseCustomLayout(booking.custom_layout_json),
      category: "Wedding Hall",
    }));

    return res.status(200).json(bookings);
  });
});

// ADD new wedding booking
router.post("/", (req, res) => {
  const {
    user_id,
    wedding_hall_id,
    hall_name,
    selected_items,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    section,
    custom_layout_json,
  } = req.body;

  if (!wedding_hall_id || !booking_date || !booking_time || !duration) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Array.isArray(selected_items) || selected_items.length === 0) {
    return res.status(400).json({ message: "Please select tables or chairs" });
  }

  const end_time = calculateEndTime(booking_time, duration);

  const checkSql = `
    SELECT selected_items_json
    FROM wedding_hall_bookings
    WHERE wedding_hall_id = ?
      AND booking_date = ?
      AND booking_time < ?
      AND end_time > ?
  `;

  db.query(
    checkSql,
    [wedding_hall_id, booking_date, end_time, booking_time],
    (err, result) => {
      if (err) {
        console.error("CHECK WEDDING BOOKING ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const alreadyReserved = [];

      result.forEach((booking) => {
        const items = parseJsonArray(booking.selected_items_json);
        alreadyReserved.push(...items);
      });

      const conflict = selected_items.some((id) =>
        alreadyReserved.map(String).includes(String(id))
      );

      if (conflict) {
        return res.status(409).json({
          message:
            "Some selected tables or chairs are already reserved at this time",
        });
      }

      const insertSql = `
        INSERT INTO wedding_hall_bookings
        (
          user_id,
          wedding_hall_id,
          hall_name,
          selected_items_json,
          booking_date,
          booking_time,
          end_time,
          duration,
          deposit,
          payment_method,
          section,
          custom_layout_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id || null,
          wedding_hall_id,
          hall_name,
          JSON.stringify(selected_items),
          booking_date,
          booking_time,
          end_time,
          duration,
          deposit || 50,
          payment_method || "Wish",
          section || null,
          custom_layout_json ? JSON.stringify(custom_layout_json) : null,
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("INSERT WEDDING BOOKING ERROR:", insertErr);
            return res.status(500).json({ message: "Booking failed" });
          }

          return res.status(201).json({
            message: "Wedding hall booking created successfully",
            booking_id: insertResult.insertId,
            bookingNumber: `WED-${insertResult.insertId}`,
          });
        }
      );
    }
  );
});

// GET reserved items for one wedding hall by date/time
router.get("/venue/:hallId", (req, res) => {
  const { hallId } = req.params;
  const { booking_date, booking_time, duration = "4 hours" } = req.query;

  if (!booking_date || !booking_time) {
    return res.status(400).json({ message: "Date and time are required" });
  }

  const end_time = calculateEndTime(booking_time, duration);

  const sql = `
    SELECT id, selected_items_json, booking_time, end_time
    FROM wedding_hall_bookings
    WHERE wedding_hall_id = ?
      AND booking_date = ?
      AND booking_time < ?
      AND end_time > ?
  `;

  db.query(sql, [hallId, booking_date, end_time, booking_time], (err, result) => {
    if (err) {
      console.error("GET RESERVED WEDDING ITEMS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const reservedItems = [];

    result.forEach((booking) => {
      const items = parseJsonArray(booking.selected_items_json);

      items.forEach((itemId) => {
        reservedItems.push({
          booking_id: booking.id,
          item_id: itemId,
          from: booking.booking_time,
          to: booking.end_time,
        });
      });
    });

    return res.status(200).json(reservedItems);
  });
});

// UPDATE wedding booking
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    selected_items,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    section,
    custom_layout_json,
  } = req.body;

  if (!booking_date || !booking_time || !duration) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const end_time = calculateEndTime(booking_time, duration);

  const sql = `
    UPDATE wedding_hall_bookings
    SET
      selected_items_json = COALESCE(?, selected_items_json),
      booking_date = ?,
      booking_time = ?,
      end_time = ?,
      duration = ?,
      deposit = COALESCE(?, deposit),
      payment_method = COALESCE(?, payment_method),
      section = ?,
      custom_layout_json = COALESCE(?, custom_layout_json)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      selected_items ? JSON.stringify(selected_items) : null,
      booking_date,
      booking_time,
      end_time,
      duration,
      deposit || null,
      payment_method || null,
      section || null,
      custom_layout_json ? JSON.stringify(custom_layout_json) : null,
      id,
    ],
    (err) => {
      if (err) {
        console.error("UPDATE WEDDING BOOKING ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      return res.status(200).json({
        message: "Wedding booking updated successfully",
      });
    }
  );
});

// DELETE wedding booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM wedding_hall_bookings WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE WEDDING BOOKING ERROR:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    return res.status(200).json({
      message: "Wedding booking deleted successfully",
    });
  });
});

module.exports = router;
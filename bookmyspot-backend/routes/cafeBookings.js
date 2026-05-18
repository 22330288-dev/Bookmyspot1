const express = require("express");
const router = express.Router();
const db = require("../db");

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

// GET cafe bookings for one user
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM cafe_bookings
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET USER CAFE BOOKINGS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const bookings = result.map((booking) => ({
      ...booking,
      selected_chairs: parseJsonArray(booking.selected_chairs),
      booking_number: booking.booking_number || `CAFE-${booking.id}`,
      category: "Cafe",
    }));

    return res.status(200).json(bookings);
  });
});

// GET reserved tables for one cafe by date/time
router.get("/venue/:cafeId", (req, res) => {
  const { cafeId } = req.params;
  const { booking_date, booking_time } = req.query;

  if (!booking_date || !booking_time) {
    return res.status(400).json({
      message: "booking_date and booking_time are required",
    });
  }

  const sql = `
    SELECT id, table_id, selected_chairs, booking_time, duration
    FROM cafe_bookings
    WHERE cafe_id = ?
      AND booking_date = ?
      AND booking_time = ?
    ORDER BY id ASC
  `;

  db.query(sql, [cafeId, booking_date, booking_time], (err, result) => {
    if (err) {
      console.error("GET CAFE RESERVED TABLES ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const bookings = result.map((booking) => ({
      ...booking,
      selected_chairs: parseJsonArray(booking.selected_chairs),
    }));

    return res.status(200).json(bookings);
  });
});

// ADD new cafe booking
router.post("/", (req, res) => {
  const {
    user_id,
    cafe_id,
    cafe_name,
    table_id,
    selected_chairs,
    booked_seats,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    section,
    area,
  } = req.body;

  if (!cafe_id || !cafe_name || !table_id || !booking_date || !booking_time) {
    return res.status(400).json({
      message: "Missing required booking fields",
    });
  }

  const selectedChairsJson = Array.isArray(selected_chairs)
    ? JSON.stringify(selected_chairs)
    : "[]";

  const checkSql = `
    SELECT id
    FROM cafe_bookings
    WHERE cafe_id = ?
      AND table_id = ?
      AND booking_date = ?
      AND booking_time = ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [cafe_id, table_id, booking_date, booking_time],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error("CHECK CAFE BOOKING ERROR:", checkErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({
          message: "This table is already reserved at this date and time",
        });
      }

      const insertSql = `
        INSERT INTO cafe_bookings
        (
          user_id,
          cafe_id,
          cafe_name,
          table_id,
          selected_chairs,
          booked_seats,
          booking_date,
          booking_time,
          duration,
          deposit,
          payment_method,
          section,
          area
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id || null,
          cafe_id,
          cafe_name,
          table_id,
          selectedChairsJson,
          booked_seats || 1,
          booking_date,
          booking_time,
          duration || "1 hour",
          deposit || 0,
          payment_method || "Wish",
          section || null,
          area || null,
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("INSERT CAFE BOOKING ERROR:", insertErr);
            return res.status(500).json({ message: "Database error" });
          }

          return res.status(201).json({
            message: "Cafe booking created successfully",
            id: insertResult.insertId,
            bookingNumber: `CAFE-${insertResult.insertId}`,
          });
        }
      );
    }
  );
});

// UPDATE cafe booking
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    table_id,
    selected_chairs,
    booked_seats,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    section,
    area,
  } = req.body;

  const sql = `
    UPDATE cafe_bookings
    SET
      table_id = COALESCE(?, table_id),
      selected_chairs = COALESCE(?, selected_chairs),
      booked_seats = COALESCE(?, booked_seats),
      booking_date = ?,
      booking_time = ?,
      duration = ?,
      deposit = COALESCE(?, deposit),
      payment_method = COALESCE(?, payment_method),
      section = ?,
      area = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      table_id || null,
      selected_chairs ? JSON.stringify(selected_chairs) : null,
      booked_seats || null,
      booking_date,
      booking_time,
      duration,
      deposit || null,
      payment_method || null,
      section,
      area,
      id,
    ],
    (err) => {
      if (err) {
        console.error("UPDATE CAFE BOOKING ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      return res.status(200).json({
        message: "Cafe booking updated successfully",
      });
    }
  );
});

// DELETE cafe booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM cafe_bookings WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE CAFE BOOKING ERROR:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    return res.status(200).json({
      message: "Cafe booking deleted successfully",
    });
  });
});

module.exports = router;
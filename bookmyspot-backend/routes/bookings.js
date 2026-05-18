const express = require("express");
const router = express.Router();
const db = require("../db");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = String(timeStr).split(":").map(Number);

  return (hours || 0) * 60 + (minutes || 0);
}

function durationToMinutes(duration) {
  if (!duration) return 60;

  const normalized = String(duration).toLowerCase().trim();

  if (normalized.includes("6")) return 360;
  if (normalized.includes("5")) return 300;
  if (normalized.includes("4")) return 240;
  if (normalized.includes("3")) return 180;
  if (normalized.includes("2")) return 120;

  return 60;
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "bookmyspotweb@gmail.com",
    pass: process.env.EMAIL_PASS || "tkbcwglytdtjufmc",
  },
});

async function sendBookingEmail({
  to,
  bookingNumber,
  qrToken,
  venueName,
  bookingDate,
  bookingTime,
  duration,
  section,
  area,
  deposit,
  paymentMethod,
}) {
  const qrPageLink = `${FRONTEND_URL}/booking-qr/${bookingNumber}`;

  const qrText = JSON.stringify({
    bookingNumber,
    booking_number: bookingNumber,
    token: qrToken,
  });

  const qrImageDataUrl = await QRCode.toDataURL(qrText);

  await transporter.sendMail({
    from: process.env.EMAIL_USER || "bookmyspotweb@gmail.com",
    to,
    subject: `Your Reservation QR Code - ${bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color:#2b241f;">
        <h2 style="color:#6b4a2b;">Your reservation is confirmed</h2>

        <p><strong>Booking Number:</strong> ${bookingNumber}</p>
        <p><strong>Venue:</strong> ${venueName}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Section:</strong> ${section || "N/A"}</p>
        <p><strong>Area:</strong> ${area || "N/A"}</p>
        <p><strong>Deposit:</strong> $${deposit}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>

        <p>Please show this QR code when you arrive:</p>

        <a href="${qrPageLink}"
          style="
            display:inline-block;
            background:#6b4a2b;
            color:white;
            padding:12px 18px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
            margin: 10px 0 18px;
          ">
          Open QR Code
        </a>

        <br />

        <img src="${qrImageDataUrl}" alt="QR Code" style="max-width:260px; border:1px solid #ddd; padding:10px;" />

        <p style="margin-top:16px; color:#777;">
          When you arrive, the admin can scan this QR code to view your table, chairs, date, time, and duration.
        </p>
      </div>
    `,
  });
}

// GET reserved items by venue/date/time
router.get("/venue/:venueId", (req, res) => {
  const { venueId } = req.params;
  const { booking_date, booking_time, duration } = req.query;

  if (!booking_date || !booking_time) {
    return res.status(400).json({
      message: "booking_date and booking_time are required",
    });
  }

  const requestedStart = timeToMinutes(booking_time);
  const requestedDuration = durationToMinutes(duration || "1 hour");
  const requestedEnd = requestedStart + requestedDuration;

  const sql = `
    SELECT
      id,
      booking_number,
      table_id,
      selected_chairs,
      selected_sofas,
      booked_seats,
      booking_date,
      booking_time,
      duration,
      status
    FROM bookings
    WHERE venue_id = ?
      AND booking_date = ?
      AND status IN ('reserved', 'pending_payment')
  `;

  db.query(sql, [venueId, booking_date], (err, result) => {
    if (err) {
      console.error("GET RESERVED BOOKINGS ERROR:", err);
      return res.status(500).json({ message: err.message });
    }

    const overlappingBookings = result
      .map((booking) => {
        const existingStart = timeToMinutes(booking.booking_time);
        const existingDuration = durationToMinutes(booking.duration);
        const existingEnd = existingStart + existingDuration;

        const overlaps =
          requestedStart < existingEnd && requestedEnd > existingStart;

        return {
          id: booking.id,
          booking_number: booking.booking_number,
          table_id: booking.table_id,
          selected_chairs: parseJsonArray(booking.selected_chairs),
          selected_sofas: parseJsonArray(booking.selected_sofas),
          booked_seats: booking.booked_seats,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          duration: booking.duration,
          reserved_from: booking.booking_time,
          reserved_until: minutesToTime(existingEnd),
          overlaps,
        };
      })
      .filter((booking) => booking.overlaps);

    return res.status(200).json(overlappingBookings);
  });
});

// GET user restaurant/main bookings
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM bookings
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET USER BOOKINGS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formattedBookings = result.map((booking) => ({
      ...booking,
      selected_chairs: parseJsonArray(booking.selected_chairs),
      selected_sofas: parseJsonArray(booking.selected_sofas),
      category:
        booking.item_type === "cafe"
          ? "Cafe"
          : booking.category || "Restaurant",
    }));

    return res.status(200).json(formattedBookings);
  });
});

// VERIFY BOOKING QR - restaurants + cafes + wedding halls
router.get("/verify-all/:bookingNumber", (req, res) => {
  const { bookingNumber } = req.params;

  const restaurantSql = `
    SELECT 
      id,
      booking_number,
      qr_token,
      user_id,
      venue_id,
      venue_name,
      table_id,
      selected_chairs,
      selected_sofas,
      booked_seats,
      booking_date,
      booking_time,
      duration,
      deposit,
      payment_method,
      payment_status,
      section,
      area,
      status,
      check_in_status,
      item_type,
      CASE
        WHEN item_type = 'cafe' THEN 'Cafe'
        ELSE 'Restaurant'
      END AS type
    FROM bookings
    WHERE booking_number = ?
    LIMIT 1
  `;

  db.query(restaurantSql, [bookingNumber], (restaurantErr, restaurantResult) => {
    if (restaurantErr) {
      console.error("VERIFY RESTAURANT ERROR:", restaurantErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (restaurantResult.length > 0) {
      const booking = restaurantResult[0];

      booking.selected_chairs = parseJsonArray(booking.selected_chairs);
      booking.selected_sofas = parseJsonArray(booking.selected_sofas);

      return res.status(200).json({
        valid: true,
        booking,
      });
    }

    const cafeSql = `
      SELECT 
        id,
        booking_number,
        user_id,
        cafe_id AS venue_id,
        cafe_name AS venue_name,
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
        'Cafe' AS type
      FROM cafe_bookings
      WHERE booking_number = ?
      LIMIT 1
    `;

    db.query(cafeSql, [bookingNumber], (cafeErr, cafeResult) => {
      if (cafeErr) {
        console.error("VERIFY CAFE ERROR:", cafeErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (cafeResult.length > 0) {
        const booking = cafeResult[0];

        booking.selected_chairs = parseJsonArray(booking.selected_chairs);
        booking.selected_sofas = [];

        return res.status(200).json({
          valid: true,
          booking,
        });
      }

      const weddingSql = `
        SELECT 
          id,
          booking_number,
          user_id,
          wedding_hall_id AS venue_id,
          hall_name AS venue_name,
          selected_items_json AS selected_chairs,
          booking_date,
          booking_time,
          end_time,
          duration,
          deposit,
          payment_method,
          section,
          'Wedding Hall' AS type
        FROM wedding_hall_bookings
        WHERE booking_number = ?
        LIMIT 1
      `;

      db.query(weddingSql, [bookingNumber], (weddingErr, weddingResult) => {
        if (weddingErr) {
          console.error("VERIFY WEDDING ERROR:", weddingErr);
          return res.status(500).json({ message: "Database error" });
        }

        if (weddingResult.length > 0) {
          const booking = weddingResult[0];

          booking.selected_chairs = parseJsonArray(booking.selected_chairs);
          booking.selected_sofas = [];
          booking.table_id = null;
          booking.booked_seats = booking.selected_chairs.length;
          booking.area = "Wedding Hall";

          return res.status(200).json({
            valid: true,
            booking,
          });
        }

        return res.status(404).json({
          valid: false,
          message: "Booking not found",
        });
      });
    });
  });
});

// CREATE restaurant/main booking
router.post("/", (req, res) => {
  const {
    user_id,
    venue_id,
    venue_name,
    table_id,
    selected_chairs,
    selected_sofas,
    booked_seats,
    booking_date,
    booking_time,
    duration,
    deposit,
    payment_method,
    payment_status,
    section,
    area,
    item_type,
    email,
  } = req.body;

  if (
    !venue_id ||
    !venue_name ||
    !table_id ||
    !booked_seats ||
    !booking_date ||
    !booking_time ||
    !duration ||
    deposit === undefined ||
    deposit === null ||
    !section ||
    !area ||
    !email
  ) {
    return res.status(400).json({ message: "Missing booking data" });
  }

  const requestedStart = timeToMinutes(booking_time);
  const requestedDuration = durationToMinutes(duration);
  const requestedEnd = requestedStart + requestedDuration;

  const finalPaymentMethod = payment_method || "Wish";

  const finalPaymentStatus =
    payment_status ||
    (finalPaymentMethod === "card" || finalPaymentMethod === "Credit Card"
      ? "paid"
      : "pending");

  const finalStatus =
    finalPaymentStatus === "paid" ? "reserved" : "pending_payment";

  const checkSql = `
    SELECT id, table_id, booking_time, duration, status
    FROM bookings
    WHERE venue_id = ?
      AND table_id = ?
      AND booking_date = ?
      AND status IN ('reserved', 'pending_payment')
  `;

  db.query(
    checkSql,
    [venue_id, table_id, booking_date],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error("CHECK BOOKING ERROR:", checkErr);
        return res.status(500).json({ message: checkErr.message });
      }

      const hasOverlap = checkResult.some((booking) => {
        const existingStart = timeToMinutes(booking.booking_time);
        const existingDuration = durationToMinutes(booking.duration);
        const existingEnd = existingStart + existingDuration;

        return requestedStart < existingEnd && requestedEnd > existingStart;
      });

      if (hasOverlap) {
        return res.status(400).json({
          message: "This table is already reserved during this time period",
        });
      }

      const insertSql = `
        INSERT INTO bookings
        (
          user_id,
          venue_id,
          venue_name,
          table_id,
          selected_chairs,
          selected_sofas,
          booked_seats,
          booking_date,
          booking_time,
          duration,
          deposit,
          payment_method,
          payment_status,
          section,
          area,
          item_type,
          email,
          status,
          check_in_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id || null,
          venue_id,
          venue_name,
          table_id,
          JSON.stringify(selected_chairs || []),
          JSON.stringify(selected_sofas || []),
          booked_seats,
          booking_date,
          booking_time,
          duration,
          deposit,
          finalPaymentMethod,
          finalPaymentStatus,
          section,
          area,
          item_type || "restaurant",
          email,
          finalStatus,
          "not_arrived",
        ],
        async (insertErr, result) => {
          if (insertErr) {
            console.error("INSERT BOOKING ERROR:", insertErr);
            return res.status(500).json({ message: insertErr.message });
          }

          const bookingId = result.insertId;
          const bookingNumber = `BK-${10000 + bookingId}`;
          const qrToken = crypto.randomBytes(16).toString("hex");

          const updateSql = `
            UPDATE bookings
            SET booking_number = ?, qr_token = ?
            WHERE id = ?
          `;

          db.query(
            updateSql,
            [bookingNumber, qrToken, bookingId],
            async (updateErr) => {
              if (updateErr) {
                console.error("UPDATE QR ERROR:", updateErr);
                return res.status(500).json({ message: updateErr.message });
              }

              try {
                await sendBookingEmail({
                  to: email,
                  bookingNumber,
                  qrToken,
                  venueName: venue_name,
                  bookingDate: booking_date,
                  bookingTime: booking_time,
                  duration,
                  section,
                  area,
                  deposit,
                  paymentMethod: finalPaymentMethod,
                });

                return res.status(201).json({
                  message: "Booking created successfully and QR sent by email",
                  bookingId,
                  bookingNumber,
                  qrToken,
                  payment_status: finalPaymentStatus,
                  status: finalStatus,
                });
              } catch (emailErr) {
                console.error("EMAIL SEND ERROR:", emailErr);

                return res.status(201).json({
                  message: "Booking created, but QR email failed to send",
                  bookingId,
                  bookingNumber,
                  qrToken,
                  payment_status: finalPaymentStatus,
                  status: finalStatus,
                });
              }
            }
          );
        }
      );
    }
  );
});

// SEARCH by booking number
router.get("/search/:bookingNumber", (req, res) => {
  const { bookingNumber } = req.params;

  const sql = `
    SELECT *
    FROM bookings
    WHERE booking_number = ?
    LIMIT 1
  `;

  db.query(sql, [bookingNumber], (err, result) => {
    if (err) {
      console.error("SEARCH BOOKING ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = result[0];

    booking.selected_chairs = parseJsonArray(booking.selected_chairs);
    booking.selected_sofas = parseJsonArray(booking.selected_sofas);

    return res.status(200).json(booking);
  });
});

// UPDATE booking
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    table_id,
    selected_chairs,
    selected_sofas,
    booked_seats,
    booking_date,
    booking_time,
    duration,
    section,
    area,
  } = req.body;

  const sql = `
    UPDATE bookings
    SET
      table_id = COALESCE(?, table_id),
      selected_chairs = COALESCE(?, selected_chairs),
      selected_sofas = COALESCE(?, selected_sofas),
      booked_seats = COALESCE(?, booked_seats),
      booking_date = ?,
      booking_time = ?,
      duration = ?,
      section = ?,
      area = ?,
      status = 'reserved',
      payment_status = 'paid'
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      table_id || null,
      selected_chairs ? JSON.stringify(selected_chairs) : null,
      selected_sofas ? JSON.stringify(selected_sofas) : null,
      booked_seats || null,
      booking_date,
      booking_time,
      duration,
      section,
      area,
      id,
    ],
    (err) => {
      if (err) {
        console.error("UPDATE BOOKING ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      return res.status(200).json({
        message: "Booking updated successfully",
      });
    }
  );
});

// DELETE booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM bookings WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE BOOKING ERROR:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    return res.status(200).json({
      message: "Booking deleted successfully",
    });
  });
});

// CHECK-IN by QR
router.post("/check-in", (req, res) => {
  const { booking_number, bookingNumber, qr_token, token } = req.body;

  const finalBookingNumber = booking_number || bookingNumber;
  const finalToken = qr_token || token;

  if (!finalBookingNumber || !finalToken) {
    return res.status(400).json({
      message: "Missing QR data",
    });
  }

  const sql = `
    SELECT *
    FROM bookings
    WHERE booking_number = ?
      AND qr_token = ?
      AND status IN ('reserved', 'pending_payment')
    LIMIT 1
  `;

  db.query(sql, [finalBookingNumber, finalToken], (err, result) => {
    if (err) {
      console.error("CHECK-IN SELECT ERROR:", err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (!result.length) {
      return res.status(404).json({
        message: "Invalid QR code",
      });
    }

    const booking = result[0];

    db.query(
      "UPDATE bookings SET check_in_status = 'checked_in' WHERE id = ?",
      [booking.id],
      (updateErr) => {
        if (updateErr) {
          console.error("CHECK-IN UPDATE ERROR:", updateErr);
          return res.status(500).json({
            message: "Failed to check in",
          });
        }

        booking.selected_chairs = parseJsonArray(booking.selected_chairs);
        booking.selected_sofas = parseJsonArray(booking.selected_sofas);
        booking.check_in_status = "checked_in";

        return res.status(200).json({
          message: "Customer checked in successfully",
          booking,
        });
      }
    );
  });
});

module.exports = router;
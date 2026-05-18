const express = require("express");
const router = express.Router();
const db = require("../db");

const DEFAULT_IMAGE = "/images/events/default-event.jpg";

function normalizeEventVenue(row) {
  const finalType = row.type || row.event_type || row.style_type || "Event";

  return {
    ...row,
    type: finalType,
    event_type: finalType,
    style_type: finalType,
    image: row.image || DEFAULT_IMAGE,
    google_maps_link: row.google_maps_link || "",
  };
}

// GET all event venues
router.get("/", (req, res) => {
  const sql = `
    SELECT *
    FROM event_venues
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET EVENT VENUES ERROR:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    const venues = Array.isArray(result) ? result.map(normalizeEventVenue) : [];

    return res.status(200).json(venues);
  });
});

// GET one event venue
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM event_venues
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("GET ONE EVENT VENUE ERROR:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    if (!result.length) {
      return res.status(404).json({
        message: "Event venue not found",
      });
    }

    return res.status(200).json(normalizeEventVenue(result[0]));
  });
});

// ADD event venue
router.post("/", (req, res) => {
  const {
    name,
    type,
    event_type,
    style_type,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
    google_maps_link,
  } = req.body;

  if (!name || !city || !area) {
    return res.status(400).json({
      message: "Name, city, and area are required",
    });
  }

  const finalType = type || event_type || style_type || "Event";

  const insertVenueSql = `
    INSERT INTO event_venues
    (
      name,
      type,
      event_type,
      city,
      area,
      rating,
      image,
      phone,
      instagram,
      whatsapp,
      hours,
      google_maps_link
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertVenueSql,
    [
      name,
      finalType,
      finalType,
      city,
      area,
      rating || 4.5,
      image || DEFAULT_IMAGE,
      phone || "",
      instagram || "",
      whatsapp || "",
      hours || "",
      google_maps_link || "",
    ],
    (err, result) => {
      if (err) {
        console.error("ADD EVENT VENUE ERROR:", err);
        return res.status(500).json({
          message: "Failed to save event venue",
          error: err.message,
        });
      }

      const newVenueId = result.insertId;

      // Create Indoor and Outdoor automatically
      const insertSectionsSql = `
        INSERT INTO event_sections (event_venue_id, section_name, map_layout)
        VALUES (?, ?, ?), (?, ?, ?)
      `;

      db.query(
        insertSectionsSql,
        [newVenueId, "Indoor", "[]", newVenueId, "Outdoor", "[]"],
        (sectionErr) => {
          if (sectionErr) {
            console.error("CREATE DEFAULT EVENT SECTIONS ERROR:", sectionErr);

            return res.status(201).json({
              message:
                "Event venue added successfully, but default sections were not created",
              id: newVenueId,
            });
          }

          return res.status(201).json({
            message: "Event venue added successfully",
            id: newVenueId,
          });
        }
      );
    }
  );
});

// UPDATE event venue
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    name,
    type,
    event_type,
    style_type,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
    google_maps_link,
  } = req.body;

  if (!name || !city || !area) {
    return res.status(400).json({
      message: "Name, city, and area are required",
    });
  }

  const finalType = type || event_type || style_type || "Event";

  const updateVenueSql = `
    UPDATE event_venues
    SET
      name = ?,
      type = ?,
      event_type = ?,
      city = ?,
      area = ?,
      rating = ?,
      image = ?,
      phone = ?,
      instagram = ?,
      whatsapp = ?,
      hours = ?,
      google_maps_link = ?
    WHERE id = ?
  `;

  db.query(
    updateVenueSql,
    [
      name,
      finalType,
      finalType,
      city,
      area,
      rating || 4.5,
      image || DEFAULT_IMAGE,
      phone || "",
      instagram || "",
      whatsapp || "",
      hours || "",
      google_maps_link || "",
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE EVENT VENUE ERROR:", err);
        return res.status(500).json({
          message: "Failed to update event venue",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Event venue not found",
        });
      }

      return res.status(200).json({
        message: "Event venue updated successfully",
      });
    }
  );
});

// DELETE event venue
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const deleteSectionsSql = `
    DELETE FROM event_sections
    WHERE event_venue_id = ?
  `;

  db.query(deleteSectionsSql, [id], (sectionErr) => {
    if (sectionErr) {
      console.error("DELETE EVENT SECTIONS ERROR:", sectionErr);
      return res.status(500).json({
        message: "Failed to delete event sections",
        error: sectionErr.message,
      });
    }

    const deleteVenueSql = `
      DELETE FROM event_venues
      WHERE id = ?
    `;

    db.query(deleteVenueSql, [id], (venueErr, result) => {
      if (venueErr) {
        console.error("DELETE EVENT VENUE ERROR:", venueErr);
        return res.status(500).json({
          message: "Failed to delete event venue",
          error: venueErr.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Event venue not found",
        });
      }

      return res.status(200).json({
        message: "Event venue deleted successfully",
      });
    });
  });
});

module.exports = router;
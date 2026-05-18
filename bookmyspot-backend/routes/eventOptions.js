const express = require("express");
const router = express.Router();
const db = require("../db");

// GET sections for one event venue
router.get("/:eventVenueId/sections", (req, res) => {
  const { eventVenueId } = req.params;

  const sql = `
    SELECT id, section_name
    FROM event_sections
    WHERE event_venue_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [eventVenueId], (err, result) => {
    if (err) {
      console.error("GET EVENT SECTIONS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(Array.isArray(result) ? result : []);
  });
});

// ADMIN: add section
router.post("/:eventVenueId/sections", (req, res) => {
  const { eventVenueId } = req.params;
  const { section_name } = req.body;

  if (!section_name) {
    return res.status(400).json({ message: "Section name is required" });
  }

  const sql = `
    INSERT INTO event_sections (event_venue_id, section_name, map_layout)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [eventVenueId, section_name, "[]"], (err, result) => {
    if (err) {
      console.error("ADD EVENT SECTION ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Section added successfully",
      id: result.insertId,
    });
  });
});

// GET map layout
router.get("/:eventVenueId/layout/:sectionId", (req, res) => {
  const { eventVenueId, sectionId } = req.params;

  const sql = `
    SELECT map_layout
    FROM event_sections
    WHERE event_venue_id = ? AND id = ?
    LIMIT 1
  `;

  db.query(sql, [eventVenueId, sectionId], (err, result) => {
    if (err) {
      console.error("GET EVENT MAP ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(200).json({ map: [] });
    }

    let parsed = [];

    try {
      parsed = JSON.parse(result[0].map_layout || "[]");
    } catch {
      parsed = [];
    }

    return res.status(200).json({ map: parsed });
  });
});

// SAVE map layout
router.post("/:eventVenueId/layout/:sectionId", (req, res) => {
  const { eventVenueId, sectionId } = req.params;
  const { map } = req.body;

  if (!Array.isArray(map)) {
    return res.status(400).json({ message: "Map must be an array" });
  }

  const sql = `
    UPDATE event_sections
    SET map_layout = ?
    WHERE event_venue_id = ? AND id = ?
  `;

  db.query(sql, [JSON.stringify(map), eventVenueId, sectionId], (err) => {
    if (err) {
      console.error("SAVE EVENT MAP ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Event map saved successfully",
    });
  });
});

module.exports = router;
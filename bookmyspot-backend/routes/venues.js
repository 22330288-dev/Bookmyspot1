const express = require("express");
const router = express.Router();
const db = require("../db");

// get available sections/areas for one venue
router.get("/:venueId/sections", (req, res) => {
  const { venueId } = req.params;

  const sql = `
    SELECT section_name, area_type
    FROM venue_sections
    WHERE venue_id = ?
    ORDER BY section_name, area_type
  `;

  db.query(sql, [venueId], (err, result) => {
    if (err) {
      console.error("GET VENUE SECTIONS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// get map layout by section + area
router.get("/:venueId/layout", (req, res) => {
  const { venueId } = req.params;
  const { section, area } = req.query;

  if (!section || !area) {
    return res.status(400).json({
      message: "section and area are required",
    });
  }

  const sql = `
    SELECT map_layout
    FROM venue_sections
    WHERE venue_id = ?
      AND section_name = ?
      AND area_type = ?
    LIMIT 1
  `;

  db.query(sql, [venueId, section, area], (err, result) => {
    if (err) {
      console.error("GET VENUE LAYOUT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(200).json({ map: [] });
    }

    let parsedMap = [];
    try {
      parsedMap = JSON.parse(result[0].map_layout || "[]");
    } catch (parseErr) {
      console.error("MAP PARSE ERROR:", parseErr);
      return res.status(500).json({ message: "Invalid map layout data" });
    }

    return res.status(200).json({ map: parsedMap });
  });
});

module.exports = router;
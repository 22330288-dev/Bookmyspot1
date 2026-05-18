const express = require("express");
const router = express.Router();
const db = require("../db");

// get sections for one venue
router.get("/:venueId/sections", (req, res) => {
  const { venueId } = req.params;

  const sql = `
    SELECT id, section_name
    FROM restaurant_sections
    WHERE venue_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [venueId], (err, result) => {
    if (err) {
      console.error("GET SECTIONS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// ADMIN: get all areas for one section, even if no map yet
router.get("/:venueId/admin-areas/:sectionId", (req, res) => {
  const { venueId, sectionId } = req.params;

  const sql = `
    SELECT id, area_name
    FROM restaurant_areas
    WHERE venue_id = ? AND section_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [venueId, sectionId], (err, result) => {
    if (err) {
      console.error("GET ADMIN AREAS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// USER: get only areas that should appear to the user
// - if restaurant has no smoking, hide Smoking Area
// - if area has no map, hide it
router.get("/:venueId/areas/:sectionId", (req, res) => {
  const { venueId, sectionId } = req.params;

  const sql = `
    SELECT a.id, a.area_name, a.map_layout, r.has_smoking
    FROM restaurant_areas a
    INNER JOIN restaurants r ON r.id = a.venue_id
    WHERE a.venue_id = ? AND a.section_id = ?
    ORDER BY a.id ASC
  `;

  db.query(sql, [venueId, sectionId], (err, result) => {
    if (err) {
      console.error("GET AREAS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    let areas = Array.isArray(result) ? result : [];

    // if restaurant has no smoking area, hide Smoking Area
    if (areas.length > 0 && Number(areas[0].has_smoking) !== 1) {
      areas = areas.filter((item) => {
        const area = (item.area_name || "").toLowerCase();

        if (area.includes("smoking") && !area.includes("non")) {
          return false;
        }

        return true;
      });
    }

    // only show areas that already have a saved map
    areas = areas.filter((item) => {
      if (!item.map_layout) return false;

      try {
        const parsed = JSON.parse(item.map_layout);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        return false;
      }
    });

    const cleanedAreas = areas.map(({ id, area_name }) => ({
      id,
      area_name,
    }));

    return res.status(200).json(cleanedAreas);
  });
});

// get map layout for selected section + area
router.get("/:venueId/layout/:sectionId/:areaId", (req, res) => {
  const { venueId, sectionId, areaId } = req.params;

  const sql = `
    SELECT map_layout
    FROM restaurant_areas
    WHERE venue_id = ? AND section_id = ? AND id = ?
    LIMIT 1
  `;

  db.query(sql, [venueId, sectionId, areaId], (err, result) => {
    if (err) {
      console.error("GET MAP LAYOUT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(200).json({ map: [] });
    }

    let parsed = [];
    try {
      parsed = JSON.parse(result[0].map_layout || "[]");
    } catch (e) {
      console.error("MAP PARSE ERROR:", e);
      return res.status(500).json({ message: "Invalid map layout" });
    }

    return res.status(200).json({ map: parsed });
  });
});

// save map layout for selected section + area
router.post("/:venueId/layout/:sectionId/:areaId", (req, res) => {
  const { venueId, sectionId, areaId } = req.params;
  const { map } = req.body;

  if (!Array.isArray(map)) {
    return res.status(400).json({ message: "Map must be an array" });
  }

  const sql = `
    UPDATE restaurant_areas
    SET map_layout = ?
    WHERE venue_id = ? AND section_id = ? AND id = ?
  `;

  db.query(
    sql,
    [JSON.stringify(map), venueId, sectionId, areaId],
    (err, result) => {
      if (err) {
        console.error("SAVE MAP LAYOUT ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Area not found" });
      }

      return res.status(200).json({
        message: "Map layout saved successfully",
      });
    }
  );
});

module.exports = router;
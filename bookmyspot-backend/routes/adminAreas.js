const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:venueId/:sectionId", (req, res) => {
  const { venueId, sectionId } = req.params;

  db.query(
    "SELECT * FROM restaurant_areas WHERE venue_id = ? AND section_id = ? ORDER BY id ASC",
    [venueId, sectionId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(result);
    }
  );
});

router.post("/", (req, res) => {
  const { venue_id, section_id, area_name, map_layout } = req.body;

  db.query(
    "INSERT INTO restaurant_areas (venue_id, section_id, area_name, map_layout) VALUES (?, ?, ?, ?)",
    [venue_id, section_id, area_name, map_layout || "[]"],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Area added", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { area_name, map_layout } = req.body;

  db.query(
    "UPDATE restaurant_areas SET area_name = ?, map_layout = ? WHERE id = ?",
    [area_name, map_layout || "[]", id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Area updated" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM restaurant_areas WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Area deleted" });
  });
});

module.exports = router;
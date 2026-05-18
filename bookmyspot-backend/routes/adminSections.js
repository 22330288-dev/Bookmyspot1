const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:venueId", (req, res) => {
  const { venueId } = req.params;

  db.query(
    "SELECT * FROM restaurant_sections WHERE venue_id = ? ORDER BY id ASC",
    [venueId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(result);
    }
  );
});

router.post("/", (req, res) => {
  const { venue_id, section_name } = req.body;

  db.query(
    "INSERT INTO restaurant_sections (venue_id, section_name) VALUES (?, ?)",
    [venue_id, section_name],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Section added", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { section_name } = req.body;

  db.query(
    "UPDATE restaurant_sections SET section_name = ? WHERE id = ?",
    [section_name, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Section updated" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM restaurant_sections WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Section deleted" });
  });
});

module.exports = router;
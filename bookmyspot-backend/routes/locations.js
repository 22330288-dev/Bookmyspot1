const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM locations ORDER BY city_name, area_name", (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { city_name, area_name } = req.body;

  if (!city_name || !area_name) {
    return res.status(400).json({ message: "city_name and area_name are required" });
  }

  db.query(
    "INSERT INTO locations (city_name, area_name) VALUES (?, ?)",
    [city_name, area_name],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Location added", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { city_name, area_name } = req.body;

  db.query(
    "UPDATE locations SET city_name = ?, area_name = ? WHERE id = ?",
    [city_name, area_name, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Location updated" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM locations WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Location deleted" });
  });
});

module.exports = router;
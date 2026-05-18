const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all cafes
router.get("/", (req, res) => {
  const sql = "SELECT * FROM cafes ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET cafes error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const cafes = result.map((cafe) => {
      cafe.has_smoking = Number(cafe.has_smoking) === 1;
      cafe.google_maps_link = cafe.google_maps_link || "";
      return cafe;
    });

    res.status(200).json(cafes);
  });
});

// GET one cafe
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM cafes WHERE id = ? LIMIT 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("GET cafe error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const cafe = result[0];
    cafe.has_smoking = Number(cafe.has_smoking) === 1;
    cafe.google_maps_link = cafe.google_maps_link || "";

    res.status(200).json(cafe);
  });
});

// ADD cafe
router.post("/", (req, res) => {
  const {
    name,
    cuisine,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
    has_smoking,
    google_maps_link,
  } = req.body;

  if (!name || !cuisine || !city || !area) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO cafes
    (
      name,
      cuisine,
      city,
      area,
      rating,
      image,
      phone,
      instagram,
      whatsapp,
      hours,
      has_smoking,
      google_maps_link
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      cuisine,
      city,
      area,
      rating || 4.0,
      image || "",
      phone || "",
      instagram || "",
      whatsapp || "",
      hours || "",
      has_smoking ? 1 : 0,
      google_maps_link || "",
    ],
    (err, result) => {
      if (err) {
        console.error("ADD cafe error:", err);
        return res.status(500).json({ message: "Insert failed" });
      }

      res.status(201).json({
        message: "Cafe added successfully",
        id: result.insertId,
      });
    }
  );
});

// UPDATE cafe
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    name,
    cuisine,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
    has_smoking,
    google_maps_link,
  } = req.body;

  const sql = `
    UPDATE cafes
    SET
      name = ?,
      cuisine = ?,
      city = ?,
      area = ?,
      rating = ?,
      image = ?,
      phone = ?,
      instagram = ?,
      whatsapp = ?,
      hours = ?,
      has_smoking = ?,
      google_maps_link = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      cuisine,
      city,
      area,
      rating || 4.0,
      image || "",
      phone || "",
      instagram || "",
      whatsapp || "",
      hours || "",
      has_smoking ? 1 : 0,
      google_maps_link || "",
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE cafe error:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cafe not found" });
      }

      res.status(200).json({ message: "Cafe updated successfully" });
    }
  );
});

// DELETE cafe
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM cafes WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE cafe error:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    res.status(200).json({ message: "Cafe deleted successfully" });
  });
});

module.exports = router;
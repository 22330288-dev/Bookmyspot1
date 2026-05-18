const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all wedding halls
router.get("/", (req, res) => {
  const sql = "SELECT * FROM wedding_halls ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET WEDDING HALLS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// GET one wedding hall
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM wedding_halls WHERE id = ? LIMIT 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("GET ONE WEDDING HALL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Wedding hall not found" });
    }

    return res.status(200).json(result[0]);
  });
});

// ADD wedding hall
router.post("/", (req, res) => {
  const {
    name,
    style_type,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
  } = req.body;

  const sql = `
    INSERT INTO wedding_halls
    (name, style_type, city, area, rating, image, phone, instagram, whatsapp, hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      style_type,
      city,
      area,
      rating,
      image,
      phone,
      instagram,
      whatsapp,
      hours,
    ],
    (err, result) => {
      if (err) {
        console.error("POST WEDDING HALL ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const hallId = result.insertId;

      const insertSectionsSql = `
        INSERT INTO wedding_hall_sections (wedding_hall_id, section_name)
        VALUES (?, 'Indoor'), (?, 'Outdoor')
      `;

      db.query(insertSectionsSql, [hallId, hallId], (sectionErr) => {
        if (sectionErr) {
          console.error("INSERT WEDDING SECTIONS ERROR:", sectionErr);
          return res.status(500).json({
            message: "Wedding hall added but sections failed",
          });
        }

        return res.status(201).json({
          message: "Wedding hall added successfully",
          id: hallId,
        });
      });
    }
  );
});

// UPDATE wedding hall
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    name,
    style_type,
    city,
    area,
    rating,
    image,
    phone,
    instagram,
    whatsapp,
    hours,
  } = req.body;

  const sql = `
    UPDATE wedding_halls
    SET
      name = ?,
      style_type = ?,
      city = ?,
      area = ?,
      rating = ?,
      image = ?,
      phone = ?,
      instagram = ?,
      whatsapp = ?,
      hours = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      style_type,
      city,
      area,
      rating,
      image,
      phone,
      instagram,
      whatsapp,
      hours,
      id,
    ],
    (err) => {
      if (err) {
        console.error("UPDATE WEDDING HALL ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      return res.status(200).json({
        message: "Wedding hall updated successfully",
      });
    }
  );
});

// DELETE wedding hall
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM wedding_halls WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("DELETE WEDDING HALL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Wedding hall deleted successfully",
    });
  });
});

module.exports = router;
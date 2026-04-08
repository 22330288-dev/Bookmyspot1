const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all restaurants
router.get("/", (req, res) => {
  const sql = "SELECT * FROM restaurants ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET restaurants error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const restaurants = result.map((restaurant) => {
      if (restaurant.mapLayout) {
        try {
          restaurant.mapLayout = JSON.parse(restaurant.mapLayout);
        } catch (e) {
          restaurant.mapLayout = [];
        }
      } else {
        restaurant.mapLayout = [];
      }

      return restaurant;
    });

    return res.status(200).json(restaurants);
  });
});

// GET one restaurant by id
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM restaurants WHERE id = ? LIMIT 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("GET restaurant by id error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurant = result[0];

    if (restaurant.mapLayout) {
      try {
        restaurant.mapLayout = JSON.parse(restaurant.mapLayout);
      } catch (e) {
        restaurant.mapLayout = [];
      }
    } else {
      restaurant.mapLayout = [];
    }

    return res.status(200).json(restaurant);
  });
});

// ADD restaurant
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
  } = req.body;

  if (!name || !cuisine || !city || !area) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO restaurants
    (name, cuisine, city, area, rating, image, phone, instagram, whatsapp, hours, mapLayout)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      JSON.stringify([]),
    ],
    (err, result) => {
      if (err) {
        console.error("ADD restaurant error:", err);
        return res.status(500).json({ message: "Insert failed" });
      }

      return res.status(201).json({
        message: "Restaurant added successfully",
        id: result.insertId,
      });
    }
  );
});

// UPDATE restaurant
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
  } = req.body;

  const sql = `
    UPDATE restaurants
    SET name = ?, cuisine = ?, city = ?, area = ?, rating = ?, image = ?, phone = ?, instagram = ?, whatsapp = ?, hours = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
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
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE restaurant error:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      return res.status(200).json({
        message: "Restaurant updated successfully",
      });
    }
  );
});

// SAVE / UPDATE restaurant map
router.put("/:id/map", (req, res) => {
  const { id } = req.params;
  const { mapLayout } = req.body;

  if (!Array.isArray(mapLayout)) {
    return res.status(400).json({ message: "mapLayout must be an array" });
  }

  const sql = "UPDATE restaurants SET mapLayout = ? WHERE id = ?";

  db.query(sql, [JSON.stringify(mapLayout), id], (err, result) => {
    if (err) {
      console.error("UPDATE restaurant map error:", err);
      return res.status(500).json({ message: "Failed to save map" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: "Restaurant map saved successfully",
    });
  });
});

// DELETE restaurant
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM restaurants WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE restaurant error:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: "Restaurant deleted successfully",
    });
  });
});

module.exports = router;
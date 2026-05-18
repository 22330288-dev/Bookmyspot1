const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all map items by venue / section / area
router.get("/", (req, res) => {
  const { venue_id, section_id, area_id } = req.query;

  if (!venue_id) {
    return res.status(400).json({ message: "venue_id is required" });
  }

  let sql = `
    SELECT *
    FROM venue_map_items
    WHERE venue_id = ?
  `;
  const params = [venue_id];

  if (section_id && section_id !== "null" && section_id !== "undefined") {
    sql += ` AND section_id = ?`;
    params.push(section_id);
  }

  if (area_id && area_id !== "null" && area_id !== "undefined") {
    sql += ` AND area_id = ?`;
    params.push(area_id);
  }

  sql += ` ORDER BY id ASC`;

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("GET MAP ITEMS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// ADD new map item
router.post("/", (req, res) => {
  const {
    venue_id,
    section_id,
    area_id,
    item_type,
    label,
    x,
    y,
    width,
    height,
    rotation,
    seats_count,
    is_reservable,
    parent_table_id
  } = req.body;

  if (!venue_id || !item_type) {
    return res.status(400).json({
      message: "venue_id and item_type are required"
    });
  }

  const sql = `
    INSERT INTO venue_map_items
    (
      venue_id,
      section_id,
      area_id,
      item_type,
      label,
      x,
      y,
      width,
      height,
      rotation,
      seats_count,
      is_reservable,
      parent_table_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    venue_id,
    section_id || null,
    area_id || null,
    item_type,
    label || null,
    x ?? 50,
    y ?? 50,
    width ?? 60,
    height ?? 60,
    rotation ?? 0,
    seats_count ?? 0,
    is_reservable ?? 0,
    parent_table_id || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("ADD MAP ITEM ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Map item added successfully",
      id: result.insertId
    });
  });
});

// UPDATE map item
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    label,
    x,
    y,
    width,
    height,
    rotation,
    seats_count,
    is_reservable,
    parent_table_id
  } = req.body;

  const sql = `
    UPDATE venue_map_items
    SET
      label = ?,
      x = ?,
      y = ?,
      width = ?,
      height = ?,
      rotation = ?,
      seats_count = ?,
      is_reservable = ?,
      parent_table_id = ?
    WHERE id = ?
  `;

  const values = [
    label || null,
    x ?? 0,
    y ?? 0,
    width ?? 60,
    height ?? 60,
    rotation ?? 0,
    seats_count ?? 0,
    is_reservable ?? 0,
    parent_table_id || null,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("UPDATE MAP ITEM ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Map item updated successfully"
    });
  });
});

// DELETE map item
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM venue_map_items WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE MAP ITEM ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Map item deleted successfully"
    });
  });
});

module.exports = router;
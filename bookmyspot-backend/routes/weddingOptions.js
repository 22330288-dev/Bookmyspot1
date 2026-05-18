const express = require("express");
const router = express.Router();
const db = require("../db");

// GET sections for one wedding hall
router.get("/:hallId/sections", (req, res) => {
  const { hallId } = req.params;

  const sql = `
    SELECT id, section_name
    FROM wedding_hall_sections
    WHERE wedding_hall_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [hallId], (err, result) => {
    if (err) {
      console.error("GET WEDDING SECTIONS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// GET layout for one wedding hall section
router.get("/:hallId/layout/:sectionId", (req, res) => {
  const { hallId, sectionId } = req.params;

  const sql = `
    SELECT id, layout_json
    FROM wedding_hall_layouts
    WHERE wedding_hall_id = ? AND section_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [hallId, sectionId], (err, result) => {
    if (err) {
      console.error("GET WEDDING LAYOUT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(200).json({ map: [] });
    }

    let parsedMap = [];

    try {
      parsedMap = JSON.parse(result[0].layout_json || "[]");
    } catch (parseError) {
      console.error("PARSE WEDDING LAYOUT ERROR:", parseError);
      parsedMap = [];
    }

    return res.status(200).json({
      id: result[0].id,
      map: Array.isArray(parsedMap) ? parsedMap : [],
    });
  });
});

// SAVE or UPDATE wedding hall layout
router.post("/:hallId/layout", (req, res) => {
  const { hallId } = req.params;
  const { section_id, map } = req.body;

  if (!section_id || !Array.isArray(map)) {
    return res.status(400).json({
      message: "Section and map are required",
    });
  }

  const checkSql = `
    SELECT id
    FROM wedding_hall_layouts
    WHERE wedding_hall_id = ? AND section_id = ?
    LIMIT 1
  `;

  db.query(checkSql, [hallId, section_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("CHECK WEDDING LAYOUT ERROR:", checkErr);
      return res.status(500).json({ message: "Database error" });
    }

    const mapJson = JSON.stringify(map);

    if (checkResult.length > 0) {
      const updateSql = `
        UPDATE wedding_hall_layouts
        SET layout_json = ?
        WHERE wedding_hall_id = ? AND section_id = ?
      `;

      db.query(updateSql, [mapJson, hallId, section_id], (updateErr) => {
        if (updateErr) {
          console.error("UPDATE WEDDING LAYOUT ERROR:", updateErr);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(200).json({
          message: "Wedding hall layout updated successfully",
        });
      });
    } else {
      const insertSql = `
        INSERT INTO wedding_hall_layouts (wedding_hall_id, section_id, layout_json)
        VALUES (?, ?, ?)
      `;

      db.query(insertSql, [hallId, section_id, mapJson], (insertErr, insertResult) => {
        if (insertErr) {
          console.error("INSERT WEDDING LAYOUT ERROR:", insertErr);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(201).json({
          message: "Wedding hall layout saved successfully",
          id: insertResult.insertId,
        });
      });
    }
  });
});

module.exports = router;
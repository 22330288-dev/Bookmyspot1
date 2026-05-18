const express = require("express");
const router = express.Router();
const db = require("../db");

// GET cafe layout
router.get("/", (req, res) => {
  const { cafe_id, venue_id, section_id, area_id } = req.query;
  const cafeId = cafe_id || venue_id;

  const sql = `
    SELECT * FROM cafe_layouts
    WHERE cafe_id = ? AND section_id = ? AND area_id = ?
    LIMIT 1
  `;

  db.query(sql, [cafeId, section_id, area_id], (err, result) => {
    if (err) {
      console.error("GET cafe layout error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (!result.length) {
      return res.json([]);
    }

    try {
      const layout = JSON.parse(result[0].layout_json || "[]");
      return res.json(layout);
    } catch (e) {
      return res.json([]);
    }
  });
});

// SAVE / UPDATE cafe layout
router.post("/save", (req, res) => {
  const { cafe_id, venue_id, section_id, area_id, layout } = req.body;
  const cafeId = cafe_id || venue_id;

  if (!cafeId || !section_id || !area_id) {
    return res.status(400).json({ message: "Missing cafe, section, or area" });
  }

  if (!Array.isArray(layout)) {
    return res.status(400).json({ message: "layout must be an array" });
  }

  const checkSql = `
    SELECT id FROM cafe_layouts
    WHERE cafe_id = ? AND section_id = ? AND area_id = ?
    LIMIT 1
  `;

  db.query(checkSql, [cafeId, section_id, area_id], (err, result) => {
    if (err) {
      console.error("CHECK cafe layout error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.length > 0) {
      const updateSql = `
        UPDATE cafe_layouts
        SET layout_json = ?, updated_at = NOW()
        WHERE cafe_id = ? AND section_id = ? AND area_id = ?
      `;

      db.query(
        updateSql,
        [JSON.stringify(layout), cafeId, section_id, area_id],
        (err2) => {
          if (err2) {
            console.error("UPDATE cafe layout error:", err2);
            return res.status(500).json({ message: "Update failed" });
          }

          return res.json({ message: "Cafe layout updated" });
        }
      );
    } else {
      const insertSql = `
        INSERT INTO cafe_layouts
        (cafe_id, section_id, area_id, layout_json)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [cafeId, section_id, area_id, JSON.stringify(layout)],
        (err3) => {
          if (err3) {
            console.error("INSERT cafe layout error:", err3);
            return res.status(500).json({ message: "Insert failed" });
          }

          return res.json({ message: "Cafe layout saved" });
        }
      );
    }
  });
});

module.exports = router;
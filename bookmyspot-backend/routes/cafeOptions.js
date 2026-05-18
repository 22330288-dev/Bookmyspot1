const express = require("express");
const router = express.Router();
const db = require("../db");

// GET sections for one cafe
router.get("/:cafeId/sections", (req, res) => {
  const { cafeId } = req.params;

  const sql = `
    SELECT id, section_name
    FROM cafe_sections
    WHERE cafe_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [cafeId], (err, result) => {
    if (err) {
      console.error("GET CAFE SECTIONS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// GET areas for user
// يظهر فقط الـ areas اللي إلها map محفوظ
router.get("/:cafeId/areas/:sectionId", (req, res) => {
  const { cafeId, sectionId } = req.params;

  const sql = `
    SELECT a.id, a.area_name
    FROM cafe_areas a
    WHERE a.cafe_id = ?
      AND a.section_id = ?
      AND EXISTS (
        SELECT 1
        FROM cafe_layouts l
        WHERE l.cafe_id = a.cafe_id
          AND l.section_id = a.section_id
          AND l.area_id = a.id
      )
    ORDER BY a.id ASC
  `;

  db.query(sql, [cafeId, sectionId], (err, result) => {
    if (err) {
      console.error("GET USER CAFE AREAS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// GET areas for admin
// يظهر كل الـ areas حتى لو بعد ما فيها map
router.get("/:cafeId/admin-areas/:sectionId", (req, res) => {
  const { cafeId, sectionId } = req.params;

  const sql = `
    SELECT id, area_name
    FROM cafe_areas
    WHERE cafe_id = ? AND section_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [cafeId, sectionId], (err, result) => {
    if (err) {
      console.error("GET ADMIN CAFE AREAS ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(result);
  });
});

// GET cafe layout by cafe + section + area
router.get("/:cafeId/layout/:sectionId/:areaId", (req, res) => {
  const { cafeId, sectionId, areaId } = req.params;

  const sql = `
    SELECT id, layout_json
    FROM cafe_layouts
    WHERE cafe_id = ? AND section_id = ? AND area_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [cafeId, sectionId, areaId], (err, result) => {
    if (err) {
      console.error("GET CAFE LAYOUT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length) {
      return res.status(200).json({ map: [] });
    }

    let parsedMap = [];

    try {
      parsedMap = JSON.parse(result[0].layout_json || "[]");
    } catch (parseError) {
      console.error("PARSE CAFE LAYOUT ERROR:", parseError);
      parsedMap = [];
    }

    return res.status(200).json({
      id: result[0].id,
      map: Array.isArray(parsedMap) ? parsedMap : [],
    });
  });
});

// ADD new cafe section
router.post("/:cafeId/sections", (req, res) => {
  const { cafeId } = req.params;
  const { section_name } = req.body;

  if (!section_name || !section_name.trim()) {
    return res.status(400).json({ message: "Section name is required" });
  }

  const sql = `
    INSERT INTO cafe_sections (cafe_id, section_name)
    VALUES (?, ?)
  `;

  db.query(sql, [cafeId, section_name.trim()], (err, result) => {
    if (err) {
      console.error("ADD CAFE SECTION ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Cafe section added successfully",
      id: result.insertId,
    });
  });
});

// ADD new cafe area
router.post("/:cafeId/areas", (req, res) => {
  const { cafeId } = req.params;
  const { section_id, area_name } = req.body;

  if (!section_id || !area_name || !area_name.trim()) {
    return res.status(400).json({
      message: "Section and area name are required",
    });
  }

  const sql = `
    INSERT INTO cafe_areas (cafe_id, section_id, area_name)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [cafeId, section_id, area_name.trim()], (err, result) => {
    if (err) {
      console.error("ADD CAFE AREA ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Cafe area added successfully",
      id: result.insertId,
    });
  });
});

// SAVE or UPDATE cafe layout
router.post("/:cafeId/layout", (req, res) => {
  const { cafeId } = req.params;
  const { section_id, area_id, map } = req.body;

  if (!section_id || !area_id || !Array.isArray(map)) {
    return res.status(400).json({
      message: "Section, area, and map are required",
    });
  }

  const checkSql = `
    SELECT id
    FROM cafe_layouts
    WHERE cafe_id = ? AND section_id = ? AND area_id = ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [cafeId, section_id, area_id],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error("CHECK CAFE LAYOUT ERROR:", checkErr);
        return res.status(500).json({ message: "Database error" });
      }

      const mapJson = JSON.stringify(map);

      if (checkResult.length > 0) {
        const updateSql = `
          UPDATE cafe_layouts
          SET layout_json = ?
          WHERE cafe_id = ? AND section_id = ? AND area_id = ?
        `;

        db.query(
          updateSql,
          [mapJson, cafeId, section_id, area_id],
          (updateErr) => {
            if (updateErr) {
              console.error("UPDATE CAFE LAYOUT ERROR:", updateErr);
              return res.status(500).json({ message: "Database error" });
            }

            return res.status(200).json({
              message: "Cafe layout updated successfully",
            });
          }
        );
      } else {
        const insertSql = `
          INSERT INTO cafe_layouts (cafe_id, section_id, area_id, layout_json)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [cafeId, section_id, area_id, mapJson],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("INSERT CAFE LAYOUT ERROR:", insertErr);
              return res.status(500).json({ message: "Database error" });
            }

            return res.status(201).json({
              message: "Cafe layout saved successfully",
              id: insertResult.insertId,
            });
          }
        );
      }
    }
  );
});

module.exports = router;
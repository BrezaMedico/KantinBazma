const express = require("express");
const router = express.Router();
const pool = require("../db/db");

router.get("/barcode/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM foods
      WHERE barcode = $1
      `,
      [barcode],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Makanan tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM foods ORDER BY id DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  console.log("BODY:", req.body);
  const { name, stock, price, barcode } = req.body;

  const result = await pool.query(
    "INSERT INTO foods (name, stock, price, barcode) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, stock, price, barcode || null],
  );

  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, stock, price, barcode } = req.body;

  const result = await pool.query(
    "UPDATE foods SET name=$1, stock=$2, price=$3, barcode=$4 WHERE id=$5 RETURNING *",
    [name, stock, price, barcode, id],
  );

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE ID:", id);

    await pool.query("DELETE FROM foods WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (error) {
    console.log("DELETE ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus data",
      error: error.message,
    });
  }
});

module.exports = router;

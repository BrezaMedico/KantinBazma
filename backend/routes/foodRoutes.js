const express = require("express");
const router = express.Router();
const pool = require("../db/db");

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM foods ORDER BY id DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, stock, price } = req.body;

  const result = await pool.query(
    "INSERT INTO foods (name, stock, price) VALUES ($1,$2,$3) RETURNING *",
    [name, stock, price]
  );

  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, stock, price } = req.body;

  const result = await pool.query(
    "UPDATE foods SET name=$1, stock=$2, price=$3 WHERE id=$4 RETURNING *",
    [name, stock, price, id]
  );

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    console.log("DELETE ID:", id);

    await pool.query(
      "DELETE FROM foods WHERE id = $1",
      [id]
    );

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
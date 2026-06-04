const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// GET
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM purchases
      ORDER BY id DESC
    `);

    const purchases = result.rows;

    // ambil detail item
    for (const purchase of purchases) {
      const itemResult = await pool.query(
        `
        SELECT
          purchase_items.*,
          foods.name
        FROM purchase_items
        JOIN foods
        ON foods.id = purchase_items.food_id
        WHERE purchase_id = $1
        `,
        [purchase.id],
      );

      purchase.items = itemResult.rows;
    }

    res.json(purchases);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET
// POST
router.post("/", async (req, res) => {
  try {
    const { buyer_name, cart, grand_total } = req.body;

    // simpan transaksi utama
    const purchaseResult = await pool.query(
      `
      INSERT INTO purchases
      (
        buyer_name,
        grand_total
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [buyer_name, grand_total],
    );

    const purchase = purchaseResult.rows[0];

    // simpan item transaksi
    for (const item of cart) {
      await pool.query(
        `
        INSERT INTO purchase_items
        (
          purchase_id,
          food_id,
          quantity,
          price_per_pcs,
          subtotal
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          purchase.id,
          item.food_id,
          item.quantity,
          item.price_per_pcs,
          item.subtotal,
        ],
      );

      // kurangi stock
      await pool.query(
        `
        UPDATE foods
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.food_id],
      );
    }

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Gagal checkout",
    });
  }
});

// DELETE PURCHASE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ambil item transaksi dulu
    const itemResult = await pool.query(
      `
      SELECT *
      FROM purchase_items
      WHERE purchase_id = $1
      `,
      [id],
    );

    const items = itemResult.rows;

    // kembalikan stock
    for (const item of items) {
      await pool.query(
        `
        UPDATE foods
        SET stock = stock + $1
        WHERE id = $2
        `,
        [item.quantity, item.food_id],
      );
    }

    // hapus detail item
    await pool.query(
      `
      DELETE FROM purchase_items
      WHERE purchase_id = $1
      `,
      [id],
    );

    // hapus transaksi utama
    await pool.query(
      `
      DELETE FROM purchases
      WHERE id = $1
      `,
      [id],
    );

    res.json({
      success: true,
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus transaksi",
    });
  }
});

module.exports = router;

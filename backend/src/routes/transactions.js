const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByType,
} = require("../tools");

// ─── GET ALL TRANSACTIONS ────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const transactions = await getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET SUMMARY ─────────────────────────────────────────
router.get("/summary", async (req, res) => {
  try {
    const summary = await getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET BY TYPE ──────────────────────────────────────────
router.get("/type/:type", async (req, res) => {
  try {
    const transactions = await getTransactionsByType(req.params.type);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CREATE TRANSACTION ───────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    // Validasi field wajib
    if (!type || !category || !amount || !description) {
      return res.status(400).json({
        error: "Field type, category, amount, description wajib diisi",
      });
    }

    // Validasi type
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "Type harus 'income' atau 'expense'",
      });
    }

    const result = await createTransaction(
      type,
      category,
      amount,
      description,
      date
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── UPDATE TRANSACTION ───────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { type, category, amount, description } = req.body;
    const result = await updateTransaction(
      req.params.id,
      type,
      category,
      amount,
      description
    );

    if (result.status === "error") {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE TRANSACTION ───────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const result = await deleteTransaction(req.params.id);

    if (result.status === "error") {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
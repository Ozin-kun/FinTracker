const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── GET ALL TRANSACTIONS ────────────────────────────────
async function getAllTransactions() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    date: t.date.toISOString().split("T")[0],
  }));
}

// ─── GET SUMMARY ─────────────────────────────────────────
async function getSummary() {
  const transactions = await prisma.transaction.findMany();
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: totalIncome - totalExpense,
  };
}

// ─── CREATE TRANSACTION ───────────────────────────────────
async function createTransaction(type, category, amount, description, date) {
  const transaction = await prisma.transaction.create({
    data: {
      type,
      category,
      amount: parseInt(amount),
      description,
      date: date ? new Date(date) : new Date(),
    },
  });
  return {
    status: "success",
    message: `Transaksi "${description}" sebesar Rp${parseInt(amount).toLocaleString("id-ID")} berhasil ditambahkan`,
    id: transaction.id,
  };
}

// ─── UPDATE TRANSACTION ───────────────────────────────────
async function updateTransaction(id, type, category, amount, description) {
  const existing = await prisma.transaction.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) {
    return {
      status: "error",
      message: `Transaksi dengan ID ${id} tidak ditemukan`,
    };
  }

  await prisma.transaction.update({
    where: { id: parseInt(id) },
    data: {
      ...(type && { type }),
      ...(category && { category }),
      ...(amount && { amount: parseInt(amount) }),
      ...(description && { description }),
    },
  });

  return {
    status: "success",
    message: `Transaksi ID ${id} berhasil diperbarui`,
  };
}

// ─── DELETE TRANSACTION ───────────────────────────────────
async function deleteTransaction(id) {
  const existing = await prisma.transaction.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) {
    return {
      status: "error",
      message: `Transaksi dengan ID ${id} tidak ditemukan`,
    };
  }

  await prisma.transaction.delete({
    where: { id: parseInt(id) },
  });

  return {
    status: "success",
    message: `Transaksi ID ${id} berhasil dihapus`,
  };
}

// ─── GET TRANSACTIONS BY TYPE ─────────────────────────────
async function getTransactionsByType(type) {
  const transactions = await prisma.transaction.findMany({
    where: { type },
    orderBy: { date: "desc" },
  });
  return transactions.map((t) => ({
    id: t.id,
    category: t.category,
    amount: t.amount,
    description: t.description,
    date: t.date.toISOString().split("T")[0],
  }));
}

module.exports = {
  getAllTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByType,
};
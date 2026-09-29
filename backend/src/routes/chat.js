const express = require("express");
const router = express.Router();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { HumanMessage, SystemMessage, ToolMessage } = require("@langchain/core/messages");
const { z } = require("zod");
const tools_fn = require("../tools");

// ─── Definisi Tools pakai Zod Schema ─────────────────────
const getAllTransactionsTool = tool(
  async () => await tools_fn.getAllTransactions(),
  {
    name: "get_all_transactions",
    description: "Mengambil semua riwayat transaksi keuangan",
    schema: z.object({}),
  }
);

const getSummaryTool = tool(
  async () => await tools_fn.getSummary(),
  {
    name: "get_summary",
    description: "Menghitung ringkasan: total pemasukan, pengeluaran, dan saldo",
    schema: z.object({}),
  }
);

const createTransactionTool = tool(
  async ({ type, category, amount, description, date }) =>
    await tools_fn.createTransaction(type, category, amount, description, date),
  {
    name: "create_transaction",
    description: "Menambahkan transaksi baru (pemasukan atau pengeluaran)",
    schema: z.object({
      type: z.enum(["income", "expense"]).describe("Jenis transaksi"),
      category: z.string().describe("Kategori, contoh: makan, transport, gaji"),
      amount: z.number().describe("Nominal dalam rupiah"),
      description: z.string().describe("Keterangan singkat transaksi"),
      date: z.string().optional().describe("Tanggal format YYYY-MM-DD, kosongkan untuk hari ini"),
    }),
  }
);

const updateTransactionTool = tool(
  async ({ id, type, category, amount, description }) =>
    await tools_fn.updateTransaction(id, type, category, amount, description),
  {
    name: "update_transaction",
    description: "Mengupdate transaksi yang sudah ada berdasarkan ID",
    schema: z.object({
      id: z.number().describe("ID transaksi yang ingin diupdate"),
      type: z.enum(["income", "expense"]).optional().describe("Jenis baru"),
      category: z.string().optional().describe("Kategori baru"),
      amount: z.number().optional().describe("Nominal baru"),
      description: z.string().optional().describe("Keterangan baru"),
    }),
  }
);

const deleteTransactionTool = tool(
  async ({ id }) => await tools_fn.deleteTransaction(id),
  {
    name: "delete_transaction",
    description: "Menghapus transaksi berdasarkan ID",
    schema: z.object({
      id: z.number().describe("ID transaksi yang ingin dihapus"),
    }),
  }
);

const getTransactionsByTypeTool = tool(
  async ({ type }) => await tools_fn.getTransactionsByType(type),
  {
    name: "get_transactions_by_type",
    description: "Mengambil transaksi berdasarkan tipe tertentu",
    schema: z.object({
      type: z.enum(["income", "expense"]).describe("Tipe transaksi"),
    }),
  }
);

const tools = [
  getAllTransactionsTool,
  getSummaryTool,
  createTransactionTool,
  updateTransactionTool,
  deleteTransactionTool,
  getTransactionsByTypeTool,
];

// ─── Setup Model ──────────────────────────────────────────
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
}).bindTools(tools);

const SYSTEM_PROMPT = `Kamu adalah asisten keuangan pribadi bernama FinAI.
Tugasmu membantu user mengelola riwayat keuangan melalui percakapan.
Kamu bisa menambah, melihat, mengupdate, dan menghapus transaksi keuangan.
Selalu gunakan Bahasa Indonesia yang ramah dan mudah dipahami.
Ketika menyebut nominal uang, gunakan format "Rp10.000" bukan "10000".
Setelah melakukan aksi (tambah/update/hapus), selalu konfirmasi hasilnya ke user.
Jika user menyebut "25 ribu" artinya 25000, "1 juta" artinya 1000000.`;

// ─── Agentic Loop (Jauh Lebih Simple!) ───────────────────
async function runAgent(userMessage) {
  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userMessage),
  ];

  // Loop sampai tidak ada tool call lagi
  for (let i = 0; i < 10; i++) {
    const response = await model.invoke(messages);
    messages.push(response);

    // Kalau tidak ada tool call, kembalikan jawaban
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response.content;
    }

    console.log(`Tools dipanggil: ${response.tool_calls.map(tc => tc.name).join(", ")}`);

    // Eksekusi semua tool calls secara paralel
    const toolResults = await Promise.all(
      response.tool_calls.map(async (tc) => {
        const selectedTool = tools.find((t) => t.name === tc.name);
        const result = await selectedTool.invoke(tc.args);
        return new ToolMessage({
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      })
    );

    // Tambahkan semua hasil tool ke messages
    messages.push(...toolResults);
  }

  return "Maaf, saya tidak dapat memproses permintaan tersebut.";
}

// ─── Chat Endpoint ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message tidak boleh kosong" });
    }
    const reply = await runAgent(message);
    res.json({ reply });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  getAllTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByType,
} = require("../tools");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Tool Definitions ─────────────────────────────────────
const tools = [
  {
    functionDeclarations: [
      {
        name: "get_all_transactions",
        description: "Mengambil semua riwayat transaksi keuangan",
        parameters: { type: "OBJECT", properties: {} },
      },
      {
        name: "get_summary",
        description:
          "Menghitung ringkasan keuangan: total pemasukan, total pengeluaran, dan saldo",
        parameters: { type: "OBJECT", properties: {} },
      },
      {
        name: "create_transaction",
        description: "Menambahkan transaksi baru (pemasukan atau pengeluaran)",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              description: "'income' untuk pemasukan, 'expense' untuk pengeluaran",
            },
            category: {
              type: "STRING",
              description: "Kategori transaksi, contoh: makan, transport, gaji",
            },
            amount: {
              type: "NUMBER",
              description: "Nominal dalam rupiah",
            },
            description: {
              type: "STRING",
              description: "Keterangan singkat transaksi",
            },
            date: {
              type: "STRING",
              description: "Tanggal format YYYY-MM-DD, kosongkan untuk hari ini",
            },
          },
          required: ["type", "category", "amount", "description"],
        },
      },
      {
        name: "update_transaction",
        description: "Mengupdate transaksi yang sudah ada berdasarkan ID",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "NUMBER",
              description: "ID transaksi yang ingin diupdate",
            },
            type: { type: "STRING", description: "'income' atau 'expense'" },
            category: { type: "STRING", description: "Kategori baru" },
            amount: { type: "NUMBER", description: "Nominal baru" },
            description: { type: "STRING", description: "Keterangan baru" },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_transaction",
        description: "Menghapus transaksi berdasarkan ID",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "NUMBER",
              description: "ID transaksi yang ingin dihapus",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_transactions_by_type",
        description: "Mengambil transaksi berdasarkan tipe tertentu saja",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              description: "'income' untuk pemasukan, 'expense' untuk pengeluaran",
            },
          },
          required: ["type"],
        },
      },
    ],
  },
];

// ─── Tool Executor ────────────────────────────────────────
async function executeTool(name, args) {
  console.log(`🔧 Tool dipanggil: ${name} | Args:`, args);
  switch (name) {
    case "get_all_transactions":
      return await getAllTransactions();
    case "get_summary":
      return await getSummary();
    case "create_transaction":
      return await createTransaction(
        args.type,
        args.category,
        args.amount,
        args.description,
        args.date
      );
    case "update_transaction":
      return await updateTransaction(
        args.id,
        args.type,
        args.category,
        args.amount,
        args.description
      );
    case "delete_transaction":
      return await deleteTransaction(args.id);
    case "get_transactions_by_type":
      return await getTransactionsByType(args.type);
    default:
      return { error: `Tool ${name} tidak ditemukan` };
  }
}

// ─── System Prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `
Kamu adalah asisten keuangan pribadi bernama FinAI.
Tugasmu membantu user mengelola riwayat keuangan mereka melalui percakapan.
Kamu bisa menambah, melihat, mengupdate, dan menghapus transaksi keuangan.
Selalu gunakan Bahasa Indonesia yang ramah dan mudah dipahami.
Ketika menyebut nominal uang, gunakan format "Rp10.000" bukan "10000".
Setelah melakukan aksi (tambah/update/hapus), selalu konfirmasi hasilnya ke user dengan jelas.
Jika user menyebut nominal seperti "25 ribu", artinya 25000. "1 juta" artinya 1000000.
`;

// ─── Agentic Loop ─────────────────────────────────────────
async function runAgent(userMessage) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: SYSTEM_PROMPT,
    tools: tools,
  });

  const history = [
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  for (let i = 0; i < 10; i++) {
    const response = await model.generateContent({
      contents: history,
    });

    const candidate = response.response.candidates[0];
    const parts = candidate.content.parts;

    history.push({
      role: "model",
      parts: parts,
    });

    const functionCallPart = parts.find((p) => p.functionCall);

    if (!functionCallPart) {
      return response.response.text();
    }

    const { name, args } = functionCallPart.functionCall;
    const toolResult = await executeTool(name, args);

    history.push({
      role: "user",
      parts: [
        {
          functionResponse: {
            name: name,
            response: { result: JSON.stringify(toolResult) },
          },
        },
      ],
    });
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
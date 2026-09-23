const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionsRouter = require("./routes/transactions");
const chatRouter = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", transactionsRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.json({ message: "FinAI Backend is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
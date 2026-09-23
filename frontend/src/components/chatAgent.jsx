import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage } from "../services/api";

function ChatAgent({ onTransactionChange }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Halo! Saya FinAI 👋 Asisten keuangan pribadi kamu. Kamu bisa minta saya untuk mencatat pemasukan, pengeluaran, melihat riwayat, atau mengecek saldo. Mau mulai dari mana?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const handleSendRef = useRef(null);

  // Auto scroll ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const message = typeof text === "string" ? text : input;
    if (!message.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMessage(message);
      const reply = res.data.reply;
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      onTransactionChange();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Maaf, terjadi kesalahan. Coba lagi ya!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onTransactionChange]);

  // Simpan handleSend terbaru ke ref
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // Setup Web Speech API — hanya sekali saat mount
  useEffect(() => {
     console.log("Cek SpeechRecognition support:", 
    "webkitSpeechRecognition" in window, 
    "SpeechRecognition" in window
  );

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("🎙️ Recognition started");
        setIsListening(true);
        };

        recognition.onend = () => {
        console.log("🛑 Recognition ended");
        setIsListening(false);
        };

        recognition.onerror = (e) => {
        console.error("❌ Recognition error:", e.error, e);
        setIsListening(false);
        };

      // Gunakan ref agar selalu pakai versi terbaru handleSend
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        // Panggil via ref supaya tidak stale closure
        handleSendRef.current(transcript);
      };

      recognitionRef.current = recognition;
      console.log("✅ Recognition instance dibuat:", recognitionRef.current);
  } else {
    console.log("❌ Browser tidak support SpeechRecognition");
    }
  }, []); // hanya sekali

  const handleMic = () => {
  if (!recognitionRef.current) return;

  if (isListening) {
    recognitionRef.current.stop();
  } else {
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("❌ Gagal start recognition:", err);
    }
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
          🤖
        </div>
        <div>
          <p className="font-semibold text-slate-700 text-sm">FinAI Agent</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Online
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-700 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border border-slate-200 rounded-xl p-2 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening ? "🎙️ Sedang mendengarkan..." : "Ketik pesan..."
          }
          disabled={isLoading || isListening}
          className="flex-1 text-sm outline-none px-2 text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
        />

        {/* Mic Button */}
        <button
          onClick={handleMic}
          disabled={isLoading || !recognitionRef.current}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          } disabled:opacity-40`}
          title={
            recognitionRef.current
              ? "Klik untuk bicara"
              : "Browser tidak mendukung voice"
          }
        >
          {isListening ? "⏹️" : "🎤"}
        </button>

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40"
        >
          ➤
        </button>
      </div>

      {/* Voice hint */}
      {isListening && (
        <p className="text-xs text-center text-red-500 mt-2 animate-pulse">
          🎙️ Sedang mendengarkan... klik ⏹️ untuk berhenti
        </p>
      )}
    </div>
  );
}

export default ChatAgent;
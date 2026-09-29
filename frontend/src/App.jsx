import { useState, useEffect } from "react";
import {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./services/api";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import ChatAgent from "./components/ChatAgent";
import TransactionForm from "./components/TransactionForm";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Bot,
  MessageCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

const CONTENT_CONTAINER_CLASS = "mx-auto max-w-7xl px-5 sm:px-8";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // State modal form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // State modal konfirmasi delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        getTransactions(),
        getSummary(),
      ]);
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Gagal fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Handle Tambah ──────────────────────────────────────
  const handleAdd = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  // ─── Handle Edit ────────────────────────────────────────
  const handleEdit = (transaction) => {
    setEditData(transaction);
    setIsFormOpen(true);
  };

  // ─── Handle Submit Form (Tambah / Edit) ─────────────────
  const handleSubmitForm = async (formData) => {
    if (editData) {
      await updateTransaction(editData.id, formData);
    } else {
      await createTransaction(formData);
    }
    await fetchData();
  };

  // ─── Handle Delete (buka konfirmasi) ────────────────────
  const handleDeleteClick = (transaction) => {
    setDeleteTarget(transaction);
  };

  // ─── Handle Konfirmasi Delete ────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      await fetchData();
    } catch (error) {
      console.error("Gagal hapus:", error);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f6f3ed]/90 py-4 backdrop-blur-xl">
        <div
          className={`${CONTENT_CONTAINER_CLASS} flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-900/15">
              <Wallet className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none tracking-tight">
                FinAI
              </h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                Money, made visible
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isChatOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsChatOpen((isOpen) => !isOpen)}
              aria-expanded={isChatOpen}
              aria-controls="ai-chat-panel"
            >
              {isChatOpen ? (
                <X className="size-3.5" />
              ) : (
                <MessageCircle className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {isChatOpen ? "Tutup AI" : "Buka AI"}
              </span>
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="size-3.5" /> Tambah
            </Button>
          </div>
        </div>
      </header>

      <main className={`${CONTENT_CONTAINER_CLASS} py-8 lg:py-10`}>
        {isLoading ? (
          <div className="flex min-h-100 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 animate-pulse items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <Wallet className="size-6" />
              </div>
              <p className="text-sm text-stone-500">
                Menyiapkan ringkasan keuangan...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  <Sparkles className="size-3.5" /> Overview
                </p>
                <h2 className="font-display max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Keuanganmu,{" "}
                  <span className="text-teal-700">lebih tenang</span> saat
                  terlihat jelas.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-stone-500">
                  Pantau arus uang, pahami kebiasaan belanja, dan ambil
                  keputusan berikutnya dengan lebih percaya diri.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500 shadow-sm md:flex">
                <span className="size-2 rounded-full bg-emerald-500" /> Data
                tersinkron
              </div>
            </section>

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="min-w-0 flex-1">
                <SummaryCards summary={summary} />

                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-stone-100 px-5 py-5 sm:px-6">
                    <div>
                      <h2 className="font-display font-semibold text-stone-900">
                        Riwayat transaksi
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">
                        {transactions.length} transaksi tercatat
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAdd}>
                      <Plus className="size-3.5" /> Tambah
                    </Button>
                  </div>
                  <TransactionTable
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </Card>
              </div>

              {isChatOpen && (
                <div id="ai-chat-panel" className="w-full lg:w-92.5">
                  <Card className="sticky top-24 flex h-[calc(100vh-140px)] min-h-130 flex-col overflow-hidden border-teal-900/10 bg-[#143f3b] text-white shadow-[0_20px_50px_rgba(20,63,59,0.18)]">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-teal-950">
                          <Bot className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="text-white">
                            FinAI assistant
                          </CardTitle>
                          <CardDescription className="text-sm text-white/70">
                            Catat transaksi dengan bahasa sehari-hari.
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-300" />
                        Online
                      </div>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 p-5">
                      <ChatAgent onTransactionChange={fetchData} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Form Tambah / Edit */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmitForm}
        editData={editData}
      />

      {/* Modal Konfirmasi Delete */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="size-5" />
              </div>
              <h3 className="font-display font-semibold text-stone-900 mb-1">
                Hapus Transaksi?
              </h3>
              <p className="text-sm leading-6 text-stone-500">
                Transaksi{" "}
                <span className="font-medium text-slate-600">
                  "{deleteTarget.description}"
                </span>{" "}
                akan dihapus permanen dan tidak bisa dikembalikan.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

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

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-none">
                FinAI
              </h1>
              <p className="text-xs text-slate-400">Personal Finance Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleAdd}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
            >
              ➕ Tambah Transaksi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-4xl mb-3 animate-bounce">💰</p>
              <p className="text-slate-400 text-sm">Memuat data...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Kiri: Dashboard */}
            <div className="flex-1">
              <SummaryCards summary={summary} />

              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-700">
                      Riwayat Transaksi
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {transactions.length} transaksi tercatat
                    </p>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ➕ Tambah
                  </button>
                </div>
                <TransactionTable
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              </div>
            </div>

            {/* Kanan: Chat Agent */}
            <div className="w-full lg:w-[360px]">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24 h-[calc(100vh-120px)] flex flex-col">
                <ChatAgent onTransactionChange={fetchData} />
              </div>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <p className="text-4xl mb-3">🗑️</p>
              <h3 className="font-semibold text-slate-700 mb-1">
                Hapus Transaksi?
              </h3>
              <p className="text-sm text-slate-400">
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
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-sm font-medium text-white transition-colors disabled:opacity-50"
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
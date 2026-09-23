import { useState, useEffect } from "react";

const CATEGORIES_INCOME = [
  "Gaji", "Freelance", "Bisnis", "Investasi", "Bonus", "Lainnya"
];

const CATEGORIES_EXPENSE = [
  "Makan", "Transport", "Belanja", "Kesehatan", "Pendidikan",
  "Hiburan", "Tagihan", "Perawatan", "Lainnya"
];

const defaultForm = {
  type: "expense",
  category: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

function TransactionForm({ isOpen, onClose, onSubmit, editData }) {
  const [form, setForm] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Isi form dengan data yang akan diedit
  useEffect(() => {
    if (editData) {
      setForm({
        type: editData.type,
        category: editData.category,
        amount: editData.amount,
        description: editData.description,
        date: editData.date,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.type) newErrors.type = "Tipe wajib dipilih";
    if (!form.category) newErrors.category = "Kategori wajib dipilih";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      newErrors.amount = "Nominal harus berupa angka lebih dari 0";
    if (!form.description.trim()) newErrors.description = "Keterangan wajib diisi";
    if (!form.date) newErrors.date = "Tanggal wajib diisi";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    // Reset kategori saat tipe berubah
    if (name === "type") {
      setForm((prev) => ({ ...prev, type: value, category: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        ...form,
        amount: parseInt(form.amount),
      });
      onClose();
    } catch (error) {
      console.error("Error submit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories =
    form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">
            {editData ? "✏️ Edit Transaksi" : "➕ Tambah Transaksi"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "type", value: "income" } })
                }
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === "income"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                📈 Pemasukan
              </button>
              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "type", value: "expense" } })
                }
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === "expense"
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                📉 Pengeluaran
              </button>
            </div>
            {errors.type && (
              <p className="text-xs text-rose-500 mt-1">{errors.type}</p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Kategori
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                errors.category ? "border-rose-300" : "border-slate-200"
              }`}
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                Rp
              </span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.amount ? "border-rose-300" : "border-slate-200"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Contoh: Makan siang di warteg"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                errors.description ? "border-rose-300" : "border-slate-200"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                errors.date ? "border-rose-300" : "border-slate-200"
              }`}
            />
            {errors.date && (
              <p className="text-xs text-rose-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                form.type === "income"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              } disabled:opacity-50`}
            >
              {isLoading ? "Menyimpan..." : editData ? "Simpan Perubahan" : "Tambah Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
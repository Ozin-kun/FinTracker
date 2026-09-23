const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

function TransactionTable({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">Belum ada transaksi. Mulai tambahkan melalui chat atau tombol tambah!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-slate-500 font-medium">ID</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Tipe</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Kategori</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Jumlah</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Keterangan</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Tanggal</th>
            <th className="text-center py-3 px-4 text-slate-500 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-4 text-slate-400">#{t.id}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    t.type === "income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {t.type === "income" ? "📈 Pemasukan" : "📉 Pengeluaran"}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-600 capitalize">{t.category}</td>
              <td
                className={`py-3 px-4 font-semibold ${
                  t.type === "income" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatRupiah(t.amount)}
              </td>
              <td className="py-3 px-4 text-slate-600">{t.description}</td>
              <td className="py-3 px-4 text-slate-400">{t.date}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(t)}
                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    title="Edit transaksi"
                  >
                    ✏️
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(t)}
                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                    title="Hapus transaksi"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatTanggal } from "../lib/utils";

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
      <div className="py-16 text-center text-stone-400">
        <p className="mb-3 text-3xl">∅</p>
        <p className="text-sm">
          Belum ada transaksi. Mulai tambahkan melalui chat atau tombol tambah!
        </p>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10)) ||
      b.id - a.id,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50/70">
            <th className="whitespace-nowrap py-3 pl-5 pr-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 sm:pl-6">
              Tipe
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Kategori
            </th>
            <th className="whitespace-nowrap px-4 py-3 pr-6 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 tabular-nums">
              Jumlah
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Keterangan
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Tanggal
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-stone-100 transition-colors hover:bg-teal-50/30"
            >
              <td className="py-3 pl-5 pr-4 sm:pl-6">
                <Badge variant={t.type}>
                  {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </Badge>
              </td>
              <td className="px-4 py-4 capitalize text-stone-600">
                {t.category}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-4 pr-6 text-right font-semibold tabular-nums ${
                  t.type === "income" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatRupiah(t.amount)}
              </td>
              <td className="max-w-45 truncate px-4 py-4 text-stone-600">
                {t.description}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-xs text-stone-400">
                {formatTanggal(t.date)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(t)}
                    className="flex size-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-teal-50 hover:text-teal-700"
                    title="Edit transaksi"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(t)}
                    className="flex size-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="size-3.5" />
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

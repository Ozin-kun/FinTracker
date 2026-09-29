import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Pemasukan",
      value: summary?.total_income || 0,
      icon: ArrowUpRight,
      bg: "bg-emerald-50/70",
      border: "border-emerald-100",
      text: "text-emerald-600",
      valueText: "text-emerald-700",
    },
    {
      label: "Total Pengeluaran",
      value: summary?.total_expense || 0,
      icon: ArrowDownLeft,
      bg: "bg-rose-50/70",
      border: "border-rose-100",
      text: "text-rose-600",
      valueText: "text-rose-700",
    },
    {
      label: "Saldo",
      value: summary?.balance || 0,
      icon: Wallet,
      bg: "bg-amber-50/80",
      border: "border-amber-100",
      text: "text-amber-700",
      valueText: "text-amber-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`${card.bg} ${card.border} shadow-none`}
        >
          <CardContent className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${card.text}`}>
              {card.label}
            </span>
            <span className={`flex size-9 items-center justify-center rounded-xl bg-white/70 ${card.text}`}><card.icon className="size-4" /></span>
          </div>
          <p className={`font-display text-2xl font-semibold ${card.valueText}`}>
            {formatRupiah(card.value)}
          </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SummaryCards;
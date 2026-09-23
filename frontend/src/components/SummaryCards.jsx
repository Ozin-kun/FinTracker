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
      icon: "📈",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      valueText: "text-emerald-700",
    },
    {
      label: "Total Pengeluaran",
      value: summary?.total_expense || 0,
      icon: "📉",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-600",
      valueText: "text-rose-700",
    },
    {
      label: "Saldo",
      value: summary?.balance || 0,
      icon: "💰",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      valueText: "text-blue-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 ${card.bg} ${card.border}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${card.text}`}>
              {card.label}
            </span>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${card.valueText}`}>
            {formatRupiah(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
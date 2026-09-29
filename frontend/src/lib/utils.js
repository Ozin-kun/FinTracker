import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatTanggal(value) {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  if (!y || !m || !d) return String(value);
  return `${Number(d)} ${BULAN[Number(m) - 1]} ${y}`;
}

import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", {
  variants: {
    variant: {
      income: "border-emerald-200 bg-emerald-50 text-emerald-700",
      expense: "border-rose-200 bg-rose-50 text-rose-700",
      neutral: "border-stone-200 bg-stone-100 text-stone-600",
    },
  },
  defaultVariants: { variant: "neutral" },
});

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge };
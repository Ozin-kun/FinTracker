import { cn } from "../../lib/utils";

function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(61,48,32,0.06)]", className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h2 className={cn("font-display text-lg font-semibold tracking-tight text-stone-900", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-stone-500", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
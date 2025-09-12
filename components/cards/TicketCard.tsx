// TicketCardOutline.tsx
"use client";

import { Card } from "@/components/ui/card";
import {
  LifeBuoy,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Ticket = {
  id: string | number;
  title: string;
  description: string;
  status: "open" | "closed";
  createdAt: string | number | Date;
};

const fmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const palette: Record<
  Ticket["status"],
  {
    chip: string;
    iconBg: string;
    iconFg: string;
    iconRing: string;
    dot: string;
    borderHover: string;
  }
> = {
  open: {
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    iconBg: "bg-sky-50",
    iconFg: "text-sky-600",
    iconRing: "ring-1 ring-sky-200",
    dot: "bg-sky-500",
    borderHover: "hover:border-sky-300",
  },
  closed: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    iconBg: "bg-emerald-50",
    iconFg: "text-emerald-600",
    iconRing: "ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    borderHover: "hover:border-emerald-300",
  },
};

export function TicketCardOutline({
  ticket,
  onClick,
  onReadMore,
}: {
  ticket: Ticket;
  onClick: (t: Ticket) => void;
  onReadMore?: (t: Ticket) => void;
}) {
  const colors = palette[ticket.status];

  return (
    <Card
      role="article"
      tabIndex={0}
      aria-label={`${ticket.title} — ${ticket.status}`}
      onClick={() => onClick(ticket)}
      className={[
        "group relative h-full rounded-xl bg-white/90",
        "border border-slate-200 shadow-sm transition-all duration-200",
        "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
        "dark:bg-zinc-900/70 dark:border-zinc-800 dark:hover:shadow-zinc-900/20",
        colors.borderHover,
      ].join(" ")}
    >
      {/* header */}
      <div className="flex items-center gap-3 p-4">
        <div
          className={`grid size-10 place-items-center rounded-full ${colors.iconBg} ${colors.iconRing} ${colors.iconFg}`}
        >
          {/* pick icon by status (support icon by default) */}
          {ticket.status === "open" ? (
            <AlertCircle className="h-5 w-5" />
          ) : ticket.status === "closed" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <LifeBuoy className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            {ticket.title}
          </h3>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-300">
            <Clock className="h-3.5 w-3.5" />
            <time>{fmt.format(new Date(ticket.createdAt))}</time>
          </div>
        </div>

        <span
          className={[
            "ms-auto hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]",
            colors.chip,
          ].join(" ")}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </span>
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-zinc-800" />

      <div className="p-4">
        <p className="text-sm leading-6 text-slate-600 line-clamp-3 dark:text-zinc-300">
          {ticket.description}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore?.(ticket);
          }}
          className="mt-3 inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          Read More
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div
        aria-hidden
        className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400"
      />
    </Card>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Brain, FileQuestion, LineChart, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Inicio", icon: Network, accent: "text-accent-blue" },
  { href: "/aprender", label: "Aprender", icon: BookOpen, accent: "text-accent-green" },
  { href: "/practicar", label: "Practicar", icon: Brain, accent: "text-accent-blue" },
  { href: "/examen", label: "Examen", icon: FileQuestion, accent: "text-accent-red" },
  { href: "/progreso", label: "Progreso", icon: LineChart, accent: "text-fg" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-bg-border bg-bg-subtle">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="px-5 py-7 border-b border-bg-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-md bg-bg-surface border border-bg-border flex items-center justify-center font-display text-fg text-sm font-bold group-hover:border-accent-blue transition-colors">
              T
            </div>
            <div className="leading-tight">
              <div className="font-display text-[13px] text-fg font-semibold tracking-tight">teoría de las</div>
              <div className="font-display text-[13px] text-fg-muted">comunicaciones</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {items.map(({ href, label, icon: Icon, accent }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors font-display",
                  active
                    ? "bg-bg-surface text-fg"
                    : "text-fg-muted hover:bg-bg-surface/50 hover:text-fg",
                )}
              >
                <Icon className={cn("size-4", active ? accent : "text-fg-subtle")} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-bg-border">
          <div className="text-[11px] font-mono text-fg-faint">
            <div>final · 2026</div>
            <div className="mt-0.5 text-fg-subtle">FCEN · UBA</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

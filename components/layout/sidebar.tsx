"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/permissions";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const groups = navForRole(role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.label && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>}
            <div className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-accent")}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />{label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-4 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground/70">Version v2.0</p>
        <p>© 2026 All rights reserved</p>
      </div>
    </aside>
  );
}

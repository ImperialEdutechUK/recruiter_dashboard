"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navForRole } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/permissions";

export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const groups = navForRole(role);

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-accent md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-card p-3 shadow-xl">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-4">
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.label && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>}
                  <div className="space-y-0.5">
                    {g.items.map(({ href, label, icon: Icon }) => {
                      const active = pathname === href || pathname.startsWith(href + "/");
                      return (
                        <Link key={href} href={href} onClick={() => setOpen(false)}
                          className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                            active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-accent")}>
                          <Icon className="h-4 w-4" />{label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

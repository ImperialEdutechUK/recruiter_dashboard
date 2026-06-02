import Link from "next/link";
import { Bell } from "lucide-react";
import { BrandLogos } from "./brand-logos";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import type { Role } from "@/lib/auth/permissions";

export function Header({ name, role, pendingCount }: { name: string; role: Role; pendingCount: number }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card px-4 sm:px-6">
      <MobileNav role={role} />
      <BrandLogos />
      <span className="hidden h-8 w-px bg-border md:block" />
      <h1 className="text-base font-bold tracking-tight sm:text-lg">Freelance Recruitment Tracker</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Link href="/review" className="relative rounded-full p-2 text-muted-foreground hover:bg-accent" aria-label="Pending reviews">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {pendingCount}
            </span>
          )}
        </Link>
        <span className="hidden h-8 w-px bg-border sm:block" />
        <UserMenu name={name} role={role} />
      </div>
    </header>
  );
}

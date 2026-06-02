"use client";
import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { ColoredAvatar } from "@/components/ui/colored-avatar";
import { signOut } from "@/app/(auth)/login/actions";

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-accent">
        <ColoredAvatar name={name} size={32} />
        <span className="hidden text-sm font-medium sm:block">{name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border bg-card p-1.5 card-shadow-lg">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <form action={signOut}>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

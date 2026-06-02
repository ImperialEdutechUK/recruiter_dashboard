"use client";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { updateUserAccess } from "@/app/(app)/settings/actions";
import type { Brand, Profile } from "@/types/database";

export function UserAccessRow({ user, brands, initialBrandIds }:
  { user: Profile; brands: Brand[]; initialBrandIds: string[] }) {
  const [role, setRole] = useState(user.role);
  const [brandIds, setBrandIds] = useState<string[]>(initialBrandIds);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function toggle(id: string) {
    setBrandIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }
  function save() {
    setSaved(false);
    start(async () => {
      await updateUserAccess(user.id, role, role === "manager" ? [] : brandIds);
      setSaved(true); setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <Avatar name={user.full_name} />
      <div className="min-w-[160px] flex-1">
        <p className="text-sm font-medium">{user.full_name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-36">
        <option value="manager">Manager</option>
        <option value="director">Director</option>
        <option value="academic">Academic</option>
      </Select>
      <div className="flex flex-wrap gap-2">
        {brands.map((b) => (
          <label key={b.id} className="flex items-center gap-1.5 text-xs" style={{ opacity: role === "manager" ? 0.4 : 1 }}>
            <input type="checkbox" disabled={role === "manager"} checked={role === "manager" || brandIds.includes(b.id)}
              onChange={() => toggle(b.id)} className="accent-primary" />
            {b.name}
          </label>
        ))}
      </div>
      <Button size="sm" variant={saved ? "success" : "outline"} disabled={pending} onClick={save}>
        {saved ? <><Check className="h-4 w-4" /> Saved</> : pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCandidate } from "@/lib/actions/candidates";
import { ROLE_TYPES, SUBJECT_AREAS, LEVELS } from "@/lib/constants/roles";
import type { Brand } from "@/types/database";

export function NewCandidateDialog({ brands, label = "New candidate" }: { brands: Brand[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createCandidate(formData);
      if (res?.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> {label}</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add candidate" className="max-w-xl">
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primary_brand_id">Primary brand *</Label>
              <Select id="primary_brand_id" name="primary_brand_id" required>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_type">Role type *</Label>
              <Select id="role_type" name="role_type" required>
                {ROLE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject_area">Subject area</Label>
              <Select id="subject_area" name="subject_area" defaultValue="">
                <option value="">—</option>
                {SUBJECT_AREAS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">Level</Label>
              <Select id="level" name="level" defaultValue="na">
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Also suitable for</Label>
            <div className="grid grid-cols-2 gap-1.5 rounded-md border p-3">
              {ROLE_TYPES.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="suitable_roles" value={r.value} className="accent-primary" />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Additional brands</Label>
            <div className="flex flex-wrap gap-3 rounded-md border p-3">
              {brands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="additional_brands" value={b.id} className="accent-primary" />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add candidate"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

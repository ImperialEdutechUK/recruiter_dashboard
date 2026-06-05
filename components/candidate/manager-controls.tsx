"use client";
import { useState, useTransition } from "react";
import { Pencil, Move } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { editCandidate, advanceStage } from "@/lib/actions/candidates";
import { ROLE_TYPES, SUBJECT_AREAS, LEVELS } from "@/lib/constants/roles";
import { STAGES } from "@/lib/constants/stages";
import type { Candidate, Brand } from "@/types/database";

export function ManagerControls({
  candidate: c,
  brands,
  extraBrandIds,
}: {
  candidate: Candidate;
  brands: Brand[];
  extraBrandIds: string[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<number>(c.current_stage);
  const [subject, setSubject] = useState<string>(c.subject_area ?? "");

  function onEdit(formData: FormData) {
    setErr(null);
    start(async () => {
      const res = await editCandidate(c.id, formData);
      if (res?.error) setErr(res.error);
      else setEditOpen(false);
    });
  }

  function onMove() {
    if (target === c.current_stage) return;
    setErr(null);
    start(async () => {
      const res = await advanceStage(c.id, target, "Stage changed by manager");
      if (res?.error) setErr(res.error);
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <p className="text-sm font-semibold">Manager controls</p>

      <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}>
        <Pencil className="h-4 w-4" /> Edit details
      </Button>

      <div className="space-y-1.5">
        <Label htmlFor="move_stage">Move to stage</Label>
        <div className="flex gap-2">
          <Select
            id="move_stage"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="flex-1"
          >
            {STAGES.map((s) => (
              <option key={s.n} value={s.n}>{s.n}. {s.name}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={onMove}
            disabled={pending || target === c.current_stage}
          >
            <Move className="h-4 w-4" /> Move
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can move a candidate to any stage, forwards or backwards. The change is logged in the Timeline.
        </p>
      </div>

      {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit candidate details" className="max-w-xl">
        <form action={onEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="e_full_name">Full name *</Label>
              <Input id="e_full_name" name="full_name" required defaultValue={c.full_name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_email">Email *</Label>
              <Input id="e_email" name="email" type="email" required defaultValue={c.email} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_phone">Phone</Label>
              <Input id="e_phone" name="phone" defaultValue={c.phone ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_primary_brand_id">Primary brand *</Label>
              <Select id="e_primary_brand_id" name="primary_brand_id" required defaultValue={c.primary_brand_id}>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_role_type">Role type *</Label>
              <Select id="e_role_type" name="role_type" required defaultValue={c.role_type}>
                {ROLE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_subject_area">Subject area</Label>
              <Select id="e_subject_area" name="subject_area" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">—</option>
                {SUBJECT_AREAS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e_level">Level</Label>
              <Select id="e_level" name="level" defaultValue={c.level ?? "na"}>
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </Select>
            </div>
          </div>

          {subject === "other" && (
            <div className="space-y-1.5">
              <Label htmlFor="e_subject_other">Specify subject area *</Label>
              <Input id="e_subject_other" name="subject_other" required defaultValue={c.subject_other ?? ""} placeholder="e.g. Aviation Management" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Also suitable for</Label>
            <div className="grid grid-cols-2 gap-1.5 rounded-md border p-3">
              {ROLE_TYPES.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="suitable_roles"
                    value={r.value}
                    defaultChecked={c.suitable_roles?.includes(r.value)}
                    className="accent-primary"
                  />
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
                  <input
                    type="checkbox"
                    name="additional_brands"
                    value={b.id}
                    defaultChecked={extraBrandIds.includes(b.id)}
                    className="accent-primary"
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

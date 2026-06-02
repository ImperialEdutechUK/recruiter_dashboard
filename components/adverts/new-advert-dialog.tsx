"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAdvert } from "@/lib/actions/candidates";
import { ROLE_TYPES } from "@/lib/constants/roles";
import type { Brand } from "@/types/database";

export function NewAdvertDialog({ brands }: { brands: Brand[] }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setErr(null);
    start(async () => {
      const res = await createAdvert(formData);
      if (res?.error) setErr(res.error);
      else { setOpen(false); router.refresh(); }
    });
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New advert</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Create job advert" className="max-w-xl">
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. Health & Social Care Assessor (Freelance)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand_id">Brand *</Label>
              <Select id="brand_id" name="brand_id" required>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_type">Role *</Label>
              <Select id="role_type" name="role_type" required>
                {ROLE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="indeed_job_id">Indeed Job ID</Label>
            <Input id="indeed_job_id" name="indeed_job_id" placeholder="Reference from Indeed posting" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Advert text</Label>
            <Textarea id="body" name="body" className="min-h-[120px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
            </Select>
          </div>
          {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Create advert"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateAdvert, deleteAdvert } from "@/lib/actions/candidates";
import { ROLE_TYPES } from "@/lib/constants/roles";
import type { Advert, Brand } from "@/types/database";

export function EditAdvertDialog({
  advert,
  brands,
  onClose,
}: {
  advert: Advert;
  brands: Brand[];
  onClose: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setErr(null);
    start(async () => {
      const res = await updateAdvert(advert.id, formData);
      if (res?.error) setErr(res.error);
      else { onClose(); router.refresh(); }
    });
  }

  function onDelete() {
    setErr(null);
    start(async () => {
      const res = await deleteAdvert(advert.id);
      if (res?.error) setErr(res.error);
      else { onClose(); router.refresh(); }
    });
  }

  return (
    <Dialog open={true} onClose={onClose} title="Edit job advert" className="max-w-xl">
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="e_title">Title *</Label>
          <Input id="e_title" name="title" required defaultValue={advert.title} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="e_brand_id">Brand *</Label>
            <Select id="e_brand_id" name="brand_id" required defaultValue={advert.brand_id}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e_role_type">Role *</Label>
            <Select id="e_role_type" name="role_type" required defaultValue={advert.role_type}>
              {ROLE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e_indeed_job_id">Indeed Job ID</Label>
          <Input
            id="e_indeed_job_id"
            name="indeed_job_id"
            defaultValue={advert.indeed_job_id ?? ""}
            placeholder="Reference from Indeed posting"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e_body">Advert text</Label>
          <Textarea id="e_body" name="body" className="min-h-[120px]" defaultValue={advert.body ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e_status">Status</Label>
          <Select id="e_status" name="status" defaultValue={advert.status}>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
          </Select>
        </div>
        {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
        <div className="flex items-center justify-between gap-2 pt-1">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Delete this advert?</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
              <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
                {pending ? "Deleting…" : "Yes, delete"}
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

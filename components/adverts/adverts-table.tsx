"use client";
import { useState } from "react";
import { BrandPill } from "@/components/brand/brand-pill";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils";
import { EditAdvertDialog } from "./edit-advert-dialog";
import type { Advert, Brand } from "@/types/database";

export function AdvertsTable({
  adverts,
  brands,
}: {
  adverts: Advert[];
  brands: Brand[];
}) {
  const [editing, setEditing] = useState<Advert | null>(null);
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b]));

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Title</th>
            <th className="px-4 py-2.5 font-medium">Brand</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Indeed ID</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {adverts.map((a) => {
            const b = brandMap[a.brand_id];
            return (
              <tr
                key={a.id}
                onClick={() => setEditing(a)}
                className="cursor-pointer border-b last:border-0 transition hover:bg-muted/40"
              >
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3">{b && <BrandPill name={b.name} color={b.color} />}</td>
                <td className="px-4 py-3">{roleLabel(a.role_type)}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.indeed_job_id ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={a.status === "posted" ? "success" : "muted"}>{a.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(a.created_at)}</td>
              </tr>
            );
          })}
          {adverts.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No adverts yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editing && (
        <EditAdvertDialog advert={editing} brands={brands} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

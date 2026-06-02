"use client";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitDecision } from "@/lib/actions/candidates";

export function DecisionForm({ candidateId }: { candidateId: string }) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function decide(decision: "approved" | "rejected") {
    setError(null);
    start(async () => {
      const res = await submitDecision(candidateId, decision, notes);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="decision-notes">Comments (optional)</Label>
        <Textarea id="decision-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes on your decision…" />
      </div>
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button variant="success" disabled={pending} onClick={() => decide("approved")} className="flex-1">
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button variant="destructive" disabled={pending} onClick={() => decide("rejected")} className="flex-1">
          <X className="h-4 w-4" /> Reject
        </Button>
      </div>
    </div>
  );
}

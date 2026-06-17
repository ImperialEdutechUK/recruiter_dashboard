"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>;
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, null as { error?: string } | null);
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Recruitment Tracker</h1>
            <p className="text-sm text-muted-foreground">South London College · Aspirex · Global Edulink</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@southlondoncollege.ac.uk" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            {state?.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
            )}
            <SubmitButton />
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Contact your administrator for access
        </p>
        <div className="mt-5 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import {
  GraduationCap, ArrowRight, ShieldCheck, ListChecks, History, LayoutDashboard,
  UserCog, UserCheck, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/constants/stages";

export const dynamic = "force-dynamic";

const BRANDS: [string, string][] = [
  ["South London College", "#0D1B2A"],
  ["Aspirex", "#B34700"],
  ["Global Edulink", "#1B6B2E"],
];

const FEATURES: { icon: any; title: string; desc: string }[] = [
  { icon: ListChecks, title: "One pipeline, ten stages", desc: "Move every candidate from Applications Received through to Academic Handover, with nothing slipping through the cracks." },
  { icon: ShieldCheck, title: "Role-based access", desc: "Managers run the pipeline, directors approve or reject, and academics handle induction — each sees exactly what they need." },
  { icon: LayoutDashboard, title: "Live dashboard", desc: "See candidate counts at every stage, pending reviews and conversion at a glance, across all three brands." },
  { icon: History, title: "Complete audit trail", desc: "Every stage change and decision is recorded with who made it and when — fully traceable." },
];

const ROLES: { icon: any; name: string; desc: string }[] = [
  { icon: UserCog, name: "Manager", desc: "Runs the full pipeline across all brands — adds candidates, records interviews, manages documents and contracts." },
  { icon: UserCheck, name: "Director", desc: "Reviews candidates at the decision stage within their brand and approves or rejects with comments." },
  { icon: Users, name: "Academic", desc: "Handles onboarding for contracted educators and works through each induction checklist." },
];

export default async function Landing() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const loggedIn = !!user;
  const ctaHref = loggedIn ? "/dashboard" : "/login";

  return (
    <main className="min-h-screen bg-white text-foreground">
      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .rise { animation: riseIn .6s cubic-bezier(.16,1,.3,1) both; }
        .rise-2 { animation-delay: .08s; } .rise-3 { animation-delay: .16s; } .rise-4 { animation-delay: .24s; }
        @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight">Recruitment Tracker</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pipeline" className="hover:text-foreground">Pipeline</a>
            <a href="#roles" className="hover:text-foreground">Roles</a>
          </nav>
          <Link href={loggedIn ? "/dashboard" : "/login"}>
            <Button variant={loggedIn ? "default" : "outline"}>{loggedIn ? "Go to dashboard" : "Sign in"}</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(37,99,235,.08), transparent 70%)" }}
        />
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-16 text-center sm:pt-24">
          <span className="rise inline-flex items-center rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Recruitment operations · three brands · one platform
          </span>
          <h1 className="rise rise-2 mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            From first application to signed contract — one pipeline.
          </h1>
          <p className="rise rise-3 mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            The recruitment tracker for South London College, Aspirex and Global Edulink. Manage every
            freelance tutor, assessor, moderator and presenter through ten clear stages — with role-based
            access and a complete audit trail.
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={ctaHref}>
              <Button className="h-11 px-6 text-base">{loggedIn ? "Enter the app" : "Sign in to your account"} <ArrowRight className="h-5 w-5" /></Button>
            </Link>
            <a href="#pipeline"><Button variant="outline" className="h-11 px-6 text-base">See how it works</Button></a>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="card-shadow-lg rounded-3xl border bg-card p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold">The pipeline</p>
              <p className="text-xs text-muted-foreground">10 stages</p>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-start">
                {STAGES.map((s, i) => (
                  <div key={s.n} className="flex items-start">
                    <div className="flex w-[108px] flex-col items-center px-1 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: s.color }}>{s.n}</span>
                      <span className="mt-2 text-[11px] font-medium leading-tight text-muted-foreground">{s.short}</span>
                    </div>
                    {i < STAGES.length - 1 && <div className="mt-5 h-0.5 w-7 rounded-full" style={{ backgroundColor: `${STAGES[i + 1].color}55` }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">Built for the group's three brands</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS.map(([name, color]) => (
              <span key={name} className="text-base font-bold tracking-tight" style={{ color }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Everything the recruitment process needs</h2>
          <p className="mt-3 text-muted-foreground">A single source of truth for freelance hiring — no spreadsheets, no lost candidates.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-shadow rounded-2xl border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pipeline" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Ten stages, start to finish</h2>
            <p className="mt-3 text-muted-foreground">Each candidate moves through the same clear sequence. Checklists and induction tasks are created automatically at the right stage.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.n} className="flex gap-3.5 rounded-2xl border bg-card p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: s.color }}>{s.n}</span>
                <div>
                  <p className="font-semibold leading-tight">{s.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">The right access for every team</h2>
          <p className="mt-3 text-muted-foreground">Access is enforced at the database, not just hidden in the interface.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r.name} className="card-shadow rounded-2xl border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <r.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-lg font-semibold">{r.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight">Ready to pick up where you left off?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Sign in to manage your recruitment pipeline across all three brands.</p>
          <div className="mt-7">
            <Link href={ctaHref}>
              <Button variant="outline" className="h-11 border-white/30 bg-white px-6 text-base text-primary hover:bg-white/90">
                {loggedIn ? "Enter the app" : "Sign in"} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">Recruitment Tracker</span>
          </div>
          <p>© {new Date().getFullYear()} South London College · Aspirex · Global Edulink</p>
        </div>
      </footer>
    </main>
  );
}

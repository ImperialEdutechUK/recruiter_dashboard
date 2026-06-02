// Text wordmarks as placeholders. Replace with real logo files in /public
// (e.g. <Image src="/logos/slc.svg" .../>) when you have them.
export function BrandLogos() {
  return (
    <div className="hidden items-center gap-3 sm:flex">
      <span className="text-[11px] font-extrabold leading-[1.05] tracking-tight text-slc">
        SOUTH<br />LONDON<br />COLLEGE
      </span>
      <span className="h-8 w-px bg-border" />
      <span className="text-sm font-extrabold lowercase tracking-tight text-aspirex">aspirex</span>
      <span className="h-8 w-px bg-border" />
      <span className="text-[11px] font-extrabold leading-tight tracking-tight text-edulink">
        GLOBAL<br />EDULINK
      </span>
    </div>
  );
}

type Sponsor = {
  label: string;
  logoSrc?: string;
};

type Props = {
  showSponsors?: boolean;
  sponsors?: Sponsor[];
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { label: "Apex Sports" },
  { label: "Nimbus Media" },
  { label: "Orbit Energy" },
  { label: "Pulse Telecom" },
  { label: "Vertex Foods" },
  { label: "Nova Finance" },
];

export default function Footer({
  showSponsors = false,
  sponsors = DEFAULT_SPONSORS,
}: Props) {
  const items = (sponsors || []).filter((s) => s?.label || s?.logoSrc);
  const track = items.length ? items : DEFAULT_SPONSORS;
  const repeats = 30;
  const repeatedTrack = Array.from({ length: repeats }, () => track).flat();

  return (
    <div className="ticker-shell">
      {showSponsors && (
        <div className="w-full px-4 pt-4 md:px-6">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-14 bg-white/10 md:w-36" />
            
            <div className="h-px w-14 bg-white/10 md:w-36" />
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/55 shadow-[0_22px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950/90 to-transparent" />

            <div
              className="sponsor-marquee flex w-max items-center gap-10 py-6 pl-6 pr-6 md:gap-14 md:py-7"
              style={
                {
                  ["--sponsor-shift" as any]: `-${100 / repeats}%`,
                } as React.CSSProperties
              }
            >
              {repeatedTrack.map((sponsor, idx) => (
                <div
                  key={`${sponsor.label || sponsor.logoSrc}-${idx}`}
                  className="inline-flex h-16 shrink-0 items-center justify-center md:h-20"
                >
                  {sponsor.logoSrc ? (
                    <img
                      src={sponsor.logoSrc}
                      alt={sponsor.label || "Sponsor"}
                      className="h-12 w-auto max-w-[260px] object-contain opacity-90 drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] transition-opacity duration-200 hover:opacity-100 md:h-14 md:max-w-[320px]"
                      loading="lazy"
                    />
                  ) : (
                    <span className="whitespace-nowrap text-base font-semibold text-white/80 md:text-lg">
                      {sponsor.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 pb-3 pt-2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 md:px-6">
        Mosaic Broadcast System | CheerIT
      </div>
    </div>
  );
}

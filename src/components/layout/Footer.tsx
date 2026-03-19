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
    /*
     * FIX: Removed hardcoded large heights. The shell now only takes the
     * space it needs. Previously py-6/py-7 + h-16/h-20 items = ~140px.
     * Now py-2 + h-10 items = ~56px total for the ticker.
     */
    <div className="ticker-shell shrink-0">
      {showSponsors && (
        <div className="w-full px-4 pt-2 md:px-6">
          <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-slate-950/55 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {/* Edge fade overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-950/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-950/90 to-transparent" />

            <div
              className="sponsor-marquee flex w-max items-center gap-6 py-2 pl-4 pr-4 md:gap-10"
              style={
                {
                  ["--sponsor-shift" as any]: `-${100 / repeats}%`,
                } as React.CSSProperties
              }
            >
              {repeatedTrack.map((sponsor, idx) => (
                <div
                  key={`${sponsor.label || sponsor.logoSrc}-${idx}`}
                  /*
                   * FIX: h-10 (was h-16 md:h-20). This reduces ticker
                   * height from ~128px to ~56px, giving videos more room.
                   */
                  className="inline-flex h-10 shrink-0 items-center justify-center"
                >
                  {sponsor.logoSrc ? (
                    <img
                      src={sponsor.logoSrc}
                      alt={sponsor.label || "Sponsor"}
                      /*
                       * FIX: h-7 (was h-12 md:h-14)
                       */
                      className="h-7 w-auto max-w-[140px] object-contain opacity-90 transition-opacity duration-200 hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <span className="whitespace-nowrap text-sm font-semibold text-white/80">
                      {sponsor.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom credit line */}
      <div className="w-full px-4 pb-2 pt-1 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 md:px-6">
        Mosaic Broadcast System | CheerIT
      </div>
    </div>
  );
}
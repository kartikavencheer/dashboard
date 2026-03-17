// type Props = {
//   events: any[];
//   teams: any[];
//   filters: any;
//   onChange: (k: string, v: string) => void;
// };

// export default function FilterBar({ events, teams, filters, onChange }: Props) {
//   return (
//     <div className="flex gap-3 bg-slate-800/60 backdrop-blur p-4 rounded-xl shadow flex-wrap">
//       <select
//         value={filters.eventId}
//         onChange={(e) => onChange("eventId", e.target.value)}
//         className="bg-slate-700 px-3 py-2 rounded"
//       >
//         <option value="">Select Event</option>
//         {events.map((e) => (
//           <option key={e.event_id} value={e.event_id}>
//             {e.event_name}
//           </option>
//         ))}
//       </select>

//       <select
//         value={filters.teamId}
//         onChange={(e) => onChange("teamId", e.target.value)}
//         className="bg-slate-700 px-3 py-2 rounded"
//       >
//         <option value="">All Teams</option>
//         {teams.map((t) => (
//           <option key={t.team_id} value={t.team_id}>
//             {t.team.name}
//           </option>
//         ))}
//       </select>

//       <select
//         value={filters.status}
//         onChange={(e) => onChange("status", e.target.value)}
//         className="bg-slate-700 px-3 py-2 rounded"
//       >
//         <option value="">Status</option>
//         <option value="PENDING">Pending</option>
//         <option value="APPROVED">Approved</option>
//       </select>

//       <input
//         value={filters.search}
//         onChange={(e) => onChange("search", e.target.value)}
//         placeholder="Search..."
//         className="bg-slate-700 px-3 py-2 rounded flex-1"
//       />
//     </div>
//   );
// }
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Tags,
  Users2,
  X,
} from "lucide-react";

type Category = {
  category_id: string;
  label: string;
};

type Event = {
  event_id: string;
  event_name: string;
};

type Team = {
  team_id: string;
  team: {
    name: string;
  };
};

type Filters = {
  eventId: string;
  teamId: string;
  status: string;
  categoryId: string;
  search: string;
};

type Props = {
  events: Event[];
  teams: Team[];
  categories: Category[];
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
};

export default function FilterBar({
  events,
  teams,
  categories,
  filters,
  onChange,
}: Props) {
  const hasAnyFilter =
    Boolean(filters.eventId) ||
    Boolean(filters.teamId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.status) ||
    Boolean(filters.search);

  const resetFilters = () => {
    onChange("eventId", "");
    onChange("teamId", "");
    onChange("categoryId", "");
    onChange("status", "");
    onChange("search", "");
  };

  return (
    <div className="glass-panel rounded-[28px] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <SlidersHorizontal size={18} className="text-cyan-100" />
            </div>
            <div>
              <div className="section-title">Content Filters</div>
              <div className="section-subtitle">
                Refine submissions by event, squad, category, and approval state.
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="hero-chip">Live Moderation</div>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasAnyFilter}
            className="secondary-button px-4 py-3 disabled:opacity-30"
            aria-label="Reset filters"
          >
            <X size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <div className="metric-label mb-1 flex items-center gap-2">
            <CalendarDays size={14} className="text-white/60" />
            Event
          </div>
          <div className="relative">
            <select
              value={filters.eventId}
              onChange={(e) => {
                onChange("eventId", e.target.value);
                onChange("categoryId", ""); // reset category when event changes
              }}
              className="form-control w-full appearance-none pl-11 pr-11"
            >
              <option value="">Select Event</option>
              {events.map((e) => (
                <option key={e.event_id} value={e.event_id}>
                  {e.event_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
              <CalendarDays size={16} />
            </div>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="metric-label mb-1 flex items-center gap-2">
            <Users2 size={14} className="text-white/60" />
            Team
          </div>
          <div className="relative">
            <select
              value={filters.teamId}
              onChange={(e) => onChange("teamId", e.target.value)}
              className="form-control w-full appearance-none pl-11 pr-11"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t.team_id} value={t.team_id}>
                  {t.team.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
              <Users2 size={16} />
            </div>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="metric-label mb-1 flex items-center gap-2">
            <Tags size={14} className="text-white/60" />
            Category
          </div>
          <div className="relative">
            <select
              value={filters.categoryId}
              onChange={(e) => onChange("categoryId", e.target.value)}
              disabled={!filters.eventId}
              className="form-control w-full appearance-none pl-11 pr-11 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
              <Tags size={16} />
            </div>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="metric-label mb-1 flex items-center gap-2">
            <BadgeCheck size={14} className="text-white/60" />
            Status
          </div>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="form-control w-full appearance-none pl-11 pr-11"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
              <BadgeCheck size={16} />
            </div>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 xl:col-span-12">
          <div className="metric-label mb-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-white/60" />
              Search
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasAnyFilter}
              className="secondary-button flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-30 md:hidden"
            >
              <X size={14} />
              Reset
            </button>
          </div>
          <div className="relative">
            <input
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
              placeholder="Search by fan name, team, or clip..."
              className="form-control w-full pl-11 pr-4"
            />
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
              <Search size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import SideBySideView from "@/components/ranking/SideBySideView";
import ActivityFeed from "@/components/ranking/ActivityFeed";
import { USERS, RANKINGS_2025, ACTIVITY_FEED } from "@/lib/mock-data";
import { CURRENT_YEAR, YEARS } from "@/lib/constants";

export default function HomePage() {
  const displayYear = YEARS[0];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase">
            RTVG{" "}
            <span className="text-amber-500">Rankings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light">
            The definitive record of our television journey
          </p>

          {/* Year Quick Links */}
          <div className="flex gap-3 justify-center mt-8">
            {YEARS.map((year) => (
              <Link
                key={year}
                href={`/${year}`}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  year === displayYear
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Rankings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tight">
                {displayYear} Rankings
              </h2>
              <div className="h-1 w-20 bg-amber-500 rounded-full hidden sm:block" />
            </div>
            <SideBySideView
              rankings={RANKINGS_2025}
              users={USERS}
              year={displayYear}
              limit={10}
            />
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">
              Recent Activity
            </h2>
            <ActivityFeed events={ACTIVITY_FEED} limit={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

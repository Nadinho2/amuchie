import Link from "next/link";
import { EzinwaHero } from "@/components/ezinwa/ezinwa-hero";
import { BecomeAmbassadorShareButton } from "@/components/share/become-ambassador-share-button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, HandHeart, Landmark, Sparkles, Target, Users } from "lucide-react";

const achievements = [
  "First Class in Industrial Chemistry (University of Benin).",
  "MSc in Corporate Governance (United Kingdom).",
  "Fellow of the Institute of Chartered Accountants of Nigeria (ICAN).",
  "Over 23 years of banking leadership across top financial institutions.",
  "Former Group CFO at Zenith Bank; now Executive Director and Chief Operations & Information Officer at Fidelity Bank.",
  "Sustained humanitarian interventions through the Goodlight Foundation.",
];

const visionPillars = [
  {
    icon: Landmark,
    title: "Financial Prudence",
    body: "Disciplined budgeting, responsible debt culture, and transparent public spending.",
  },
  {
    icon: Sparkles,
    title: "Digital Transformation",
    body: "Smart government systems, digital records, and faster public service delivery.",
  },
  {
    icon: Users,
    title: "Youth Empowerment",
    body: "Skills, enterprise support, and pathways to productive employment across LGAs.",
  },
  {
    icon: Target,
    title: "Transparent Governance",
    body: "Accountability, measurable outcomes, and citizen-centered leadership.",
  },
];

const gallery = [
  "/images/ezinwa-gallery-1.png",
  "/images/ezinwa-gallery-2.png",
  "/images/ezinwa-gallery-3.png",
  "/images/ezinwa-gallery-4.png",
  "/images/ezinwa-gallery-5.png",
  "/images/ezinwa-gallery-6.png",
];

export default function EzinwaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <EzinwaHero />

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 backdrop-blur lg:col-span-2 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">About Me</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">A life built on service, discipline, and results</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            Sir Stanley Chiedoziem Amuchie, widely known as Ezinwa, combines high-level corporate
            competence with proven humanitarian commitment. He graduated with a First Class degree in
            Industrial Chemistry from the University of Benin and later earned an MSc in Corporate
            Governance in the United Kingdom. He is a Fellow of ICAN and has spent over 23 years in
            strategic banking leadership.
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            His executive journey includes serving as Group Chief Financial Officer at Zenith Bank and now
            as Executive Director and Chief Operations & Information Officer at Fidelity Bank. Beyond the
            boardroom, he has consistently funded and supported people-centered interventions through the
            Goodlight Foundation, from youth capacity development to food relief and community support.
          </p>
        </article>

        <aside className="rounded-3xl border border-amber-300/20 bg-gradient-to-b from-amber-300/10 to-zinc-900/40 p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-white">Impact Snapshot</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-200">
            <p className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
              Youth development initiatives reaching communities across Imo State LGAs.
            </p>
            <p className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
              Rice and food support interventions at yuletide and critical community moments.
            </p>
            <p className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
              Grassroots partnership with cultural and civic institutions, including Iriji Mbaise.
            </p>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 backdrop-blur sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Political Vision</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">Repositioning Imo for inclusive prosperity</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visionPillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-zinc-700 bg-zinc-950/35 p-4">
              <pillar.icon className="mb-2 h-5 w-5 text-amber-300" />
              <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
              <p className="mt-1 text-xs text-zinc-300">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 backdrop-blur sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Key Achievements</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">Professional excellence, community credibility</h2>
        <ul className="mt-4 grid gap-2">
          {achievements.map((item) => (
            <li key={item} className="rounded-xl border border-zinc-700 bg-zinc-950/35 px-4 py-3 text-sm text-zinc-200">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Gallery</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">Moments from service and impact</h2>
          </div>
          <Badge className="border-amber-300/40 bg-amber-300/10 text-amber-200">Live feed-ready</Badge>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/35"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Sir Stanley community engagement"
                className="h-64 w-full bg-zinc-900 object-contain p-1"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-300/25 bg-gradient-to-r from-emerald-900/50 via-zinc-900/60 to-amber-900/35 p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-3 lg:items-center">
          <div className="space-y-2 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Call to Action</p>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Join the Amuchie Ambassadors</h2>
            <p className="text-sm text-zinc-200">
              Stand with a vision rooted in competence, transparency, and measurable human impact.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 py-3 text-sm font-bold text-zinc-900"
            >
              Join Amuchie Ambassadors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <BecomeAmbassadorShareButton />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
          <Building2 className="h-5 w-5 text-amber-300" />
          <p className="mt-2 text-lg font-extrabold text-white">23+ Years</p>
          <p className="text-xs text-zinc-300">Executive banking leadership</p>
        </div>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
          <Users className="h-5 w-5 text-amber-300" />
          <p className="mt-2 text-lg font-extrabold text-white">27 LGAs</p>
          <p className="text-xs text-zinc-300">Community-focused outreach footprint</p>
        </div>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
          <HandHeart className="h-5 w-5 text-amber-300" />
          <p className="mt-2 text-lg font-extrabold text-white">Humanity First</p>
          <p className="text-xs text-zinc-300">Goodlight Foundation social interventions</p>
        </div>
      </section>
    </main>
  );
}


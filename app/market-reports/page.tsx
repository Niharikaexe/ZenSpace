import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { reportsBySection } from "@/lib/market-reports-data"

export const metadata: Metadata = {
  title: "Market Reports — India Mental Health Index",
  description:
    "Six research reports on mental health in India: the treatment gap, suicide, workplace burnout, disclosure barriers, urban access, and rural exclusion. Aggregated from WHO, NIMHANS, Lancet, and Deloitte.",
  openGraph: {
    title: "ZenSpace Market Reports — India Mental Health Index",
    description:
      "Six research reports on mental health in India. Treatment gap, workplace burnout, regional access.",
  },
  alternates: {
    canonical: "https://zenspace.in/market-reports",
  },
}

const nationalStats = [
  { figure: "197M", label: "Indians with a mental health condition", source: "Lancet Psychiatry, 2017" },
  { figure: "83%", label: "Treatment gap — needs care, receives none", source: "WHO, 2020" },
  { figure: "0.3", label: "Psychiatrists per 100K (recommended: 3)", source: "NMHS, 2016" },
  { figure: "₹2,443", label: "Per-capita mental health expenditure per year", source: "WHO, 2020" },
]

const workplaceStats = [
  { figure: "62%", label: "Indian professionals with significant work stress", source: "Deloitte, 2022" },
  { figure: "47%", label: "Say their workplace does nothing about mental health", source: "Deloitte, 2022" },
  { figure: "80%", label: "Would not disclose mental illness to employer", source: "Economic Times, 2023" },
  { figure: "38%", label: "Of Gen Z professionals frequently burned out", source: "Deloitte, 2023" },
]

const regionalStats = [
  { region: "Metro cities", access: "Moderate", stigma: "Declining", note: "Supply concentrated, cost excludes majority" },
  { region: "Tier 2 cities", access: "Limited", stigma: "Moderate", note: "Growing private sector, public gaps remain" },
  { region: "Tier 3 & towns", access: "Very limited", stigma: "High", note: "Sparse workforce, few public services" },
  { region: "Rural India", access: "Negligible", stigma: "Very high", note: "96.7% treatment gap — near-total absence" },
]

export default function MarketReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#233551] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7EC0B7] bg-[#7EC0B7]/15 px-4 py-2 rounded-full mb-6">
            Market Reports
          </span>
          <h1
            className="text-4xl md:text-5xl font-black text-white leading-tight mb-5"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            India Mental Health Index
          </h1>
          <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
            Six reports on how mental health works — and doesn&apos;t — in India. Numbers from WHO, NIMHANS, Lancet Psychiatry, and Deloitte. Each report goes deeper into one specific dimension of the problem.
          </p>
          <p className="mt-4 text-white/30 text-xs">
            Aggregated from published research. Updated annually. Each report includes key metrics, findings, and analysis.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-14 md:py-20 space-y-20">

        {/* ── NATIONAL PICTURE ── */}
        <section>
          <div className="mb-8">
            <h2
              className="text-2xl font-black text-[#233551] mb-2"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              The national picture
            </h2>
            <p className="text-[#233551]/50 text-sm">
              How big the gap is between who needs support and who gets it.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {nationalStats.map((s) => (
              <div key={s.figure} className="border border-slate-100 rounded-2xl p-5 bg-[#F7FAFA]">
                <p className="text-3xl font-black text-[#3D8A80] mb-1" style={{ fontFamily: "var(--font-lato)" }}>
                  {s.figure}
                </p>
                <p className="text-[#233551] font-semibold text-xs leading-snug mb-1">{s.label}</p>
                <p className="text-[#233551]/35 text-xs">{s.source}</p>
              </div>
            ))}
          </div>

          {/* Report cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {reportsBySection.national.map((r) => (
              <Link
                key={r.slug}
                href={`/market-reports/${r.slug}`}
                className="group block border border-slate-100 rounded-2xl p-6 hover:border-[#3D8A80]/30 hover:shadow-md hover:shadow-[#3D8A80]/10 transition-all duration-200"
              >
                <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-wide">Report</span>
                <h3
                  className="mt-2 font-black text-[#233551] group-hover:text-[#3D8A80] transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[#233551]/50 leading-snug">{r.subtitle}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                  {r.keyStats.slice(0, 3).map((s, i) => (
                    <div key={i}>
                      <p className="text-xl font-black text-[#3D8A80]" style={{ fontFamily: "var(--font-lato)" }}>
                        {s.figure}
                      </p>
                      <p className="text-xs text-[#233551]/40 leading-tight mt-0.5 line-clamp-2">{s.label}</p>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-block text-xs font-bold text-[#3D8A80] group-hover:underline">
                  Read full report — {r.findings.length} findings →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── WORKPLACE MENTAL HEALTH ── */}
        <section>
          <div className="mb-8">
            <h2
              className="text-2xl font-black text-[#233551] mb-2"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Workplace mental health
            </h2>
            <p className="text-[#233551]/50 text-sm">
              Most professionals are managing more than anyone at work knows about.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {workplaceStats.map((s) => (
              <div key={s.figure} className="border border-slate-100 rounded-2xl p-5">
                <p className="text-3xl font-black text-[#E8926A] mb-1" style={{ fontFamily: "var(--font-lato)" }}>
                  {s.figure}
                </p>
                <p className="text-[#233551] font-semibold text-xs leading-snug mb-1">{s.label}</p>
                <p className="text-[#233551]/35 text-xs">{s.source}</p>
              </div>
            ))}
          </div>

          {/* Report cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {reportsBySection.workplace.map((r) => (
              <Link
                key={r.slug}
                href={`/market-reports/${r.slug}`}
                className="group block border border-slate-100 rounded-2xl p-6 hover:border-[#E8926A]/30 hover:shadow-md hover:shadow-[#E8926A]/10 transition-all duration-200"
              >
                <span className="text-xs font-bold text-[#E8926A] uppercase tracking-wide">Report</span>
                <h3
                  className="mt-2 font-black text-[#233551] group-hover:text-[#E8926A] transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[#233551]/50 leading-snug">{r.subtitle}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                  {r.keyStats.slice(0, 3).map((s, i) => (
                    <div key={i}>
                      <p className="text-xl font-black text-[#E8926A]" style={{ fontFamily: "var(--font-lato)" }}>
                        {s.figure}
                      </p>
                      <p className="text-xs text-[#233551]/40 leading-tight mt-0.5 line-clamp-2">{s.label}</p>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-block text-xs font-bold text-[#E8926A] group-hover:underline">
                  Read full report — {r.findings.length} findings →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── REGIONAL BREAKDOWN ── */}
        <section>
          <div className="mb-8">
            <h2
              className="text-2xl font-black text-[#233551] mb-2"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Regional breakdown
            </h2>
            <p className="text-[#233551]/50 text-sm">
              Where you live in India shapes what&apos;s available — and what&apos;s socially acceptable.
            </p>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7FAFA] border-b border-slate-100">
                  <th className="text-left px-5 py-4 font-bold text-[#233551] text-xs uppercase tracking-wide">Region</th>
                  <th className="text-left px-5 py-4 font-bold text-[#233551] text-xs uppercase tracking-wide">Access</th>
                  <th className="text-left px-5 py-4 font-bold text-[#233551] text-xs uppercase tracking-wide">Stigma</th>
                  <th className="text-left px-5 py-4 font-bold text-[#233551] text-xs uppercase tracking-wide hidden md:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalStats.map((row) => (
                  <tr key={row.region} className="hover:bg-[#F7FAFA] transition-colors">
                    <td className="px-5 py-4 font-medium text-[#233551]">{row.region}</td>
                    <td className="px-5 py-4 text-[#233551]/60">{row.access}</td>
                    <td className="px-5 py-4 text-[#233551]/60">{row.stigma}</td>
                    <td className="px-5 py-4 text-[#233551]/40 text-xs hidden md:table-cell">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Report cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {reportsBySection.regional.map((r) => (
              <Link
                key={r.slug}
                href={`/market-reports/${r.slug}`}
                className="group block border border-slate-100 rounded-2xl p-6 hover:border-[#7EC0B7]/40 hover:shadow-md hover:shadow-[#7EC0B7]/10 transition-all duration-200"
              >
                <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-wide">Report</span>
                <h3
                  className="mt-2 font-black text-[#233551] group-hover:text-[#3D8A80] transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[#233551]/50 leading-snug">{r.subtitle}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                  {r.keyStats.slice(0, 3).map((s, i) => (
                    <div key={i}>
                      <p className="text-xl font-black text-[#3D8A80]" style={{ fontFamily: "var(--font-lato)" }}>
                        {s.figure}
                      </p>
                      <p className="text-xs text-[#233551]/40 leading-tight mt-0.5 line-clamp-2">{s.label}</p>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-block text-xs font-bold text-[#3D8A80] group-hover:underline">
                  Read full report — {r.findings.length} findings →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stigma note */}
        <section className="border border-[#7EC0B7]/25 rounded-2xl p-8 bg-[#7EC0B7]/5">
          <h2
            className="text-xl font-black text-[#233551] mb-4"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            A note on stigma
          </h2>
          <div className="space-y-4 text-[#233551]/70 text-sm leading-relaxed">
            <p>
              Stigma in India around mental health is real, but it isn&apos;t uniform. It varies by geography, generation, socioeconomic background, and context. It&apos;s changing faster in some places than others.
            </p>
            <p>
              One thing that&apos;s consistent: people often know more about what they&apos;re feeling than they let on. The problem isn&apos;t usually awareness. It&apos;s the absence of somewhere to take it.
            </p>
            <p>
              Online therapy removes some of the practical and social friction of seeking help. No one in your building sees you going in. No one at your office knows. That matters.
            </p>
          </div>
        </section>

      </main>

      {/* Blog crosslink */}
      <section className="border-t border-slate-100 bg-[#F7FAFA] py-14">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3
              className="text-xl font-black text-[#233551] mb-1"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Want the human version?
            </h3>
            <p className="text-[#233551]/50 text-sm">
              Our blog covers the same topics in plain language. No data tables.
            </p>
          </div>
          <Link
            href="/blog"
            className="flex-shrink-0 inline-block bg-[#233551] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-colors"
          >
            Read the blog
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

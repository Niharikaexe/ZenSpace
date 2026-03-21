import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { allReports, reportsBySection, getReport } from "@/lib/market-reports-data"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return allReports.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const report = getReport(slug)
  if (!report) return {}
  return {
    title: `${report.title} — ${report.subtitle}`,
    description: report.intro.slice(0, 160),
    openGraph: {
      title: `${report.title} | ZenSpace Market Reports`,
      description: report.intro.slice(0, 160),
      type: "article",
      publishedTime: report.publishedAt,
    },
    alternates: {
      canonical: `https://zenspace.in/market-reports/${report.slug}`,
    },
  }
}

function renderBodyText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[#233551]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params
  const report = getReport(slug)
  if (!report) notFound()

  const related = reportsBySection[report.section].filter((r) => r.slug !== report.slug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: report.title,
    description: report.intro.slice(0, 160),
    datePublished: report.publishedAt,
    author: { "@type": "Organization", name: "ZenSpace" },
    publisher: { "@type": "Organization", name: "ZenSpace" },
    about: { "@type": "Thing", name: "Mental Health in India" },
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-[#F7FAFA]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-[#233551]/45">
          <Link href="/" className="hover:text-[#233551] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/market-reports" className="hover:text-[#233551] transition-colors">Market Reports</Link>
          <span>/</span>
          <span className="text-[#233551]/70">{report.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#233551] py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7EC0B7] bg-[#7EC0B7]/15 px-3 py-1.5 rounded-full">
              {report.sectionLabel}
            </span>
            <span className="text-white/25 text-xs">
              {new Date(report.publishedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            {report.title}
          </h1>
          <p className="text-[#7EC0B7] text-lg font-medium mb-6">{report.subtitle}</p>
          <p className="text-white/55 text-base leading-relaxed max-w-2xl">{report.intro}</p>
        </div>
      </section>

      {/* Key stats strip */}
      <section className="border-b border-slate-100 bg-[#F7FAFA]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-xs font-black uppercase tracking-widest text-[#233551]/35 mb-6">Key Metrics</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.keyStats.map((s, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-5">
                <p
                  className="text-3xl font-black text-[#3D8A80] mb-1.5"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {s.figure}
                </p>
                <p className="text-[#233551] text-sm font-semibold leading-snug mb-1.5">{s.label}</p>
                <p className="text-[#233551]/35 text-xs">{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-14 md:py-20 space-y-16">

        {/* Findings */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#233551]/35">Key Findings</p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="space-y-12">
            {report.findings.map((f, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_220px] gap-8 items-start">
                <div>
                  <h2
                    className="text-lg font-black text-[#233551] mb-3"
                    style={{ fontFamily: "var(--font-lato)" }}
                  >
                    {i + 1}. {f.heading}
                  </h2>
                  <p className="text-[#233551]/65 text-sm leading-relaxed">
                    {renderBodyText(f.body)}
                  </p>
                </div>
                {f.stat && (
                  <div className="bg-[#F7FAFA] border border-slate-100 rounded-2xl p-6 text-center flex-shrink-0">
                    <p
                      className="text-4xl font-black text-[#3D8A80]"
                      style={{ fontFamily: "var(--font-lato)" }}
                    >
                      {f.stat}
                    </p>
                    <p className="text-xs text-[#233551]/50 mt-2 leading-snug">{f.statLabel}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why this happens */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#233551]/35">Why This Happens</p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="space-y-8">
            {report.whyThisHappens.map((w, i) => (
              <div key={i} className="border-l-4 border-[#7EC0B7]/40 pl-6">
                <h3
                  className="font-black text-[#233551] mb-2"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {w.heading}
                </h3>
                <p className="text-[#233551]/65 text-sm leading-relaxed">
                  {renderBodyText(w.body)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Implications */}
        <section className="bg-[#233551] rounded-2xl p-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#7EC0B7]/70 mb-4">Implications</p>
          <p
            className="text-white/80 text-sm leading-relaxed"
          >
            {report.implications}
          </p>
        </section>

        {/* Sources */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-[#233551]/35">Sources</p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <ul className="space-y-4">
            {report.sources.map((s) => (
              <li key={s.title} className="flex items-start gap-4">
                <span className="flex-shrink-0 text-[#233551]/20 mt-0.5">↗</span>
                <div>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#233551] hover:text-[#3D8A80] transition-colors"
                  >
                    {s.title}
                  </a>
                  <p className="text-xs text-[#233551]/40 mt-0.5">
                    {s.org} — {s.year}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* Related report in same section */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-[#F7FAFA] py-14">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs font-black uppercase tracking-widest text-[#233551]/35 mb-6">
              Also in {report.sectionLabel}
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/market-reports/${r.slug}`}
                  className="group block bg-white border border-slate-100 rounded-2xl p-6 hover:border-[#7EC0B7]/40 hover:shadow-md hover:shadow-[#7EC0B7]/10 transition-all"
                >
                  <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-wide">
                    {r.sectionLabel}
                  </span>
                  <h3
                    className="mt-2 font-black text-[#233551] group-hover:text-[#3D8A80] transition-colors"
                    style={{ fontFamily: "var(--font-lato)" }}
                  >
                    {r.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#233551]/50">{r.subtitle}</p>
                  <div className="mt-5 flex items-center gap-4">
                    {r.keyStats.slice(0, 2).map((s, i) => (
                      <div key={i}>
                        <p className="text-xl font-black text-[#3D8A80]" style={{ fontFamily: "var(--font-lato)" }}>
                          {s.figure}
                        </p>
                        <p className="text-xs text-[#233551]/40 leading-tight">{s.label.slice(0, 40)}…</p>
                      </div>
                    ))}
                  </div>
                  <span className="mt-5 inline-block text-xs font-semibold text-[#3D8A80]">
                    Read full report →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-slate-100 bg-white py-14">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3
              className="text-xl font-black text-[#233551] mb-1"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Back to all reports
            </h3>
            <p className="text-[#233551]/50 text-sm">
              Six reports across national, workplace, and regional dimensions.
            </p>
          </div>
          <Link
            href="/market-reports"
            className="flex-shrink-0 inline-block border border-[#233551]/20 text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:border-[#233551]/50 transition-colors"
          >
            All reports
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

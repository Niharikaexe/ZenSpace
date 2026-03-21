import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { helpTopics } from "@/lib/help-data"

export const metadata: Metadata = {
  title: "Help Centre — How ZenSpace Works",
  description:
    "Answers to the questions most people have before they start. How matching works, what happens in the first session, your privacy, switching therapists, and more.",
  openGraph: {
    title: "ZenSpace Help Centre",
    description:
      "How matching works, what happens in the first session, your privacy, switching therapists, and more.",
  },
  alternates: {
    canonical: "https://zenspace.in/help",
  },
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F7FAFA] border-b border-slate-100 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#3D8A80] bg-[#7EC0B7]/15 px-4 py-2 rounded-full mb-6">
            Help Centre
          </span>
          <h1
            className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-5"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Things you probably<br />want to know first.
          </h1>
          <p className="text-[#233551]/55 text-lg max-w-xl leading-relaxed">
            Not a terms and conditions page. Just answers — written like a person, not a compliance team.
          </p>
        </div>
      </section>

      {/* Topic grid */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <div className="grid sm:grid-cols-2 gap-5">
          {helpTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/help/${topic.slug}`}
              className="group block border border-slate-100 rounded-2xl p-7 hover:border-[#7EC0B7]/40 hover:shadow-md hover:shadow-[#7EC0B7]/10 transition-all duration-200"
            >
              <span className="text-3xl">{topic.icon}</span>
              <h2
                className="mt-4 text-base font-bold text-[#233551] group-hover:text-[#3D8A80] transition-colors"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                {topic.title}
              </h2>
              <p className="mt-2 text-sm text-[#233551]/50 leading-relaxed">{topic.excerpt}</p>
              <span className="mt-5 inline-block text-xs font-semibold text-[#3D8A80]">
                Read more →
              </span>
            </Link>
          ))}
        </div>

        {/* Contact fallback */}
        <div className="mt-16 border border-slate-100 rounded-2xl p-8 text-center bg-[#F7FAFA]">
          <p
            className="text-lg font-bold text-[#233551] mb-2"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Didn&apos;t find what you were looking for?
          </p>
          <p className="text-[#233551]/50 text-sm mb-6">
            Write to us. We respond — usually within a few hours.
          </p>
          <a
            href="mailto:hello@zenspace.in"
            className="inline-block bg-[#233551] text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#2d4568] transition-colors"
          >
            hello@zenspace.in
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { helpTopics, getHelpTopic } from "@/lib/help-data"

type Props = { params: Promise<{ topic: string }> }

export async function generateStaticParams() {
  return helpTopics.map((t) => ({ topic: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params
  const data = getHelpTopic(topic)
  if (!data) return {}
  return {
    title: data.title,
    description: data.excerpt,
    alternates: {
      canonical: `https://zenspace.in/help/${data.slug}`,
    },
  }
}

/* Minimal content renderer — handles ## headings, **bold**, - bullets, paragraphs */
function renderContent(content: string) {
  const lines = content.trim().split("\n")
  const elements: React.ReactNode[] = []
  let key = 0
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      inList = false
      continue
    }

    if (trimmed.startsWith("## ")) {
      inList = false
      elements.push(
        <h2
          key={key++}
          className="text-xl font-black text-[#233551] mt-10 mb-3"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith("- ")) {
      if (!inList) {
        inList = true
      }
      elements.push(
        <li key={key++} className="text-[#233551]/70 text-base leading-relaxed ml-5 list-disc">
          {renderInline(trimmed.slice(2))}
        </li>
      )
    } else {
      inList = false
      elements.push(
        <p key={key++} className="text-[#233551]/70 text-base leading-relaxed">
          {renderInline(trimmed)}
        </p>
      )
    }
  }
  return elements
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-[#233551]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}

export default async function HelpTopicPage({ params }: Props) {
  const { topic } = await params
  const data = getHelpTopic(topic)
  if (!data) notFound()

  const otherTopics = helpTopics.filter((t) => t.slug !== data.slug).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-[#F7FAFA]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-[#233551]/45">
          <Link href="/" className="hover:text-[#233551] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/help" className="hover:text-[#233551] transition-colors">Help Centre</Link>
          <span>/</span>
          <span className="text-[#233551]/70">{data.shortTitle}</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <header className="mb-12">
          <span className="text-4xl">{data.icon}</span>
          <h1
            className="mt-5 text-3xl md:text-4xl font-black text-[#233551] leading-tight"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            {data.title}
          </h1>
          <p className="mt-4 text-lg text-[#233551]/55 leading-relaxed">{data.excerpt}</p>
        </header>

        <div className="space-y-5 border-t border-slate-100 pt-10">
          {renderContent(data.content)}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#233551] p-8 text-center">
          <p
            className="text-white font-bold text-lg mb-2"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Still have a question?
          </p>
          <p className="text-white/55 text-sm mb-6">
            You can also start with a free 15-minute call with a potential therapist. No commitment, no invoice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/questionnaire"
              className="inline-block bg-[#7EC0B7] text-[#233551] font-bold text-sm px-8 py-3 rounded-full hover:bg-[#6DB5AB] transition-colors"
            >
              Book free intro call
            </Link>
            <a
              href="mailto:hello@zenspace.in"
              className="inline-block border border-white/25 text-white font-bold text-sm px-8 py-3 rounded-full hover:border-white/60 transition-colors"
            >
              Email us
            </a>
          </div>
        </div>
      </article>

      {/* Other help topics */}
      <section className="border-t border-slate-100 bg-[#F7FAFA] py-14">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-xl font-black text-[#233551] mb-8"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Other things people ask about
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {otherTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/help/${t.slug}`}
                className="group flex items-start gap-3 border border-slate-100 bg-white rounded-xl p-5 hover:border-[#7EC0B7]/40 transition-all"
              >
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <div>
                  <p
                    className="font-bold text-sm text-[#233551] group-hover:text-[#3D8A80] transition-colors"
                    style={{ fontFamily: "var(--font-lato)" }}
                  >
                    {t.shortTitle}
                  </p>
                  <p className="text-xs text-[#233551]/45 mt-0.5 line-clamp-2">{t.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { blogPosts, getBlogPost } from "@/lib/blog-data"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["ZenSpace"],
    },
    alternates: {
      canonical: `https://zenspace.in/blog/${post.slug}`,
    },
  }
}

/* Minimal Markdown-like renderer — handles ## headings, **bold**, and paragraphs */
function renderContent(content: string) {
  const lines = content.trim().split("\n")
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith("## ")) {
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
      // Collect consecutive list items
      elements.push(
        <li key={key++} className="text-[#233551]/70 text-base leading-relaxed ml-4 list-disc">
          {renderInline(trimmed.slice(2))}
        </li>
      )
    } else {
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
  // Handle **bold**
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "ZenSpace" },
    publisher: { "@type": "Organization", name: "ZenSpace" },
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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-[#233551]/45">
          <Link href="/" className="hover:text-[#233551] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#233551] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[#233551]/70">{post.categoryLabel}</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <header className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3D8A80] bg-[#7EC0B7]/15 px-3 py-1.5 rounded-full">
            {post.categoryLabel}
          </span>
          <h1
            className="mt-5 text-3xl md:text-4xl font-black text-[#233551] leading-tight"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-[#233551]/55 leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-4 text-sm text-[#233551]/35 border-t border-slate-100 pt-6">
            <span>ZenSpace</span>
            <span>·</span>
            <span>{post.readTime}</span>
            <span>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
        </header>

        <div className="space-y-5 prose-none">{renderContent(post.content)}</div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#233551] p-8 text-center">
          <p className="text-white font-bold text-lg mb-2" style={{ fontFamily: "var(--font-lato)" }}>
            Reading is the start.
          </p>
          <p className="text-white/55 text-sm mb-6">
            Talk to a therapist for 15 minutes, free. No payment until you&apos;re sure.
          </p>
          <Link
            href="/questionnaire"
            className="inline-block bg-[#7EC0B7] text-[#233551] font-bold text-sm px-8 py-3 rounded-full hover:bg-[#6DB5AB] transition-colors"
          >
            Book your free intro call
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-[#F7FAFA] py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2
              className="text-xl font-black text-[#233551] mb-8"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              More on {post.categoryLabel.toLowerCase()}
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-white border border-slate-100 rounded-2xl p-6 hover:border-[#7EC0B7]/40 transition-all"
                >
                  <h3
                    className="font-bold text-[#233551] group-hover:text-[#3D8A80] transition-colors leading-snug"
                    style={{ fontFamily: "var(--font-lato)" }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#233551]/50 line-clamp-2">{p.excerpt}</p>
                  <span className="mt-4 inline-block text-xs text-[#3D8A80] font-semibold">
                    {p.readTime} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

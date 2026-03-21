import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { blogPosts, type BlogPost } from "@/lib/blog-data"

export const metadata: Metadata = {
  title: "Blog — Mental Health, Work, Relationships & Anxiety",
  description:
    "Honest writing about anxiety, burnout, relationships, and what therapy actually does. No wellness speak. No poster copy. Just things worth reading.",
  openGraph: {
    title: "ZenSpace Blog — Mental Health in Plain Language",
    description:
      "Honest writing about anxiety, burnout, relationships, and what therapy actually does.",
  },
}

const categories: { key: BlogPost["category"]; label: string; description: string }[] = [
  {
    key: "corporates",
    label: "Work & Burnout",
    description: "For people who are productive on the outside and exhausted on the inside.",
  },
  {
    key: "gen-z",
    label: "Self-Understanding",
    description: "The gap between knowing yourself and actually changing.",
  },
  {
    key: "couples",
    label: "Relationships",
    description: "The conversations people have. And the ones they keep avoiding.",
  },
  {
    key: "anxiety",
    label: "Anxiety",
    description: "What anxiety is actually doing — and what helps.",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F7FAFA] border-b border-slate-100 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#3D8A80] bg-[#7EC0B7]/15 px-4 py-2 rounded-full mb-6">
            ZenSpace Blog
          </span>
          <h1
            className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-5"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Things worth reading<br />about mental health.
          </h1>
          <p className="text-[#233551]/55 text-lg max-w-xl leading-relaxed">
            No wellness speak. No poster copy. Just honest writing about what people actually go through — burnout, anxiety, relationships, and what therapy does and doesn&apos;t do.
          </p>
        </div>
      </section>

      {/* Category sections */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-20">
        {categories.map((cat) => {
          const posts = blogPosts.filter((p) => p.category === cat.key)
          return (
            <section key={cat.key}>
              <div className="mb-8">
                <h2
                  className="text-2xl font-black text-[#233551] mb-2"
                  style={{ fontFamily: "var(--font-lato)" }}
                >
                  {cat.label}
                </h2>
                <p className="text-[#233551]/50 text-sm">{cat.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block border border-slate-100 rounded-2xl p-6 hover:border-[#7EC0B7]/40 hover:shadow-md hover:shadow-[#7EC0B7]/10 transition-all duration-200"
                  >
                    <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-wide">
                      {post.categoryLabel}
                    </span>
                    <h3
                      className="mt-3 text-base font-bold text-[#233551] leading-snug group-hover:text-[#3D8A80] transition-colors"
                      style={{ fontFamily: "var(--font-lato)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#233551]/50 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-[#233551]/35">
                      <span>{post.readTime}</span>
                      <span>·</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* CTA strip */}
      <section className="bg-[#233551] py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-2xl md:text-3xl font-black text-white mb-4"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Reading helps. Talking helps more.
          </h2>
          <p className="text-white/55 mb-8 text-base">
            Before you pay anything, talk to your potential therapist for 15 minutes. No pressure. No invoice.
          </p>
          <Link
            href="/questionnaire"
            className="inline-block bg-[#7EC0B7] text-[#233551] font-bold text-sm px-8 py-3.5 rounded-full hover:bg-[#6DB5AB] transition-colors"
          >
            Start with a free intro call
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

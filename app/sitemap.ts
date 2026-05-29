import type { MetadataRoute } from 'next'

const SITE = 'https://mindcanopy.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const monthly: 'monthly' = 'monthly'
  const weekly: 'weekly' = 'weekly'

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: weekly, priority: 1.0 },

    { url: `${SITE}/for/individuals`, lastModified: now, changeFrequency: monthly, priority: 0.9 },
    { url: `${SITE}/for/couples`, lastModified: now, changeFrequency: monthly, priority: 0.9 },
    { url: `${SITE}/for/adolescents`, lastModified: now, changeFrequency: monthly, priority: 0.9 },

    { url: `${SITE}/questionnaire/individual`, lastModified: now, changeFrequency: monthly, priority: 0.8 },
    { url: `${SITE}/questionnaire/couples`, lastModified: now, changeFrequency: monthly, priority: 0.8 },
    { url: `${SITE}/questionnaire/teen`, lastModified: now, changeFrequency: monthly, priority: 0.8 },

    { url: `${SITE}/blog`, lastModified: now, changeFrequency: weekly, priority: 0.7 },
    { url: `${SITE}/market-reports`, lastModified: now, changeFrequency: monthly, priority: 0.7 },
    { url: `${SITE}/help`, lastModified: now, changeFrequency: monthly, priority: 0.7 },

    { url: `${SITE}/about`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: monthly, priority: 0.4 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: monthly, priority: 0.4 },

    { url: `${SITE}/therapist/apply`, lastModified: now, changeFrequency: monthly, priority: 0.5 },
    { url: `${SITE}/therapist/join`, lastModified: now, changeFrequency: monthly, priority: 0.5 },
  ]
}

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubscriptionPlans } from './SubscriptionPlans'

// Sample anonymised therapist profiles — trust-building display only
const SAMPLE_THERAPISTS = [
  {
    initials: 'DR',
    name: 'Dr. R.',
    specializations: ['Anxiety', 'Depression'],
    experience: '8 years',
    approach: 'Cognitive Behavioural Therapy',
    languages: ['English', 'Hindi'],
  },
  {
    initials: 'PS',
    name: 'Dr. S.',
    specializations: ['Trauma', 'PTSD'],
    experience: '12 years',
    approach: 'EMDR & Somatic Therapy',
    languages: ['English', 'Telugu'],
  },
  {
    initials: 'AM',
    name: 'Dr. M.',
    specializations: ['Relationships', 'Life Transitions'],
    experience: '6 years',
    approach: 'Person-Centred Therapy',
    languages: ['English', 'Marathi'],
  },
  {
    initials: 'RK',
    name: 'Dr. K.',
    specializations: ['Stress', 'Self-esteem'],
    experience: '10 years',
    approach: 'Mindfulness-Based Therapy',
    languages: ['English', 'Tamil'],
  },
]

interface Props {
  userName: string
  userEmail: string
  hasActiveSubscription: boolean
}

export function PendingDashboard({ userName, userEmail, hasActiveSubscription }: Props) {
  return (
    <div className="space-y-8">
      {/* Matching status banner */}
      <Card className="border-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <CardContent className="py-8 text-center space-y-3">
          <div className="flex justify-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="inline-block w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:-0.15s]" />
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold">We&apos;re finding your perfect therapist</h2>
          <p className="text-white/80 max-w-md mx-auto text-sm">
            Our team is personally reviewing your responses to match you with the right therapist.
            This usually takes 24–48 hours.
          </p>
          {hasActiveSubscription && (
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mt-2">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              Subscription active — you&apos;re all set!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription section — shown only if not yet subscribed */}
      {!hasActiveSubscription && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Choose your subscription plan
            </CardTitle>
            <CardDescription>
              Subscribe now so you&apos;re ready to start your first session the moment you&apos;re matched.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans userName={userName} userEmail={userEmail} />
          </CardContent>
        </Card>
      )}

      {/* Therapist carousel — trust building */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Some of our therapists
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_THERAPISTS.map(t => (
            <Card key={t.initials} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar initials */}
                  <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.approach}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.experience} experience</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.specializations.map(s => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="text-xs bg-teal-50 text-teal-700 border-0 px-2 py-0"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.languages.map(l => (
                        <span key={l} className="text-xs text-slate-400">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">
          Profiles are anonymised for privacy. Your matched therapist will be revealed once assigned.
        </p>
      </div>
    </div>
  )
}

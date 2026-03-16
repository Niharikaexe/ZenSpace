import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xl font-bold text-teal-700">ZenSpace</span>
        <Link href="/login">
          <Button variant="outline" size="sm">Sign in</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-block bg-teal-100 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Online Therapy, Personalised for You
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          Feel better with a{' '}
          <span className="text-teal-600">licensed therapist</span>
          <br />by your side
        </h1>

        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
          Answer a few questions and we&apos;ll personally match you with the right therapist.
          Connect via chat or video — on your schedule.
        </p>

        <Link href="/questionnaire">
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base rounded-full"
          >
            Get matched with a therapist →
          </Button>
        </Link>

        <p className="text-sm text-slate-500 mt-4">Takes 2 minutes · No commitment required</p>

        {/* How it works */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              step: '01',
              title: 'Share your needs',
              desc: 'Answer a short questionnaire about your goals and preferences.',
            },
            {
              step: '02',
              title: 'Get matched',
              desc: 'We personally review your answers and find the ideal therapist for you.',
            },
            {
              step: '03',
              title: 'Start your journey',
              desc: 'Connect with your therapist via chat or video at your convenience.',
            },
          ].map(item => (
            <div
              key={item.step}
              className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
            >
              <span className="text-3xl font-bold text-teal-100">{item.step}</span>
              <h3 className="text-base font-semibold text-slate-800 mt-2">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

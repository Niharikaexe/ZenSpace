import { formatQuestionnaireForAdmin } from '@/lib/admin-questionnaire'

interface Props {
  responses: Record<string, unknown> | null | undefined
  submittedAt?: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function QuestionnaireDetails({ responses, submittedAt }: Props) {
  const view = formatQuestionnaireForAdmin(responses)

  if (!view) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-sm text-slate-400 italic">No questionnaire submitted yet.</p>
      </div>
    )
  }

  if (view.sections.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{view.typeLabel}</p>
          {submittedAt && <p className="text-[11px] text-slate-400">Submitted {formatDate(submittedAt)}</p>}
        </div>
        <p className="text-sm text-slate-400 italic mt-2">Submitted but no answers recorded.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{view.typeLabel}</p>
        {submittedAt && <p className="text-[11px] text-slate-400">Submitted {formatDate(submittedAt)}</p>}
      </div>
      {view.sections.map((section, i) => (
        <div key={i}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {section.heading}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-white rounded-lg p-4 border border-slate-200">
            {section.items.map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-slate-400">{item.label}</p>
                <p className="text-sm text-slate-700 font-medium mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

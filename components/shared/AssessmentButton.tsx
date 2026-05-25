"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AssessmentModal } from "./AssessmentModal"

interface Props {
  label?: string
  className: string
  style?: React.CSSProperties
}

// Map the audience landing pages to their respective questionnaire route.
// When the button is rendered on one of these pages we skip the "who is this for?"
// modal and go straight to the matching questionnaire — the user has already
// self-identified by being on that page.
const PATH_TO_QUESTIONNAIRE: Record<string, string> = {
  '/for/individuals': '/questionnaire/individual',
  '/for/couples': '/questionnaire/couples',
  '/for/adolescents': '/questionnaire/teen',
}

export function AssessmentButton({ label = "Start the assessment", className, style }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const directHref = PATH_TO_QUESTIONNAIRE[pathname ?? '']

  function handleClick() {
    if (directHref) {
      router.push(directHref)
    } else {
      setOpen(true)
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className} style={style}>
        {label}
      </button>
      {open && <AssessmentModal onClose={() => setOpen(false)} />}
    </>
  )
}

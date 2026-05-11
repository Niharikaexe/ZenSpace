"use client"

import { useState } from "react"
import { AssessmentModal } from "./AssessmentModal"

interface Props {
  label?: string
  className: string
  style?: React.CSSProperties
}

export function AssessmentButton({ label = "Start the assessment", className, style }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {label}
      </button>
      {open && <AssessmentModal onClose={() => setOpen(false)} />}
    </>
  )
}

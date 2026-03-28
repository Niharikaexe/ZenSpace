'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SubscriptionPlans } from './SubscriptionPlans'

interface Props {
  open: boolean
  onClose: () => void
  userName: string
  userEmail: string
  action?: string // e.g. "send a message" | "schedule a video session"
}

export function PaymentGateModal({ open, onClose, userName, userEmail, action }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Subscribe to continue
          </DialogTitle>
          <DialogDescription className="text-[#233551]/60">
            To {action ?? 'access this feature'}, you need an active ZenSpace subscription.
            Choose a plan below to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <SubscriptionPlans
            userName={userName}
            userEmail={userEmail}
            onSuccess={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

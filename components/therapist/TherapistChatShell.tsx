'use client'

import { useState } from 'react'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import MessengerLayout, { type ClientMatch } from '@/components/therapist/MessengerLayout'
import type { Notification } from '@/app/actions/notifications'

interface Props {
  therapistName: string
  userId: string
  matches: ClientMatch[]
  initialTotalUnread: number
  initialNotifications: Notification[]
}

export default function TherapistChatShell({
  therapistName,
  userId,
  matches,
  initialTotalUnread,
  initialNotifications,
}: Props) {
  const [navUnread, setNavUnread] = useState(initialTotalUnread)

  function handleMatchOpened(matchId: string, matchUnread: number) {
    if (matchUnread > 0) {
      setNavUnread(prev => Math.max(0, prev - matchUnread))
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <TherapistNav
        therapistName={therapistName}
        userId={userId}
        initialNotifications={initialNotifications}
        unreadCount={navUnread}
        isMatched={true}
      />
      <div className="flex-1 overflow-hidden">
        <MessengerLayout
          matches={matches}
          currentUserId={userId}
          therapistName={therapistName}
          onMatchOpened={handleMatchOpened}
        />
      </div>
    </div>
  )
}

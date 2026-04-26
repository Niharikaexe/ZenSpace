export default function DashboardLoading() {
  return (
    <div className="h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#7EC0B7] border-t-transparent animate-spin" />
        <p className="text-xs text-[#233551]/35 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#7EC0B7] border-t-transparent animate-spin" />
        <p className="text-sm text-[#233551]/40 font-medium">Loading...</p>
      </div>
    </div>
  )
}

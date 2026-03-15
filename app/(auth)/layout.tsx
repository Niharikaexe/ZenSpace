export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">ZenSpace</h1>
          <p className="text-sm text-teal-600 mt-1">Your mental wellness journey starts here</p>
        </div>
        {children}
      </div>
    </div>
  )
}

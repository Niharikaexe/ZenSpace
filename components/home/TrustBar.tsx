import { Shield, Award, Users, Lock } from "lucide-react"

const badges = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Lock, label: "256-bit Encryption" },
  { icon: Award, label: "Licensed Therapists" },
  { icon: Users, label: "5,000+ Lives Changed" },
]

const TrustBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 text-muted-foreground">
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBar

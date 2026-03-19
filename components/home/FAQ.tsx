import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "Is online therapy effective?",
    a: "Yes. Numerous studies show that online therapy is just as effective as in-person therapy for most conditions including anxiety, depression, and relationship issues.",
  },
  {
    q: "How much does it cost?",
    a: "Plans start at ₹1,200/week or ₹3,999/month. We offer flexible options to make therapy accessible and affordable for everyone.",
  },
  {
    q: "How quickly can I get matched?",
    a: "Most people are matched with a licensed therapist within 24–48 hours of completing the questionnaire.",
  },
  {
    q: "Can I switch therapists?",
    a: "Absolutely. You can switch therapists at any time, free of charge. Finding the right fit is important to us.",
  },
  {
    q: "Is my information confidential?",
    a: "Yes. We are fully compliant and use 256-bit encryption to protect all communications. Your privacy is our top priority.",
  },
]

const FAQ = () => {
  return (
    <section id="faq" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know before getting started.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="font-display text-base font-semibold hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FAQ

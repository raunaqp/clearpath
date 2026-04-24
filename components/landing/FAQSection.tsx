"use client";
import posthog from "posthog-js";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does my product need CDSCO approval?",
    answer:
      "It depends on what your product does, not what you call it. CDSCO's Medical Device Rules 2017 and the Oct 2025 SaMD draft cover any software that influences clinical decisions. ClearPath assesses this in 5 minutes — for free.",
  },
  {
    question: "How is this different from hiring a regulatory consultant?",
    answer:
      "A consultant takes 3 months and ₹50K–₹3L to answer questions ClearPath answers in 5 minutes. We don't replace consultants — we make sure the conversation with them starts informed, not from zero.",
  },
  {
    question: "What happens after I pay ₹499?",
    answer:
      "Your Regulatory Draft Pack is generated and emailed within ~10 minutes. It includes structured content for every CDSCO form section, relevant forms to download, and a pathway + timeline. You paste our content into the forms — or hand it to a consultant.",
  },
  {
    question: "What's in the ₹50K Submission Concierge?",
    answer:
      "Document refinement by Indian regulatory experts, classification re-validation, QMS checklist guidance (ISO 13485), clinical validation plan review, and 1 iteration within 2–3 weeks. Join the waitlist — we're onboarding the first cohort now.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your submission is used only to generate your Readiness Card and Draft Pack. Uploaded files are stored encrypted and deleted after 90 days. We never share your data. ClearPath is built to DPDP Act 2023 standards.",
  },
  {
    question: "Do you file the application for me?",
    answer:
      "No. ClearPath generates submission-ready content. You or your consultant file it with CDSCO. The ₹50K Concierge tier includes expert review and guidance, but the founder or their team remains the applicant.",
  },
  {
    question: "What if my product isn't a medical device at all?",
    answer:
      "That's a valid outcome. 21% of the products we've assessed don't need CDSCO approval — wellness carve-out, pure PHR, or aggregator platforms. ClearPath tells you clearly when you're not in scope — that's also worth ₹499 in saved consultant time.",
  },
  {
    question: "How accurate are your classifications?",
    answer:
      "We're calibrated on 15+ real Indian healthtech products, including CerviAI (CDSCO MD-12 filed), EkaScribe, and Neodocs. We use soft certainty language throughout — \"likely Class B/C\" not \"is Class C\" — because the regulator uses the same language until inspection.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If your Draft Pack isn't delivered within 24 hours of payment, you get a full refund automatically. No questions asked.",
  },
  {
    question: "Who's behind ClearPath?",
    answer:
      "ClearPath is built by Raunaq Pradhan — core contributor to the Ayushman Bharat Digital Mission, Champion Mentor for ABDM, SIIP Fellow (DBT BIRAC), and mentor to 20+ digital health startups. Designed with inputs from Dhritiman Mallick (Vyuhaa Med Data / CerviAI) and Dr Bhaskar Rajakumar (Charaka / Karnataka Medtech Cluster).",
  },
];

export default function FAQSection() {
  function handleOpen(index: number, question: string) {
    try {
      posthog.capture("faq_opened", {
        question_index: index,
        question_text: question,
      });
    } catch {}
  }

  return (
    <section id="faq" className="py-20 md:py-28 border-b border-[#E8E4D6]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-6">
          FAQ
        </p>
        <h2 className="font-serif font-normal text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-12">
          Common questions
        </h2>

        <div className="max-w-3xl">
          <Accordion>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger
                  className="font-sans text-[15px] font-medium text-[#0E1411] py-4 hover:no-underline"
                  onClick={() => handleOpen(i, faq.question)}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] text-[#6B766F] leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

import { ChevronDown } from "lucide-react";
import { Card } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { useState } from "react";

export function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    setOpenItems(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const faqs = [
    {
      id: "visa-expiry",
      question: "What should I do if my student visa is about to expire?",
      answer: "You should apply for renewal at least 90 days before expiration. Gather all required documents including I-20, financial statements, and academic transcripts. If your visa expires while in the US, you may face serious consequences including deportation. Contact our emergency hotline immediately if you're within 30 days of expiration."
    },
    {
      id: "work-authorization",
      question: "Can I work off-campus with a student visa?",
      answer: "F-1 students can work off-campus only with proper authorization like OPT, CPT, or in cases of severe economic hardship. Working without authorization can result in visa termination and deportation. Always consult with your school's international student office before accepting any off-campus employment."
    },
    {
      id: "housing-deposit",
      question: "My landlord won't return my security deposit. What can I do?",
      answer: "Document the condition of your rental unit with photos when moving in and out. Your landlord must return deposits within 30 days (varies by state) minus legitimate deductions for damages beyond normal wear and tear. You can file a complaint with local housing authorities or small claims court if necessary."
    },
    {
      id: "discrimination",
      question: "I think I'm facing discrimination. What are my rights?",
      answer: "International students are protected from discrimination based on national origin, race, religion, and other protected characteristics. Document incidents with dates, witnesses, and evidence. You can file complaints with your school's Title IX office, EEOC, or local civil rights organizations."
    },
    {
      id: "academic-issues",
      question: "What happens if I fail to maintain my GPA requirements?",
      answer: "Falling below academic requirements can result in loss of F-1 status. You may be placed on academic probation and have a limited time to improve your grades. If terminated, you must leave the US within 15 days unless you transfer to another school or change your status."
    },
    {
      id: "legal-emergency",
      question: "What constitutes a legal emergency for international students?",
      answer: "Legal emergencies include: imminent deportation proceedings, arrest or detention, urgent visa status issues, threats to physical safety, or any situation requiring immediate legal intervention. Our 24/7 hotline provides immediate guidance for such situations."
    },
    {
      id: "insurance-coverage",
      question: "Do I need special insurance as an international student?",
      answer: "Most schools require international students to have health insurance. You may also want to consider legal insurance, renters insurance for your belongings, and travel insurance for trips home. Review your coverage regularly to ensure adequate protection."
    },
    {
      id: "police-interaction",
      question: "What should I do if I'm stopped by police?",
      answer: "Remain calm, keep your hands visible, and carry your passport and I-20 at all times. You have the right to remain silent and request an attorney. Never lie or provide false documents. Contact our emergency hotline immediately if arrested or detained."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Get quick answers to the most common legal questions from international students
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq) => (
              <Card key={faq.id} className="border-l-4 border-l-primary/20">
                <Collapsible 
                  open={openItems.includes(faq.id)}
                  onOpenChange={() => toggleItem(faq.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-6 justify-between h-auto text-left hover:bg-muted/50"
                    >
                      <span className="font-semibold pr-4">{faq.question}</span>
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform ${
                          openItems.includes(faq.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6">
                    <div className="pt-4 border-t">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Still Have Questions?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our legal experts are here to help. Get personalized answers to your specific situation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Schedule Free Consultation
                </Button>
                <Button size="lg" variant="outline">
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
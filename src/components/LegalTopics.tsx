import { 
  Home, 
  Briefcase, 
  Car, 
  Users, 
  Gavel, 
  CreditCard, 
  Heart,
  FileText,
  ArrowRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function LegalTopics() {
  const topics = [
    {
      icon: Home,
      title: "Housing & Tenancy",
      description: "Residential Tenancies Act, landlord/tenant rights, rent control, evictions",
      color: "bg-blue-100 text-blue-600",
      examples: ["Rent increases", "Security deposits", "Eviction process", "Repairs"]
    },
    {
      icon: Briefcase,
      title: "Employment Law",
      description: "Employment Standards Act, workplace rights, termination, human rights",
      color: "bg-green-100 text-green-600",
      examples: ["Minimum wage", "Overtime pay", "Vacation time", "Wrongful dismissal"]
    },
    {
      icon: Users,
      title: "Family Law",
      description: "Family Law Act, divorce, custody, support, property division",
      color: "bg-purple-100 text-purple-600",
      examples: ["Child support", "Spousal support", "Custody", "Property rights"]
    },
    {
      icon: Car,
      title: "Highway Traffic",
      description: "Highway Traffic Act, driving offences, licenses, insurance requirements",
      color: "bg-red-100 text-red-600",
      examples: ["Traffic tickets", "License suspension", "Accident claims", "Insurance"]
    },
    {
      icon: Gavel,
      title: "Criminal Law",
      description: "Criminal Code of Canada, provincial offences, court procedures",
      color: "bg-orange-100 text-orange-600",
      examples: ["Bail hearings", "Court process", "Legal aid", "Provincial offences"]
    },
    {
      icon: CreditCard,
      title: "Consumer Protection",
      description: "Consumer Protection Act, warranties, contracts, debt collection",
      color: "bg-teal-100 text-teal-600",
      examples: ["Return policies", "Warranties", "Debt collection", "Contracts"]
    },
    {
      icon: Heart,
      title: "Health Law",
      description: "Health Care Consent Act, OHIP, privacy rights, consent to treatment",
      color: "bg-pink-100 text-pink-600",
      examples: ["OHIP coverage", "Medical consent", "Privacy rights", "Health records"]
    },
    {
      icon: FileText,
      title: "Small Claims",
      description: "Courts of Justice Act, small claims procedures, debt recovery, disputes",
      color: "bg-indigo-100 text-indigo-600",
      examples: ["Filing claims", "Court fees", "Evidence rules", "Enforcement"]
    }
  ];

  return (
    <section id="topics" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ontario Legal Topics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse information about common legal topics in Ontario. All information is based on current Ontario statutes and regulations.
            </p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {topics.map((topic) => (
              <Card key={topic.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className={`rounded-lg p-3 ${topic.color}`}>
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {topic.description}
                    </p>
                    <div className="mb-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Common questions:</div>
                      <div className="flex flex-wrap gap-1">
                        {topic.examples.map((example) => (
                          <span 
                            key={example}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-muted p-0 h-auto text-primary">
                      Explore Topic <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Need Legal Advice?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                This tool provides general information about Ontario law. For advice about your specific situation, 
                you need to consult with a qualified Ontario lawyer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline">
                  Find a Lawyer (Law Society of Ontario)
                </Button>
                <Button size="lg" variant="outline">
                  Legal Aid Ontario
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
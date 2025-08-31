import { 
  FileText, 
  Home, 
  Briefcase, 
  CreditCard, 
  Car, 
  Heart, 
  ArrowRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function LegalServices() {
  const services = [
    {
      icon: FileText,
      title: "Visa & Immigration",
      description: "Student visa renewals, work permits, status changes, and deportation defense",
      color: "bg-blue-100 text-blue-600",
      urgency: "Most Common"
    },
    {
      icon: Home,
      title: "Housing & Rental",
      description: "Lease disputes, security deposits, landlord issues, and housing discrimination",
      color: "bg-green-100 text-green-600",
      urgency: "Frequent"
    },
    {
      icon: Briefcase,
      title: "Employment Rights",
      description: "Work authorization, wage disputes, workplace discrimination, and contract issues",
      color: "bg-purple-100 text-purple-600",
      urgency: "Common"
    },
    {
      icon: CreditCard,
      title: "Banking & Finance",
      description: "Credit issues, loan disputes, financial fraud protection, and debt management",
      color: "bg-orange-100 text-orange-600",
      urgency: "Regular"
    },
    {
      icon: Car,
      title: "Transportation",
      description: "Driver's license issues, traffic violations, car accidents, and insurance claims",
      color: "bg-red-100 text-red-600",
      urgency: "Occasional"
    },
    {
      icon: Heart,
      title: "Healthcare Rights",
      description: "Insurance disputes, medical billing, privacy rights, and healthcare access",
      color: "bg-pink-100 text-pink-600",
      urgency: "Important"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Legal Services We Provide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive legal assistance tailored to the unique challenges faced by international students
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <Card key={service.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className={`rounded-lg p-3 ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{service.title}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        {service.urgency}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                    <Button variant="ghost" size="sm" className="group-hover:bg-muted p-0 h-auto">
                      Learn More <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Need Immediate Legal Assistance?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our emergency legal hotline is available 24/7 for urgent matters. 
                Don't wait when your legal status or rights are at risk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="destructive">
                  Emergency Hotline: (555) 123-HELP
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
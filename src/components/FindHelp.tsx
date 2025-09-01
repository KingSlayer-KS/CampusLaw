import { 
  Scale, 
  Phone, 
  MapPin, 
  DollarSign, 
  Users, 
  ExternalLink,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

export function FindHelp() {
  const helpOptions = [
    {
      title: "Law Society of Ontario",
      description: "Find a lawyer or paralegal licensed in Ontario",
      icon: Scale,
      color: "bg-blue-100 text-blue-600",
      features: ["Lawyer referral service", "Check credentials", "File complaints"],
      contact: "1-800-668-7380",
      website: "lso.ca",
      cost: "Varies by lawyer"
    },
    {
      title: "Legal Aid Ontario",
      description: "Free legal services for low-income individuals",
      icon: DollarSign,
      color: "bg-green-100 text-green-600", 
      features: ["Income-based eligibility", "Criminal & family law", "Duty counsel"],
      contact: "1-800-668-8258",
      website: "legalaid.on.ca",
      cost: "Free if eligible"
    },
    {
      title: "Community Legal Clinics",
      description: "Local legal clinics providing free services",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      features: ["Housing law", "Employment issues", "Social benefits"],
      contact: "Varies by location",
      website: "findlegalclinics.ca",
      cost: "Free"
    },
    {
      title: "Court Self-Help Services",
      description: "Court-based assistance for self-represented litigants", 
      icon: MapPin,
      color: "bg-orange-100 text-orange-600",
      features: ["Form assistance", "Court procedures", "Information sessions"],
      contact: "At courthouse",
      website: "ontario.ca/courts",
      cost: "Free"
    }
  ];

  const emergencyServices = [
    {
      service: "Police Emergency",
      number: "911",
      description: "Life-threatening emergencies, crimes in progress"
    },
    {
      service: "Assaulted Women&apos;s Helpline",
      number: "1-866-863-0511", 
      description: "24/7 support for women experiencing abuse"
    },
    {
      service: "Victim Support Line",
      number: "1-888-579-2888",
      description: "Support for victims of crime"
    },
    {
      service: "Ontario Human Rights Commission",
      number: "1-800-387-9080",
      description: "Discrimination and human rights violations"
    }
  ];

  return (
    <section id="help" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Find Legal Help in Ontario
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              When you need more than general information - connecting you with qualified legal professionals and support services
            </p>
          </div>

          {/* Emergency Alert */}
          <Alert className="mb-12 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Legal Emergency?</strong> If you&apos;re facing arrest, detention, or imminent legal deadlines, 
              contact a lawyer immediately. Many lawyers offer emergency consultations.
            </AlertDescription>
          </Alert>

          {/* Main Help Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {helpOptions.map((option) => (
              <Card key={option.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`rounded-lg p-3 ${option.color}`}>
                    <option.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{option.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 gap-2">
                    {option.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{option.contact}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Website:</span>
                    <span className="font-medium">{option.website}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">{option.cost}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>

          {/* Emergency & Crisis Services */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Emergency & Crisis Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {emergencyServices.map((service) => (
                <Card key={service.service} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{service.service}</h4>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-red-600">{service.number}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* When to Get Legal Help */}
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                When Should You Get Legal Help?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                While this tool provides general information, certain situations require professional legal assistance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold mb-3 text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Get Help Immediately
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You&apos;ve been arrested or charged</li>
                  <li>• Court deadlines approaching</li>
                  <li>• Facing eviction or foreclosure</li>
                  <li>• Discrimination or harassment</li>
                  <li>• Complex family law matters</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-amber-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Consider Getting Help
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Signing important contracts</li>
                  <li>• Employment disputes</li>
                  <li>• Insurance claim denials</li>
                  <li>• Significant financial decisions</li>
                  <li>• Any situation with major consequences</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

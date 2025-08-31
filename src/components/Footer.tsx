import { MapPin, Mail, Phone, ExternalLink, AlertTriangle, Scale } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";

export function Footer() {
  const legalTopics = [
    { name: "Housing & Tenancy", href: "#" },
    { name: "Employment Law", href: "#" },
    { name: "Family Law", href: "#" },
    { name: "Consumer Protection", href: "#" },
  ];

  const resources = [
    { name: "Ontario.ca", href: "https://ontario.ca" },
    { name: "Ontario Courts", href: "https://ontariocourts.ca" },
    { name: "Law Society of Ontario", href: "https://lso.ca" },
    { name: "Legal Aid Ontario", href: "https://legalaid.on.ca" },
  ];

  const quickHelp = [
    { name: "Find a Lawyer", href: "#" },
    { name: "Legal Aid", href: "#" },
    { name: "Community Clinics", href: "#" },
    { name: "Emergency Services", href: "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Important Legal Disclaimer */}
          <Alert className="mb-12 bg-primary-foreground/10 border-primary-foreground/20">
            <AlertTriangle className="h-4 w-4 text-primary-foreground" />
            <AlertDescription className="text-primary-foreground">
              <strong>Important Disclaimer:</strong> This website provides general information about Ontario law only. 
              This is not legal advice. For advice about your specific situation, consult a qualified Ontario lawyer. 
              Laws can change - always verify with current official sources.
            </AlertDescription>
          </Alert>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-white rounded-lg p-2">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Ontario Legal Info</div>
                  <div className="text-xs text-primary-foreground/80">Information • Not Advice</div>
                </div>
              </div>
              <p className="text-primary-foreground/80 mb-6 text-sm">
                A neutral legal information assistant providing reliable information about Ontario laws 
                and regulations, grounded in official government sources.
              </p>
              
              {/* Newsletter */}
              <div>
                <h4 className="font-semibold mb-3 text-sm">Legal Updates</h4>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Your email" 
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 text-sm"
                    size={undefined}
                  />
                  <Button variant="secondary" size="sm" className="text-sm">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Legal Topics */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal Topics</h4>
              <ul className="space-y-3">
                {legalTopics.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Official Resources</h4>
              <ul className="space-y-3">
                {resources.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Help */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Get Legal Help</h4>
              <ul className="space-y-3">
                {quickHelp.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-destructive rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h4 className="font-semibold mb-2 text-destructive-foreground">Emergency Services</h4>
                <p className="text-destructive-foreground/90 text-sm">
                  For life-threatening emergencies or crimes in progress
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button size="lg" variant="secondary" className="bg-white text-destructive hover:bg-gray-100">
                  <Phone className="h-5 w-5 mr-2" />
                  Call 911
                </Button>
              </div>
            </div>
          </div>

          {/* Jurisdiction Notice */}
          <div className="bg-primary-foreground/10 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <Scale className="h-6 w-6 text-primary-foreground/80" />
              <div className="text-center">
                <h4 className="font-semibold mb-1 text-primary-foreground">Ontario, Canada Only</h4>
                <p className="text-primary-foreground/80 text-sm">
                  All legal information on this site applies to Ontario law only. 
                  Laws in other provinces and territories may be different.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-primary-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-primary-foreground/80 text-sm mb-2">
                  © 2024 Ontario Legal Information Assistant. Educational purposes only.
                </p>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs">
                  <span className="text-primary-foreground/60">
                    Last updated: December 2024
                  </span>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Privacy Notice
                  </a>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Terms of Use
                  </a>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Accessibility
                  </a>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-primary-foreground/60 text-xs mb-2">
                  Information grounded in official Ontario sources
                </div>
                <div className="text-primary-foreground/60 text-xs">
                  Not legal advice • Consult a lawyer for your situation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
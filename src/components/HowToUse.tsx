import { MessageSquare, CheckCircle, AlertTriangle, ExternalLink, BookOpen, Scale } from "lucide-react";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";

export function HowToUse() {
  const outputSections = [
    {
      name: "Short Answer",
      icon: MessageSquare,
      description: "2-6 bullet points in plain English",
      example: "Key points about your question, explained simply"
    },
    {
      name: "What the Law Says",
      icon: Scale,
      description: "Specific legal citations with quotes",
      example: "Direct quotes from Ontario statutes with section numbers and URLs"
    },
    {
      name: "Process & Forms",
      icon: CheckCircle,
      description: "Practical next steps and official forms",
      example: "Step-by-step guidance with links to official government forms"
    },
    {
      name: "Important Caveats",
      icon: AlertTriangle,
      description: "Limitations, deadlines, and exceptions",
      example: "What this information doesn't cover and important deadlines"
    }
  ];

  const confidenceLevels = [
    {
      level: "High",
      color: "bg-green-100 text-green-800",
      description: "Strong citations from primary Ontario sources with clear legal authority"
    },
    {
      level: "Medium", 
      color: "bg-yellow-100 text-yellow-800",
      description: "Some relevant sources but may have gaps or need clarification"
    },
    {
      level: "Low",
      color: "bg-red-100 text-red-800", 
      description: "Limited sources or uncertain interpretation - consult a lawyer"
    }
  ];

  const tips = [
    "Be specific about your situation and location in Ontario",
    "Ask about one legal topic at a time for clearest answers",
    "Always check if information applies to your specific circumstances",
    "Look for recent updates to laws - legal information changes",
    "Consider consulting a lawyer for complex or urgent matters"
  ];

  return (
    <section id="howto" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How to Use This Tool
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Understanding how to get the most reliable legal information for your Ontario law questions
            </p>
          </div>

          {/* What You'll Get */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">What You&apos;ll Get in Every Response</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outputSections.map((section) => (
                <Card key={section.name} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{section.name}</h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        {section.description}
                      </p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <strong>Example:</strong> {section.example}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Confidence Levels */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Understanding Confidence Levels</h3>
            <div className="space-y-4 max-w-3xl mx-auto">
              {confidenceLevels.map((conf) => (
                <Card key={conf.level} className="p-4">
                  <div className="flex items-center space-x-4">
                    <Badge className={conf.color}>
                      {conf.level} Confidence
                    </Badge>
                    <p className="text-muted-foreground text-sm">
                      {conf.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips for Best Results */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Tips for Best Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {tips.map((tip, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tip}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Important Disclaimers */}
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Not Legal Advice:</strong> This tool provides general information about Ontario law. 
                It cannot replace personalized legal advice from a qualified Ontario lawyer.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-200 bg-blue-50">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Ontario Only:</strong> All information applies to Ontario, Canada only. 
                Laws in other provinces or territories may be different.
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-200 bg-amber-50">
              <ExternalLink className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Sources Matter:</strong> Always verify information with official government sources 
                and current statutes. Laws can change.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, Shield, BookOpen, AlertCircle, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Important Disclaimer */}
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> This provides general legal information about Ontario law only. 
              This is not legal advice. For advice about your specific situation, consult a qualified Ontario lawyer.
            </AlertDescription>
          </Alert>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-6">
              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Ontario, Canada Legal Information</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Ontario Legal
              <span className="bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent block">
                Information Assistant
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get clear, reliable information about Ontario laws and regulations. 
              All information is grounded in official Ontario statutes and government sources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8">
                Ask About Ontario Law
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Browse Legal Topics
              </Button>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Verified Sources</h3>
              <p className="text-muted-foreground text-sm">
                All information cited from official Ontario statutes, regulations, and government websites
              </p>
            </Card>

            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Plain English</h3>
              <p className="text-muted-foreground text-sm">
                Complex legal concepts explained clearly for everyday understanding
              </p>
            </Card>

            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Information Only</h3>
              <p className="text-muted-foreground text-sm">
                General information to help you understand the law, not personal legal advice
              </p>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Legal Topics</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">Ontario</div>
                <div className="text-sm text-muted-foreground">Jurisdiction Only</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">Current</div>
                <div className="text-sm text-muted-foreground">Up-to-date Info</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground">Public Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
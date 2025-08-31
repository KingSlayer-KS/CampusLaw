import { Book, Download, Video, Users, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function Resources() {
  const guides = [
    {
      title: "Complete Visa Renewal Guide",
      description: "Step-by-step instructions for renewing your student visa",
      type: "PDF Guide",
      icon: Book,
      badge: "Most Popular",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      title: "Housing Rights Checklist",
      description: "Know your rights as a tenant and avoid common pitfalls",
      type: "Interactive Tool",
      icon: Download,
      badge: "Essential",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      title: "Employment Law Webinar",
      description: "Understanding your work rights as an international student",
      type: "Video Series",
      icon: Video,
      badge: "New",
      badgeColor: "bg-purple-100 text-purple-800"
    }
  ];

  const quickTools = [
    {
      title: "Visa Status Checker",
      description: "Check your current visa status and expiration dates",
      action: "Check Status"
    },
    {
      title: "Legal Document Templates",
      description: "Download templates for common legal documents",
      action: "Browse Templates"
    },
    {
      title: "Emergency Contacts",
      description: "Important legal and consular contact information",
      action: "View Contacts"
    },
    {
      title: "Legal Clinic Locator",
      description: "Find free legal clinics in your area",
      action: "Find Clinics"
    }
  ];

  const upcomingEvents = [
    {
      date: "Dec 15",
      title: "Immigration Law Workshop",
      time: "2:00 PM EST",
      type: "Virtual"
    },
    {
      date: "Dec 18",
      title: "Housing Rights Seminar",
      time: "6:00 PM EST",
      type: "In-Person"
    },
    {
      date: "Dec 22",
      title: "Q&A with Immigration Attorney",
      time: "1:00 PM EST",
      type: "Virtual"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Resources & Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free guides, tools, and educational content to help you understand your legal rights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Guides */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6">Featured Guides</h3>
              <div className="space-y-6">
                {guides.map((guide) => (
                  <Card key={guide.title} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <guide.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{guide.title}</h4>
                          <Badge className={guide.badgeColor}>
                            {guide.badge}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {guide.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{guide.type}</span>
                          <Button variant="outline" size="sm">
                            Access <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Tools */}
              <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6">Quick Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickTools.map((tool) => (
                    <Card key={tool.title} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-semibold mb-2">{tool.title}</h4>
                      <p className="text-muted-foreground text-sm mb-3">{tool.description}</p>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                        {tool.action} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Events */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.title} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-primary">{event.date}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Events
                </Button>
              </Card>

              {/* Community */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Join Our Community
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect with other international students and share experiences.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Discord Community
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    WhatsApp Groups
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Weekly Newsletter
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
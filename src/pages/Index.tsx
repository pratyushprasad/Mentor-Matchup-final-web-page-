import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { GraduationCap, Users, Calendar, Star, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-mentorship.jpg";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return null;
      }
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Connect with
                <span className="text-primary"> College Mentors</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Get personalized guidance from students at top colleges. Book 1-on-1 sessions
                to learn about college life, academics, and career paths.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/mentors")} className="gap-2">
                  Find a Mentor
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/register-mentor")}>
                  Become a Mentor
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{settings?.active_mentors || "500+"}</p>
                  <p className="text-sm text-muted-foreground">Active Mentors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{settings?.top_colleges || "50+"}</p>
                  <p className="text-sm text-muted-foreground">Top Colleges</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{settings?.average_rating || "4.8/5"}</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="rounded-2xl overflow-hidden shadow-large border-4 border-primary/20">
                <img
                  src={heroImage}
                  alt="Students mentoring and collaborating"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose MentorLink?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The easiest way to connect with experienced students and get authentic insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-gradient-card">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Verified Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  All mentors are verified students from top colleges with proven track records
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-gradient-card" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Book sessions at your convenience with instant confirmation and reminders
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-gradient-card" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Quality Assured</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Rate and review sessions to help maintain high-quality mentorship experiences
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start animate-fade-in">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Choose Your College</h3>
                <p className="text-muted-foreground text-lg">
                  Browse through our list of top colleges and universities across India
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Select a Mentor</h3>
                <p className="text-muted-foreground text-lg">
                  Review mentor profiles, ratings, and expertise to find your perfect match
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Book & Connect</h3>
                <p className="text-muted-foreground text-lg">
                  Schedule your session, make secure payment, and start your mentorship journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of students who have found their perfect mentors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" onClick={() => navigate("/colleges")} className="gap-2">
                Explore Colleges
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register-mentor")}
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MentorLink. Connecting aspirations with guidance.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

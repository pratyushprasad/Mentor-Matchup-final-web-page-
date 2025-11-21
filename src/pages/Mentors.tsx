import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BookingModal from "@/components/BookingModal";
import { useNavigate } from "react-router-dom";

const Mentors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch verified mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from("mentors")
          .select(`*, colleges (name)`)
          .eq('is_verified', true);

        if (mentorsError) throw mentorsError;

        if (!mentorsData || mentorsData.length === 0) {
          setMentors([]);
          setLoading(false);
          return;
        }

        // 2. Fetch application details for these mentors
        const userIds = mentorsData.map(m => m.id);
        const { data: appData, error: appError } = await supabase
          .from("mentor_applications")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds);

        if (appError) throw appError;

        // 3. Merge data
        const combinedData = mentorsData.map(mentor => {
          const app = appData?.find(a => a.user_id === mentor.id);
          return {
            ...mentor,
            mentor_applications: app ? [app] : []
          };
        });

        console.log("Fetched mentors:", combinedData);
        setMentors(combinedData);
      } catch (err: any) {
        console.error("Error fetching mentors:", err);
        toast.error("Failed to load mentors");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.mentor_applications?.[0]?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.colleges?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise?.some((exp: string) =>
        exp.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleBookSession = (mentor: any) => {
    setSelectedMentor(mentor);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = (date: Date, time: string) => {
    setIsBookingModalOpen(false);
    navigate("/payment", {
      state: {
        bookingDetails: {
          mentor: selectedMentor,
          date: date.toISOString(),
          time
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Connect with Mentors
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book 1-on-1 sessions with experienced students from top colleges
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, college, branch, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg shadow-medium"
            />
          </div>
        </div>

        {/* Mentor Grid */}
        {loading ? (
          <div className="text-center py-12">Loading mentors...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, index) => (
              <Card
                key={mentor.id}
                className="hover:shadow-large transition-all duration-300 hover:-translate-y-1 bg-gradient-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4 mb-2">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src="" alt={mentor.mentor_applications?.[0]?.full_name} />
                      <AvatarFallback>{mentor.mentor_applications?.[0]?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{mentor.mentor_applications?.[0]?.full_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {mentor.branch !== "Not Specified" && mentor.year !== "Not Specified" ? (
                          <>{mentor.branch} • {mentor.year}</>
                        ) : (
                          <span className="text-transparent select-none">.</span>
                        )}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mentor.colleges?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{mentor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{mentor.sessions_count} sessions</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-foreground">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise?.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{mentor.price_per_session}</p>
                      <p className="text-xs text-muted-foreground">per session</p>
                    </div>
                    <Button
                      onClick={() => handleBookSession(mentor)}
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No mentors found matching your search.
            </p>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        mentor={selectedMentor}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
};

export default Mentors;

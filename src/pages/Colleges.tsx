import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";



const Colleges = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("*");

      if (error) {
        console.error("Error fetching colleges:", error);
      } else {
        setColleges(data || []);
      }
      setLoading(false);
    };

    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Explore Top Colleges
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with mentors from India's leading educational institutions
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by college name, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg shadow-medium"
            />
          </div>
        </div>

        {/* College Grid */}
        {loading ? (
          <div className="text-center py-12">Loading colleges...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college, index) => (
              <Card
                key={college.id}
                className="hover:shadow-large transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate("/mentors")}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {college.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">120+</span> {/* Placeholder for now */}
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{college.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {college.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{college.description}</p>
                  <Button variant="outline" className="w-full group">
                    View Mentors
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredColleges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No colleges found matching your search.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Colleges;

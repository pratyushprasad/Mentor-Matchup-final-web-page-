import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { GraduationCap, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    const checkMentorStatus = async (userId: string) => {
      const { data } = await supabase
        .from('mentors')
        .select('id')
        .eq('id', userId)
        .single();
      setIsMentor(!!data);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkMentorStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkMentorStatus(session.user.id);
      } else {
        setIsMentor(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MentorLink</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Home
            </NavLink>
            <NavLink
              to="/colleges"
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Colleges
            </NavLink>
            <NavLink
              to="/mentors"
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Find Mentors
            </NavLink>

            {user && (
              <NavLink
                to="/upcoming-sessions"
                className="text-foreground hover:text-primary transition-colors"
                activeClassName="text-primary font-semibold"
              >
                Chat with Mentor
              </NavLink>
            )}

            {user ? (
              <Button variant="ghost" onClick={handleLogout}>
                Log Out
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => window.location.href = '/login'}>
                Log In
              </Button>
            )}

            {isMentor ? (
              <Button onClick={() => window.location.href = '/mentor-dashboard'}>
                Mentor Panel
              </Button>
            ) : (
              <Button onClick={() => window.location.href = '/register-mentor'}>
                Become a Mentor
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            <NavLink
              to="/"
              className="block text-foreground hover:text-primary transition-colors py-2"
              activeClassName="text-primary font-semibold"
            >
              Home
            </NavLink>
            <NavLink
              to="/colleges"
              className="block text-foreground hover:text-primary transition-colors py-2"
              activeClassName="text-primary font-semibold"
            >
              Colleges
            </NavLink>
            <NavLink
              to="/mentors"
              className="block text-foreground hover:text-primary transition-colors py-2"
              activeClassName="text-primary font-semibold"
            >
              Find Mentors
            </NavLink>
            <div className="space-y-2 pt-2">
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </Button>
              )}
              {isMentor ? (
                <Button
                  className="w-full"
                  onClick={() => window.location.href = '/mentor-dashboard'}
                >
                  Mentor Panel
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => window.location.href = '/register-mentor'}
                >
                  Become a Mentor
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

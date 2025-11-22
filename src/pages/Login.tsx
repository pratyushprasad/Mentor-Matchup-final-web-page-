import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { GraduationCap } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Redirect authenticated users
        if (session?.user) {
          setTimeout(() => {
            navigate("/");
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Logged in successfully!");
      // Navigation is handled by onAuthStateChange
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please log in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created successfully!");
      // Navigation is handled by onAuthStateChange
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>Login or Sign Up</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      onClick={handleLogin}
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : "Log In"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleSignup}
                      disabled={loading}
                    >
                      Create New Account
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Want to become a mentor?{" "}
                    <button
                      onClick={() => navigate("/register-mentor")}
                      className="text-primary hover:underline font-semibold"
                    >
                      Register as a Mentor
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Guide Card - Visible on Large Screens */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="bg-primary/5 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  👋 New to MentorLink?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Creating an account is easy! You don't need to go to a separate page.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-primary/10 space-y-2">
                  <p className="font-medium text-foreground">How to Register:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Enter the <strong>email</strong> you want to register with.</li>
                    <li>Enter the <strong>password</strong> you want to set.</li>
                    <li>Click the <strong>Create New Account</strong> button.</li>
                  </ol>
                </div>
                <p className="text-sm">
                  That's it! You'll be instantly registered and logged in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

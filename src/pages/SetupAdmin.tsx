import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SetupAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const makeMeAdmin = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Check if already admin
            const { data: existingRole } = await supabase
                .from("user_roles")
                .select("*")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .single();

            if (existingRole) {
                toast.success("You are already an admin!");
                navigate("/admin");
                return;
            }

            // 2. Insert admin role
            const { error } = await supabase
                .from("user_roles")
                .insert({
                    user_id: user.id,
                    role: "admin"
                });

            if (error) {
                console.error("Error:", error);
                toast.error("Failed to assign role. Database might be locked (RLS).");
                toast.info("Please use the SQL script method instead.");
            } else {
                toast.success("Success! You are now an admin.");
                navigate("/admin");
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <h1 className="text-3xl font-bold">Admin Setup</h1>
                <p className="text-muted-foreground">
                    Current User: {user ? user.email : "Not logged in"}
                </p>

                {user ? (
                    <Button
                        size="lg"
                        onClick={makeMeAdmin}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Processing..." : "Make Me Admin"}
                    </Button>
                ) : (
                    <Button onClick={() => navigate("/login")}>
                        Log In First
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SetupAdmin;

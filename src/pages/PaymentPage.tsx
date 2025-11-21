import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { CheckCircle2, CreditCard } from "lucide-react";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails } = location.state || {};
    const [loading, setLoading] = useState(false);

    if (!bookingDetails) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold text-destructive">Invalid Booking Details</h2>
                    <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
                </div>
            </div>
        );
    }

    const { mentor, date, time } = bookingDetails;

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to book a session");
                navigate("/login");
                return;
            }

            // Combine date and time into a single ISO string
            const sessionDate = new Date(date);
            // Parse time (e.g., "10:00 AM")
            const [timePart, modifier] = time.split(' ');
            let [hours, minutes] = timePart.split(':');
            if (hours === '12') {
                hours = '00';
            }
            if (modifier === 'PM') {
                hours = parseInt(hours, 10) + 12;
            }
            sessionDate.setHours(parseInt(hours), parseInt(minutes));

            const { error } = await supabase
                .from("bookings")
                .insert({
                    mentor_id: mentor.id,
                    student_id: user.id,
                    session_time: sessionDate.toISOString(),
                    duration_minutes: 15, // Default to 15 minutes
                    amount_paid: mentor.price_per_session,
                    status: "confirmed" // Mock payment success
                });

            if (error) throw error;

            toast.success("Booking confirmed!", {
                description: "You will receive a confirmation email shortly."
            });

            navigate("/");
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error(error.message || "Failed to process booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Complete Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-secondary/30 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mentor</span>
                                <span className="font-medium">{mentor.profiles?.full_name || mentor.mentor_applications?.[0]?.full_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time</span>
                                <span className="font-medium">{time}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="font-semibold">Total Amount</span>
                                <span className="text-2xl font-bold text-primary">₹{mentor.price_per_session}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg flex items-center gap-4 bg-card">
                                <CreditCard className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-medium">Mock Payment Gateway</p>
                                    <p className="text-xs text-muted-foreground">No actual charge will be made</p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                            </div>

                            <Button
                                className="w-full text-lg py-6"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>Pay ₹{mentor.price_per_session}</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PaymentPage;

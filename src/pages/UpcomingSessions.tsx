import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";

const UpcomingSessions = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedMentor, setSelectedMentor] = useState<any>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    window.location.href = '/login';
                    return;
                }
                setUserId(user.id);

                // Fetch bookings for this student
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        mentors:mentor_id (
                            id,
                            profiles (
                                id,
                                full_name,
                                email
                            )
                        )
                    `)
                    .eq('student_id', user.id)
                    .order('session_time', { ascending: true });

                if (bookingsError) throw bookingsError;

                // Filter out duplicate mentors
                const uniqueMentors = new Map();
                bookingsData?.forEach((booking: any) => {
                    if (booking.mentors && booking.mentors.profiles) {
                        uniqueMentors.set(booking.mentors.id, booking.mentors);
                    }
                });

                setBookings(Array.from(uniqueMentors.values()));
            } catch (error: any) {
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load sessions: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Chat with Mentor</h1>
                    <p className="text-muted-foreground">Chat with your mentors for upcoming sessions</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                    {/* Mentor List */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Mentors</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                {bookings.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No upcoming sessions found.
                                    </div>
                                ) : (
                                    bookings.map((mentor: any) => (
                                        <div
                                            key={mentor.id}
                                            onClick={() => setSelectedMentor(mentor)}
                                            className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3 ${selectedMentor?.id === mentor.id ? "bg-muted" : ""
                                                }`}
                                        >
                                            <Avatar>
                                                <AvatarFallback>{mentor.profiles.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <div className="font-medium truncate">{mentor.profiles.full_name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{mentor.profiles.email}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <div className="md:col-span-2">
                        {selectedMentor ? (
                            <ChatInterface
                                currentUserId={userId!}
                                otherUserId={selectedMentor.profiles.id}
                                otherUserName={selectedMentor.profiles.full_name}
                                otherUserEmail={selectedMentor.profiles.email}
                            />
                        ) : (
                            <Card className="h-full flex items-center justify-center text-muted-foreground">
                                Select a mentor to start chatting
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpcomingSessions;

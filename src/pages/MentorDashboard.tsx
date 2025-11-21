import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Calendar, DollarSign, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInterface from "@/components/ChatInterface";

const MentorDashboard = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mentorId, setMentorId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    useEffect(() => {
        const fetchMentorData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    window.location.href = '/login';
                    return;
                }

                // Verify user is a mentor
                const { data: mentorData, error: mentorError } = await supabase
                    .from('mentors')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (mentorError || !mentorData) {
                    toast.error("Access denied. Mentor profile not found.");
                    window.location.href = '/';
                    return;
                }

                setMentorId(mentorData.id);

                // Fetch bookings for this mentor
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
            *,
            profiles:student_id (
              id,
              full_name,
              email
            )
          `)
                    .eq('mentor_id', mentorData.id)
                    .order('session_time', { ascending: true });

                if (bookingsError) throw bookingsError;

                setBookings(bookingsData || []);
            } catch (error: any) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchMentorData();
    }, []);

    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.amount_paid || 0), 0);
    const upcomingSessions = bookings.filter(b => new Date(b.session_time) > new Date()).length;

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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mentor Dashboard</h1>
                    <p className="text-muted-foreground">Manage your sessions and track your earnings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalEarnings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{upcomingSessions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookings.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No bookings found yet.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div className="font-medium">{booking.profiles?.full_name || "Unknown"}</div>
                                                <div className="text-xs text-muted-foreground">{booking.profiles?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(booking.session_time), "PPP p")}
                                            </TableCell>
                                            <TableCell>
                                                {booking.duration_minutes} mins
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{booking.amount_paid}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Messages Section */}
                <div className="mt-8 grid md:grid-cols-3 gap-6 h-[600px]">
                    {/* Student List */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                {Array.from(new Set(bookings.map(b => b.student_id)))
                                    .map(studentId => {
                                        const booking = bookings.find(b => b.student_id === studentId);
                                        if (!booking || !booking.profiles) return null;
                                        return booking;
                                    })
                                    .filter(Boolean)
                                    .map((booking: any) => (
                                        <div
                                            key={booking.student_id}
                                            onClick={() => setSelectedStudent(booking.profiles)}
                                            className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3 ${selectedStudent?.id === booking.student_id ? "bg-muted" : ""
                                                }`}
                                        >
                                            <Avatar>
                                                <AvatarFallback>{booking.profiles.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <div className="font-medium truncate">{booking.profiles.full_name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{booking.profiles.email}</div>
                                            </div>
                                        </div>
                                    ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <div className="md:col-span-2">
                        {selectedStudent ? (
                            <ChatInterface
                                currentUserId={mentorId!}
                                otherUserId={selectedStudent.id}
                                otherUserName={selectedStudent.full_name}
                                otherUserEmail={selectedStudent.email}
                            />
                        ) : (
                            <Card className="h-full flex items-center justify-center text-muted-foreground">
                                Select a student to start chatting
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MentorDashboard;

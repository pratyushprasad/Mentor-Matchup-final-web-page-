import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const BookingHistory = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        const { data, error } = await supabase
            .from("bookings")
            .select(`
        *,
        mentors (
          profiles (full_name)
        ),
        profiles (
          full_name,
          email
        )
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching bookings:", error);
            setError(error.message);
            toast.error("Failed to fetch bookings: " + error.message);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Booking History</h2>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mentor</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.mentors?.profiles?.full_name}</TableCell>
                                <TableCell>
                                    <div>{booking.profiles?.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{booking.profiles?.email}</div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(booking.session_time), "PPP p")}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    ₹{booking.amount_paid}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default BookingHistory;

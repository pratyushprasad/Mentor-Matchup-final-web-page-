import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, FileText, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        colleges: 0,
        mentors: 0,
        applications: 0,
        bookings: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const [
                { count: collegesCount },
                { count: mentorsCount },
                { count: applicationsCount },
                { count: bookingsCount }
            ] = await Promise.all([
                supabase.from("colleges").select("*", { count: "exact", head: true }),
                supabase.from("mentors").select("*", { count: "exact", head: true }),
                supabase.from("mentor_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
                supabase.from("bookings").select("*", { count: "exact", head: true })
            ]);

            setStats({
                colleges: collegesCount || 0,
                mentors: mentorsCount || 0,
                applications: applicationsCount || 0,
                bookings: bookingsCount || 0,
            });
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Colleges", value: stats.colleges, icon: School, color: "text-blue-500" },
        { title: "Active Mentors", value: stats.mentors, icon: Users, color: "text-green-500" },
        { title: "Pending Applications", value: stats.applications, icon: FileText, color: "text-orange-500" },
        { title: "Total Bookings", value: stats.bookings, icon: Calendar, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your platform's performance</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;

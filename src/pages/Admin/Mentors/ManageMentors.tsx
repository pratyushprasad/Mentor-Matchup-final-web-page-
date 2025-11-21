import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

const ManageMentors = () => {
    const [mentors, setMentors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMentor, setCurrentMentor] = useState<any>(null);
    const [formData, setFormData] = useState({
        branch: "",
        year: "",
        price_per_session: 0,
        expertise: "",
        rating: 0,
        sessions_count: 0,
    });

    const fetchMentors = async () => {
        setLoading(true);
        try {
            // 1. Fetch mentors with college info
            const { data: mentorsData, error: mentorsError } = await supabase
                .from("mentors")
                .select(`*, colleges (name)`);

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
                .select("user_id, full_name, email")
                .in("user_id", userIds);

            if (appError) throw appError;

            // 3. Merge data
            const combinedData = mentorsData.map(mentor => {
                const app = appData?.find(a => a.user_id === mentor.id);
                return {
                    ...mentor,
                    profiles: app ? { full_name: app.full_name, email: app.email } : { full_name: "Unknown", email: "Unknown" }
                };
            });

            setMentors(combinedData);
        } catch (error: any) {
            toast.error("Failed to fetch mentors");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from("mentors")
                .update({
                    ...formData,
                    expertise: formData.expertise.split(",").map(s => s.trim()).filter(Boolean)
                })
                .eq("id", currentMentor.id);

            if (error) throw error;
            toast.success("Mentor updated successfully");

            setIsDialogOpen(false);
            fetchMentors();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this mentor? This will revert them to a student account.")) return;

        try {
            // 1. Reset User Role to 'student'
            const { error: roleError } = await supabase
                .from("user_roles")
                .update({ role: "student" })
                .eq("user_id", id);

            if (roleError) {
                console.error("Error resetting role:", roleError);
                throw new Error("Failed to reset user role");
            }

            // 2. Delete Mentor Application
            const { error: appError } = await supabase
                .from("mentor_applications")
                .delete()
                .eq("user_id", id);

            if (appError) {
                console.error("Error deleting application:", appError);
                // Continue even if application delete fails (might not exist)
            }

            // 3. Delete Mentor Record
            const { error: mentorError } = await supabase
                .from("mentors")
                .delete()
                .eq("id", id);

            if (mentorError) throw mentorError;

            toast.success("Mentor removed and account reverted to student");
            fetchMentors();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove mentor");
        }
    };

    const openEdit = (mentor: any) => {
        setCurrentMentor(mentor);
        setFormData({
            branch: mentor.branch || "",
            year: mentor.year || "",
            price_per_session: mentor.price_per_session || 0,
            expertise: mentor.expertise?.join(", ") || "",
            rating: mentor.rating || 0,
            sessions_count: mentor.sessions_count || 0,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Mentors</h2>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Sessions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mentors.map((mentor) => (
                            <TableRow key={mentor.id}>
                                <TableCell className="font-medium">{mentor.profiles?.full_name}</TableCell>
                                <TableCell>{mentor.colleges?.name}</TableCell>
                                <TableCell>{mentor.branch}</TableCell>
                                <TableCell>₹{mentor.price_per_session}</TableCell>
                                <TableCell>{mentor.rating}/5</TableCell>
                                <TableCell>{mentor.sessions_count}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(mentor)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(mentor.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Mentor: {currentMentor?.profiles?.full_name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch</Label>
                                <Input
                                    id="branch"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expertise">Expertise (comma separated)</Label>
                            <Input
                                id="expertise"
                                value={formData.expertise}
                                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                placeholder="e.g. Python, React, Career Guidance"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price_per_session}
                                    onChange={(e) => setFormData({ ...formData, price_per_session: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating (0-5)</Label>
                                <Input
                                    id="rating"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sessions">Sessions</Label>
                                <Input
                                    id="sessions"
                                    type="number"
                                    min="0"
                                    value={formData.sessions_count}
                                    onChange={(e) => setFormData({ ...formData, sessions_count: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            Update Mentor
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageMentors;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, RefreshCw, Loader2, FileText, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MentorApplications = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [colleges, setColleges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Approval/Edit Modal State
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [selectedCollege, setSelectedCollege] = useState<string>("");
    const [fee, setFee] = useState<string>("0");
    const [approving, setApproving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("mentor_applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching applications:", error);
            setError(error.message);
            toast.error("Failed to fetch applications");
            setApplications([]);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    };

    const fetchColleges = async () => {
        const { data, error } = await supabase
            .from("colleges")
            .select("*")
            .order("name");

        if (error) {
            console.error("Error fetching colleges:", error);
        } else {
            setColleges(data || []);
        }
    };

    useEffect(() => {
        fetchApplications();
        fetchColleges();
    }, []);

    const handleApproveClick = (app: any) => {
        setSelectedApp(app);
        setSelectedCollege("");
        setFee("0");
        setIsEditing(false);
        setIsApproveDialogOpen(true);
    };

    const handleEditClick = async (app: any) => {
        setSelectedApp(app);
        setIsEditing(true);

        // Fetch existing mentor data
        const { data: mentorData, error } = await supabase
            .from("mentors")
            .select("college_id, price_per_session")
            .eq("id", app.user_id)
            .single();

        if (error) {
            console.error("Error fetching mentor details:", error);
            toast.error("Could not load current mentor details");
            // Still open dialog but with defaults
            setSelectedCollege("");
            setFee("0");
        } else {
            setSelectedCollege(mentorData.college_id?.toString() || "");
            setFee(mentorData.price_per_session?.toString() || "0");
        }

        setIsApproveDialogOpen(true);
    };

    const handleReject = async (id: number, userId: string) => {
        try {
            const { error } = await supabase
                .from("mentor_applications")
                .update({ status: 'rejected' })
                .eq("id", id);

            if (error) throw error;
            toast.success("Application rejected");
            fetchApplications();
        } catch (error: any) {
            console.error("Error rejecting application:", error);
            toast.error("Failed to reject application");
        }
    };

    const confirmApproval = async () => {
        if (!selectedApp || !selectedCollege) {
            toast.error("Please select a college");
            return;
        }

        setApproving(true);
        try {
            const userId = selectedApp.user_id;

            // 1. Update application status (if not already approved)
            if (selectedApp.status !== 'approved') {
                const { error: appError } = await supabase
                    .from("mentor_applications")
                    .update({ status: 'approved' })
                    .eq("id", selectedApp.id);

                if (appError) throw appError;
            }

            // 2. Create/Update mentor entry with assigned college and fee
            const { error: mentorError } = await supabase
                .from("mentors")
                .upsert({
                    id: userId,
                    college_id: parseInt(selectedCollege),
                    is_verified: true,
                    rating: 5.0,
                    sessions_count: 0,
                    price_per_session: parseInt(fee) || 0,
                    branch: "Not Specified",
                    year: "Not Specified"
                }, {
                    onConflict: 'id'
                });

            if (mentorError) throw mentorError;

            // 3. Update user role
            const { error: roleError } = await supabase
                .from("user_roles")
                .update({ role: "senior" })
                .eq("user_id", userId);

            if (roleError) console.error("Role update warning:", roleError);

            toast.success(isEditing ? "Mentor details updated!" : "Application approved and mentor assigned!");
            setIsApproveDialogOpen(false);
            fetchApplications();
        } catch (error: any) {
            console.error("Approval error:", error);
            toast.error(error.message || "Failed to save mentor details");
        } finally {
            setApproving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mentor Applications</h2>
                    <p className="text-muted-foreground mt-1">Review and manage mentor applications</p>
                </div>
                <Button
                    onClick={fetchApplications}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading applications...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <X className="h-12 w-12 text-destructive" />
                            <p className="font-semibold">Error loading applications</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                            <Button onClick={fetchApplications} variant="outline" size="sm" className="mt-2">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : applications.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <p className="font-semibold">No applications yet</p>
                            <p className="text-sm text-muted-foreground">
                                Mentor applications will appear here once submitted
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>College (Requested)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.full_name}</TableCell>
                                    <TableCell>{app.email}</TableCell>
                                    <TableCell>{app.phone || 'N/A'}</TableCell>
                                    <TableCell>{app.college_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {app.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="default" onClick={() => handleApproveClick(app)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(app.id, app.user_id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {app.status === 'approved' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEditClick(app)}>
                                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Mentor Details' : 'Approve Mentor Application'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? `Update college assignment and fee for ${selectedApp?.full_name}.`
                                : `Assign a college and set the session fee for ${selectedApp?.full_name}.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="college">Assign College</Label>
                            <Select onValueChange={setSelectedCollege} value={selectedCollege}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a college" />
                                </SelectTrigger>
                                <SelectContent>
                                    {colleges.map((college) => (
                                        <SelectItem key={college.id} value={college.id.toString()}>
                                            {college.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fee">Session Fee (₹)</Label>
                            <Input
                                id="fee"
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                placeholder="500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmApproval} disabled={approving}>
                            {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Details' : 'Confirm Approval'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MentorApplications;

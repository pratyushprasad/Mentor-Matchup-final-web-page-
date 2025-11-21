import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

const ManageColleges = () => {
    const [colleges, setColleges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCollege, setCurrentCollege] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        category: "",
        description: "",
    });

    const fetchColleges = async () => {
        const { data, error } = await supabase
            .from("colleges")
            .select("*")
            .order("name");

        if (error) {
            toast.error("Failed to fetch colleges");
        } else {
            setColleges(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchColleges();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCollege) {
                const { error } = await supabase
                    .from("colleges")
                    .update(formData)
                    .eq("id", currentCollege.id);

                if (error) throw error;
                toast.success("College updated successfully");
            } else {
                const { error } = await supabase
                    .from("colleges")
                    .insert(formData);

                if (error) throw error;
                toast.success("College added successfully");
            }

            setIsDialogOpen(false);
            fetchColleges();
            resetForm();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this college?")) return;

        try {
            const { error } = await supabase
                .from("colleges")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("College deleted successfully");
            fetchColleges();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEdit = (college: any) => {
        setCurrentCollege(college);
        setFormData({
            name: college.name,
            location: college.location,
            category: college.category,
            description: college.description || "",
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentCollege(null);
        setFormData({
            name: "",
            location: "",
            category: "",
            description: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Colleges</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add College
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentCollege ? "Edit College" : "Add New College"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {currentCollege ? "Update" : "Create"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {colleges.map((college) => (
                            <TableRow key={college.id}>
                                <TableCell className="font-medium">{college.name}</TableCell>
                                <TableCell>{college.location}</TableCell>
                                <TableCell>{college.category}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(college)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(college.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ManageColleges;

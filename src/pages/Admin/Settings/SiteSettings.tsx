import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SiteSettings {
    id: number;
    active_mentors: string;
    top_colleges: string;
    average_rating: string;
}

const SiteSettings = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<SiteSettings | null>(null);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["site_settings"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .single();

            if (error) throw error;
            return data as SiteSettings;
        },
    });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const updateSettings = useMutation({
        mutationFn: async (newSettings: SiteSettings) => {
            const { error } = await supabase
                .from("site_settings")
                .update({
                    active_mentors: newSettings.active_mentors,
                    top_colleges: newSettings.top_colleges,
                    average_rating: newSettings.average_rating,
                })
                .eq("id", newSettings.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["site_settings"] });
            toast.success("Settings updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update settings: " + error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            updateSettings.mutate(formData);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Site Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Homepage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Active Mentors</label>
                                <Input
                                    value={formData.active_mentors}
                                    onChange={(e) =>
                                        setFormData({ ...formData, active_mentors: e.target.value })
                                    }
                                    placeholder="e.g. 500+"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Top Colleges</label>
                                <Input
                                    value={formData.top_colleges}
                                    onChange={(e) =>
                                        setFormData({ ...formData, top_colleges: e.target.value })
                                    }
                                    placeholder="e.g. 50+"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Average Rating</label>
                                <Input
                                    value={formData.average_rating}
                                    onChange={(e) =>
                                        setFormData({ ...formData, average_rating: e.target.value })
                                    }
                                    placeholder="e.g. 4.8/5"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={updateSettings.isPending}>
                            {updateSettings.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {!updateSettings.isPending && <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SiteSettings;

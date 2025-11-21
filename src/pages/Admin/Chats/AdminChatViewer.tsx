import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { toast } from "sonner";

const AdminChatViewer = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setCurrentAdminId(user.id);

                // Fetch all messages to group them into conversations
                // Note: This is not efficient for large datasets, but works for this requirement
                const { data: messages, error } = await supabase
                    .from('messages' as any)
                    .select(`
                        sender_id,
                        receiver_id,
                        created_at,
                        sender:sender_id (full_name, email),
                        receiver:receiver_id (full_name, email)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const conversationMap = new Map();

                messages?.forEach((msg: any) => {
                    // Create a unique key for the conversation (sorted ids)
                    const participants = [msg.sender_id, msg.receiver_id].sort();
                    const key = participants.join('-');

                    if (!conversationMap.has(key)) {
                        conversationMap.set(key, {
                            key,
                            participants,
                            lastMessageDate: msg.created_at,
                            user1: msg.sender,
                            user2: msg.receiver,
                            user1Id: msg.sender_id,
                            user2Id: msg.receiver_id
                        });
                    }
                });

                setConversations(Array.from(conversationMap.values()));
            } catch (error: any) {
                console.error("Error fetching conversations:", error);
                toast.error("Failed to load chats");
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">All Chats</h1>
                <p className="text-muted-foreground">Monitor conversations between mentors and students</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No conversations found.
                                </div>
                            ) : (
                                conversations.map((conv: any) => (
                                    <div
                                        key={conv.key}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.key === conv.key ? "bg-muted" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>{conv.user1?.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium truncate">{conv.user1?.full_name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-center my-1">vs</div>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>{conv.user2?.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium truncate">{conv.user2?.full_name}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground text-right mt-2">
                                            {new Date(conv.lastMessageDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Viewer */}
                <div className="md:col-span-2">
                    {selectedConversation ? (
                        <ChatInterface
                            currentUserId={selectedConversation.user1Id}
                            otherUserId={selectedConversation.user2Id}
                            otherUserName={selectedConversation.user2?.full_name}
                            otherUserEmail={selectedConversation.user2?.email}
                            isAdminView={true}
                        />
                    ) : (
                        <Card className="h-full flex items-center justify-center text-muted-foreground">
                            Select a conversation to view
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChatViewer;

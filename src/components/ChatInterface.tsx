import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

interface ChatInterfaceProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserEmail?: string;
    isAdminView?: boolean;
}

const ChatInterface = ({ currentUserId, otherUserId, otherUserName, otherUserEmail, isAdminView = false }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data, error } = await (supabase
                    .from("messages" as any)
                    .select("*") as any)
                    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
                    .order("created_at", { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${currentUserId}-${otherUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    // Filter messages for this conversation
                    if (
                        (newMessage.sender_id === currentUserId && newMessage.receiver_id === otherUserId) ||
                        (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUserId)
                    ) {
                        setMessages((prev) => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === newMessage.id)) return prev;
                            return [...prev, newMessage];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, otherUserId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const { error } = await (supabase.from("messages" as any) as any).insert({
                sender_id: currentUserId,
                receiver_id: otherUserId,
                content: newMessage.trim(),
            });

            if (error) throw error;

            // Optimistic update is handled by subscription usually, but we can fetch or wait
            // Since we fixed subscription, it should appear. 
            // But to be safe and fast:
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherUserName}`} />
                        <AvatarFallback>{otherUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold">{otherUserName}</div>
                        {otherUserEmail && <div className="text-xs text-muted-foreground">{otherUserEmail}</div>}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-10">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-2 ${isMe
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <span className="text-[10px] opacity-70 block text-right mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                {!isAdminView && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default ChatInterface;

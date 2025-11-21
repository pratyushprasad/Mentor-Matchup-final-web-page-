-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can view their own messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- 2. Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

-- 3. Receivers can mark messages as read
CREATE POLICY "Receivers can mark messages as read"
ON public.messages
FOR UPDATE
USING (
    auth.uid() = receiver_id
)
WITH CHECK (
    auth.uid() = receiver_id
);

-- 4. Admins can view ALL messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

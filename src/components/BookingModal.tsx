import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentor: any;
    onConfirm: (date: Date, time: string) => void;
}

const BookingModal = ({ isOpen, onClose, mentor, onConfirm }: BookingModalProps) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>("");

    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
    ];

    const handleConfirm = () => {
        if (date && time) {
            onConfirm(date, time);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Session with {mentor?.profiles?.full_name || mentor?.mentor_applications?.[0]?.full_name}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Select Date</label>
                        <div className="border rounded-md p-2 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Select Time</label>
                        <Select onValueChange={setTime}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg mt-2">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Price per session</span>
                            <span className="font-bold">₹{mentor?.price_per_session}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>₹{mentor?.price_per_session}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!date || !time}>
                        Proceed to Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;

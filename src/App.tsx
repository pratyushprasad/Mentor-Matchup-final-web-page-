import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Colleges from "./pages/Colleges";
import Mentors from "./pages/Mentors";
import Login from "./pages/Login";
import RegisterMentor from "./pages/RegisterMentor";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageColleges from "./pages/Admin/Colleges/ManageColleges";
import ManageMentors from "./pages/Admin/Mentors/ManageMentors";
import MentorApplications from "./pages/Admin/Applications/MentorApplications";
import BookingHistory from "./pages/Admin/Bookings/BookingHistory";
import SetupAdmin from "./pages/SetupAdmin";
import SiteSettings from "./pages/Admin/Settings/SiteSettings";
import AdminChatViewer from "./pages/Admin/Chats/AdminChatViewer";
import PaymentPage from "./pages/PaymentPage";
import MentorDashboard from "./pages/MentorDashboard";
import UpcomingSessions from "./pages/UpcomingSessions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-mentor" element={<RegisterMentor />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/upcoming-sessions" element={<UpcomingSessions />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="colleges" element={<ManageColleges />} />
            <Route path="mentors" element={<ManageMentors />} />
            <Route path="applications" element={<MentorApplications />} />
            <Route path="applications" element={<MentorApplications />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="chats" element={<AdminChatViewer />} />
            <Route path="settings" element={<SiteSettings />} />
          </Route>

          <Route path="/setup-admin" element={<SetupAdmin />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

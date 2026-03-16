import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from "@/components/Navbar";
import ChatbotButton from "@/components/ChatbotButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SelectRole from "./pages/SelectRole";
import StudentDashboard from "./pages/StudentDashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetail from "./pages/CourseDetail";
import MyCourses from "./pages/MyCourses";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherAssignments from "./pages/TeacherAssignments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { user, needsRole, signOut } = useAuth();
  const role = user?.role;

  const isHomeOrLogin = location.pathname === "/" || location.pathname === "/login";
  const bgClass = isHomeOrLogin ? "bg-background" : "bg-app-pattern";

  const isAuthenticatedRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/courses") ||
    location.pathname.startsWith("/my-courses") ||
    location.pathname.startsWith("/assignments") ||
    location.pathname.startsWith("/notes") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/teacher");

  const showChatbot = isAuthenticatedRoute && !!user;

  // Redirect users who need a role to the selection page
  if (user && needsRole && location.pathname !== "/select-role") {
    return (
      <div className={`min-h-screen ${bgClass}`}>
        <Navbar userRole={role} onLogout={signOut} />
        <Routes>
          <Route path="*" element={<Navigate to="/select-role" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Navbar userRole={role} onLogout={signOut} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={needsRole ? "/select-role" : role === "teacher" ? "/teacher/dashboard" : "/dashboard"} replace /> : <Login />} />
        <Route path="/select-role" element={user ? (needsRole ? <SelectRole /> : <Navigate to={role === "teacher" ? "/teacher/dashboard" : "/dashboard"} replace />) : <Navigate to="/login" replace />} />
        {/* Student */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/my-courses" element={<ProtectedRoute allowedRole="student"><MyCourses /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute allowedRole="student"><Assignments /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute allowedRole="teacher"><TeacherCourses /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRole="teacher"><TeacherAssignments /></ProtectedRoute>} />
        <Route path="/teacher/notes" element={<ProtectedRoute allowedRole="teacher"><Notes /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showChatbot && <ChatbotButton />}
    </div>
  );
}

// import { SessionProvider } from "next-auth/react";
const App = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "520343785570-pjns71qj9uvra3sjisun8or9jua627b6.apps.googleusercontent.com"}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
// ... rest of the file

export default App;

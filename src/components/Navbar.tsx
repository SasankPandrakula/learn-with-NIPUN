import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Bell, Settings } from "lucide-react";

interface NavbarProps {
  userRole: "student" | "teacher" | null;
  onLogout?: () => void;
}

const Navbar = ({ userRole, onLogout }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/courses", label: "Courses" },
    { path: "/my-courses", label: "My Courses" },
    { path: "/assignments", label: "Assignments" },
    { path: "/notes", label: "Notes" },
  ];

  const teacherLinks = [
    { path: "/teacher/dashboard", label: "Dashboard" },
    { path: "/teacher/courses", label: "My Courses" },
    { path: "/teacher/assignments", label: "Assignments" },
    { path: "/teacher/notes", label: "Notes" },
  ];

  const links = userRole === "teacher" ? teacherLinks : userRole === "student" ? studentLinks : [];

  return (
    <nav className="sticky top-0 z-50 glass-navbar shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-yellow-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src="/icon-192.png" 
              alt="Learn With Nipun Logo" 
              className="relative h-[52px] w-[52px] sm:h-[64px] sm:w-[64px] object-contain rounded-xl shadow-xl ring-2 ring-white/20 logo-glow" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight leading-none">
              <span className="text-[#0A2558]">Learn With </span>
              <span className="bg-gradient-to-r from-[#00A5B5] to-[#F4A71D] bg-clip-text text-transparent">
                Nipun
              </span>
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00A5B5]/80 mt-1">
              Excellence in Coding
            </span>
          </div>
        </Link>
        {/* Desktop */}
        {userRole && (
          <div className="hidden md:flex items-center">
            <div className="tabs-container">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`tab-item ${
                    isActive(link.path)
                      ? "tab-item-active"
                      : "text-primary/80 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {userRole ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent/50">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-xl hover:bg-accent/50">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block" />
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1.5 text-muted-foreground font-semibold hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="font-semibold px-5 rounded-xl">
                Log in
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/login")} className="h-10 px-6 rounded-xl font-bold">
                Get Started
              </Button>
            </div>
          )}
          {userRole && (
            <button className="ml-1 md:hidden p-2 rounded-xl bg-accent/50" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && userRole && (
        <div className="border-t border-border/50 bg-card/95 backdrop-blur-md px-4 py-4 md:hidden animate-fade-in shadow-2xl">
          <div className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive(link.path) 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

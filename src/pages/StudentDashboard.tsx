import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface EnrolledCourse {
  _id: string;
  title: string;
  progress: number;
  lesson_count: number;
  completed: number;
}

interface UpcomingAssignment {
  id: string;
  title: string;
  course_title: string;
  due_date: string | null;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/student/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
        setAssignments(data.assignments);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("An error occurred while fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    { label: "Enrolled Courses", value: String(courses.length), icon: BookOpen, color: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white", glow: "shadow-cyan-500/25" },
    { label: "Lessons Done", value: String(courses.reduce((s, c) => s + c.completed, 0)), icon: Clock, color: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white", glow: "shadow-yellow-500/25" },
    { label: "Assignments", value: String(assignments.length), icon: Award, color: "bg-gradient-to-br from-green-500 to-green-600 text-white", glow: "shadow-green-500/25" },
    { label: "Avg Progress", value: courses.length > 0 ? `${Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)}%` : "0%", icon: TrendingUp, color: "bg-gradient-to-br from-purple-500 to-purple-600 text-white", glow: "shadow-purple-500/25" },
  ];

  const DailyStreak = () => {
    const { streak, remainingMs, hasIncrementedToday } = useAuth();

    const formatTime = (ms: number) => {
      const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
    };

    return (
      <div className="flex flex-col items-end gap-4 w-full max-w-xs">
        <div className="relative flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-400/15 to-indigo-500/25 shadow-lg" />
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white/50 backdrop-blur-md border border-white/50">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Streak</span>
            <span className="text-3xl font-black text-foreground">{streak}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">days</span>
          </div>
        </div>
        <div className="rounded-full bg-white/70 px-4 py-1.5 shadow-sm ring-1 ring-white/40 min-w-[140px] text-center">
          {hasIncrementedToday ? (
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Claimed for today!</p>
          ) : (
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Time Remaining</p>
              <p className="text-sm font-mono font-black text-foreground">{formatTime(remainingMs)}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/20 to-yellow-50/20">
        <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient bg-gradient-primary bg-clip-text mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground text-lg">Continue where you left off</p>
          </div>
          <div className="lg:mr-[38px]">
            <DailyStreak />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="body-glass rounded-2xl border border-white/50 p-5 hover:scale-[1.02] transition-all duration-300 shadow-sm">
              <div className={`mb-3 inline-flex rounded-xl p-3 ${stat.color} shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-4 font-display text-xl font-bold text-gradient bg-gradient-primary bg-clip-text">My Courses</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} onClick={() => navigate(`/courses/${course._id}`)} className="body-glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                    <span className="text-sm font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="mb-3 h-3 bg-muted" />
                  <p className="text-sm text-muted-foreground font-medium">{course.completed || 0}/{course.lesson_count || 0} lessons completed</p>
                  <div className="mt-3 h-1 w-full bg-gradient-to-r from-cyan-200 to-yellow-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${course.progress || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 font-display text-xl font-bold text-gradient bg-gradient-primary bg-clip-text">Upcoming Assignments</h2>
            <div className="space-y-4">
              {assignments.map((a) => (
                <div key={a.id} className="body-glass rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300">
                  <h3 className="font-bold text-foreground text-base mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-2">{a.course_title}</p>
                  <p className="text-sm text-secondary font-bold">{a.due_date ? `Due: ${format(new Date(a.due_date), "MMM d, yyyy")}` : "No due date"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

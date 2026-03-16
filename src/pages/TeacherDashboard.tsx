import { useState, useEffect, useCallback } from "react";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  pendingReviews: number;
  avgCompletion: number;
}

interface AssignmentProgress {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  total: number;
  submitted: number;
}

interface RecentSubmission {
  student: string;
  assignment: string;
  course: string;
  date: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignmentProgress, setAssignmentProgress] = useState<AssignmentProgress[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setAssignmentProgress(data.assignmentProgress || []);
        setRecentSubmissions(data.recentSubmissions);
      } else {
        console.error("Failed to fetch teacher dashboard data");
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

  const statItems = stats ? [
    { label: "Total Students", value: String(stats.totalStudents), icon: Users },
    { label: "Active Courses", value: String(stats.activeCourses), icon: BookOpen },
    { label: "Pending Reviews", value: String(stats.pendingReviews), icon: FileText },
    { label: "Avg Completion", value: `${stats.avgCompletion}%`, icon: TrendingUp },
  ] : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Teacher Dashboard 📊</h1>
        <p className="text-muted-foreground">Overview of your courses and students</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 card-shadow">
            <div className="mb-2 inline-flex rounded-lg bg-accent p-2 text-accent-foreground">
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="font-display text-xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Assignment Progress */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-semibold">Assignment Progress</h2>
        <div className="space-y-3">
          {assignmentProgress.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
              No assignments created yet.
            </div>
          ) : (
            assignmentProgress.map((a) => {
              const total = a.total || 0;
              const submitted = a.submitted || 0;
              const percent = total === 0 ? 0 : Math.round((submitted / total) * 100);
              return (
                <div key={a.id} className="rounded-xl border border-border bg-card p-4 card-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.course_title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {submitted}/{total} submitted
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={percent} className="h-2" />
                    <div className="mt-1 text-xs text-muted-foreground">{percent}% complete</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Recent Submissions</h2>
        <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignment</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Course</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{sub.student}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.assignment}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{sub.course}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{format(new Date(sub.date), "MMM d")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

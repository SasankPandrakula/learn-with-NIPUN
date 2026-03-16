import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TakeAssignment from "@/components/TakeAssignment";

interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  course_title: string;
  time_limit_minutes: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status?: string;
  total_marks?: number | null;
  max_marks?: number | null;
}
const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/student/assignments", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments((data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          course_title: a.course_title || "",
          time_limit_minutes: a.time_limit_minutes,
          scheduled_start: a.scheduled_start,
          scheduled_end: a.scheduled_end,
          status: a.status || "pending",
        })));
      } else {
        console.error("Failed to load assignments");
      }
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoading(false);
    }
  };

  if (takingId) {
    return <TakeAssignment assignmentId={takingId} onBack={() => { setTakingId(null); fetchAssignments(); }} />;
  }

  const now = new Date();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="mb-6 font-display text-2xl font-bold">My Assignments</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No assignments assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const start = a.scheduled_start ? new Date(a.scheduled_start) : null;
            const end = a.scheduled_end ? new Date(a.scheduled_end) : null;
            const startOfDay = start && new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
            const endOfDay = end && new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

            const isAvailable = !start || startOfDay <= now;
            const isExpired = end && endOfDay < now;

            return (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-shadow hover:card-shadow-hover transition-shadow">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {a.course_title}
                    {a.time_limit_minutes && ` • ${a.time_limit_minutes} min`}
                    {a.scheduled_end && ` • Due: ${new Date(a.scheduled_end).toLocaleDateString()}`}
                  </p>
                </div>

                {a.status === "graded" ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" /> {a.total_marks}/{a.max_marks}
                  </Badge>
                ) : a.status === "submitted" ? (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" /> Submitted
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : isAvailable ? (
                  <Button variant="hero" size="sm" onClick={() => setTakingId(a.id)} className="gap-1">
                    <PlayCircle className="h-3.5 w-3.5" /> Start
                  </Button>
                ) : (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    <Clock className="mr-1 h-3 w-3" /> Starts {new Date(a.scheduled_start!).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  title: string;
  lesson_count: number;
  completed: number;
}

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await window.fetch("/api/student/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses((data.courses || []).map((c: any) => ({
          id: c._id,
          course_id: c._id,
          progress: c.progress || 0,
          title: c.title,
          lesson_count: c.lesson_count || 0,
          completed: c.completed || 0
        })));
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="mb-6 font-display text-2xl font-bold">My Courses</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 body-glass border border-dashed border-border rounded-2xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="text-primary font-medium hover:underline"
          >
            Browse all courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} onClick={() => navigate(`/courses/${course.course_id}`)} className="rounded-xl border border-border body-glass p-5 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer">              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">{course.title}</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={course.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-secondary">{course.progress}%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{course.completed}/{course.lesson_count} lessons completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  teacher_name: string;
  student_count: number;
  lesson_count: number;
}

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [search, setSearch] = useState("");
  const [dbCourses, setDbCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setDbCourses(data.map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description,
            category: c.category || "General",
            teacher_name: c.teacher_name || "Learn With Nipun",
            student_count: c.student_count || 0,
            lesson_count: c.lessons?.length || 0
          })));
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch student's enrolled courses
  useEffect(() => {
    if (!user || role !== "student") return;
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/student/dashboard", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEnrolledIds(new Set(data.courses.map((c: any) => c._id || c.id)));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchEnrollments();
  }, [user, role]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrolling(courseId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Enrolled successfully!");
        setEnrolledIds((prev) => new Set(prev).add(courseId));
      } else {
        toast.error("Enrollment failed");
      }
    } catch (e) {
      toast.error("Error enrolling");
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = dbCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const borderColors = [
    "border-l-[#00A5B5]", // Teal
    "border-l-[#F4A71D]", // Yellow/Orange
    "border-l-[#E11D48]", // Red/Pink
    "border-l-[#10B981]", // Emerald
    "border-l-[#6366F1]", // Indigo
    "border-l-[#3B82F6]", // Blue
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">Explore and enroll in interactive programming courses</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses (C, Python, Java...)"
          className="search-input"
        />
      </div>

      {loading ? (
        // Correctly restored loading skeletons
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border body-glass p-8 space-y-4 min-h-[200px] flex flex-col justify-between">
              <div className="flex justify-between gap-4">
                 <div className="space-y-3 w-full">
                    <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                 </div>
                 <div className="h-12 w-32 rounded-full bg-muted animate-pulse shrink-0" />
              </div>
              <div className="space-y-3 mt-8">
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">
            {search ? "No courses match your search." : "No courses available right now."}
          </p>
        </div>
      ) : (
        // The new card layout is correctly placed here
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {filtered.map((course, idx) => {
            const borderColor = borderColors[idx % borderColors.length];
            const isEnrolled = enrolledIds.has(course.id);
            
            return (
              <div
                key={course.id}
                className={`group rounded-2xl border-y border-r border-border body-glass shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-8 flex flex-col border-l-[12px] ${borderColor}`}
              >
                {/* Top Section: Title & Button */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-6">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold text-[#0A2558] leading-tight mb-1.5">
                      {course.title}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      by {course.teacher_name}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {role === "student" ? (
                      isEnrolled ? (
                        <Button 
                          className="w-full sm:w-auto bg-[#FFD500] hover:bg-[#FFC107] text-[#0A2558] font-bold rounded-full px-8 py-6 text-base shadow-sm transition-transform hover:scale-105" 
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Continue Learning
                        </Button>
                      ) : (
                        <Button
                          className="w-full sm:w-auto bg-[#FFD500] hover:bg-[#FFC107] text-[#0A2558] font-bold rounded-full px-8 py-6 text-base shadow-sm transition-transform hover:scale-105"
                          disabled={enrolling === course.id}
                          onClick={() => handleEnroll(course.id)}
                        >
                          {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      )
                    ) : (
                      <Button 
                        className="w-full sm:w-auto bg-[#FFD500] hover:bg-[#FFC107] text-[#0A2558] font-bold rounded-full px-8 py-6 text-base shadow-sm transition-transform hover:scale-105" 
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        View Course
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Description & Stats */}
                <div className="text-center sm:px-4 mt-auto">
                  <p className="text-base text-muted-foreground mb-6">
                    {course.description || "Learn the fundamentals and build real projects from scratch."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.student_count} students</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lesson_count} lessons</span>
                    <span className="rounded-full bg-accent/50 px-3 py-1 text-accent-foreground font-bold text-xs uppercase tracking-wider">
                      {course.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
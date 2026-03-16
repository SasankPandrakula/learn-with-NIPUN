import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, CheckCircle, Clock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  assignmentId: string;
  onBack: () => void;
}

interface StudentSubmission {
  student_id: string;
  student_name: string;
  status: string;
  submitted_at: string | null;
  answers: {
    question_id: string;
    question_text: string;
    question_type: string;
    answer_text: string | null;
    max_marks: number;
    marks_awarded: number | null;
  }[];
  feedback: string;
  total_marks?: number;
  max_total?: number;
}

const TeacherGrading = ({ assignmentId, onBack }: Props) => {
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        
        // Calculate totals for each submission
        const mappedSubmissions = data.submissions.map((s: any) => ({
          ...s,
          total_marks: s.answers.reduce((sum: number, a: any) => sum + (a.marks_awarded || 0), 0),
          max_total: s.answers.reduce((sum: number, a: any) => sum + a.max_marks, 0),
        }));
        
        setSubmissions(mappedSubmissions);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const selectedSubmission = submissions.find(s => s.student_id === selectedStudent);

  useEffect(() => {
    if (selectedSubmission) {
      setFeedback(selectedSubmission.feedback || "");
    }
  }, [selectedStudent]);

  const updateMark = (questionId: string, marks: number) => {
    setSubmissions(prev => prev.map(s => {
      if (s.student_id !== selectedStudent) return s;
      const answers = s.answers.map(a =>
        a.question_id === questionId ? { ...a, marks_awarded: marks } : a
      );
      return { 
        ...s, 
        answers, 
        total_marks: answers.reduce((sum, a) => sum + (a.marks_awarded || 0), 0) 
      };
    }));
  };

  const saveGrades = async () => {
    if (!selectedSubmission || !selectedStudent) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // Convert answers array to a grades map for the backend
      const gradesMap: Record<string, number> = {};
      selectedSubmission.answers.forEach(a => {
        if (a.marks_awarded !== null) gradesMap[a.question_id] = a.marks_awarded;
      });

      const res = await fetch(`/api/assignments/${assignmentId}/grade/${selectedStudent}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ grades: gradesMap, feedback }),
      });

      if (res.ok) {
        toast({ title: "Grades saved!", description: `${selectedSubmission.student_name}'s grades updated.` });
        fetchData();
      } else {
        throw new Error("Failed to save");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Assignments
      </button>

      <h1 className="font-display text-2xl font-bold mb-1">{assignment?.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">Course Assignment</p>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-border bg-card p-4 card-shadow h-fit">
          <h2 className="font-display font-semibold mb-3">Students</h2>
          <div className="space-y-1">
            {submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No students assigned yet.</p>
            ) : (
              submissions.map(s => (
                <button
                  key={s.student_id}
                  onClick={() => setSelectedStudent(s.student_id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    selectedStudent === s.student_id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    {s.student_name}
                  </span>
                  {s.status === "graded" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      <CheckCircle className="mr-0.5 h-2.5 w-2.5" /> {s.total_marks}/{s.max_total}
                    </Badge>
                  ) : s.status === "submitted" ? (
                    <Badge variant="secondary" className="text-xs">Submitted</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                      <Clock className="mr-0.5 h-2.5 w-2.5" /> Pending
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {selectedSubmission ? (
          <div className="space-y-4">
            {selectedSubmission.status === "pending" ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center card-shadow">
                <Clock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">This student hasn't submitted yet.</p>
              </div>
            ) : (
              <>
                {selectedSubmission.answers.map((ans, idx) => (
                  <div key={ans.question_id} className="rounded-xl border border-border bg-card p-4 card-shadow space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">{ans.question_type} • Q{idx + 1}</span>
                        <p className="font-medium text-foreground mt-1">{ans.question_text}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={ans.marks_awarded ?? ""}
                          onChange={e => updateMark(ans.question_id, parseFloat(e.target.value) || 0)}
                          className="w-16 h-8 text-sm text-center"
                          max={ans.max_marks}
                          min={0}
                        />
                        <span className="text-sm text-muted-foreground">/ {ans.max_marks}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground mb-1">Student's Answer:</p>
                      <p className="text-sm whitespace-pre-wrap font-mono">{ans.answer_text || "(no answer)"}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-border bg-card p-4 card-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold">Total: {selectedSubmission.total_marks} / {selectedSubmission.max_total}</span>
                  </div>
                  <Textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Optional feedback for the student..."
                    rows={2}
                  />
                  <Button variant="hero" onClick={saveGrades} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {saving ? "Saving..." : "Save Grades"}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center card-shadow">
            <p className="text-muted-foreground">Select a student to review their submission.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGrading;

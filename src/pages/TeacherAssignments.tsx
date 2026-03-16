import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Plus, CheckCircle, Clock, Users, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TeacherGrading from "@/components/TeacherGrading";

interface Question {
  question_type: "mcq" | "coding" | "text";
  question_text: string;
  options: string[];
  correct_answer: string;
  max_marks: number;
}

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_title?: string;
  due_date: string | null;
  time_limit_minutes: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_active: boolean;
  created_at: string;
  recipient_count?: number;
  submitted_count?: number;
}

const TeacherAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editingRecipients, setEditingRecipients] = useState<string[] | null>(null);
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) fetchStudents(selectedCourse);
  }, [selectedCourse]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/assignments", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments((data || []).map((a: any) => ({
          ...a,
          // Keep backwards compatibility for old assignment shapes
          course_title: a.course_title || (a.courses?.title ?? ""),
        })));
      } else {
        console.error("Failed to load assignments");
      }
    } catch (err) {
      console.error("Error loading assignments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/courses", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses((data || []).map((c: any) => ({ id: String(c.id), title: c.title })));
      }
    } catch (err) {
      console.error("Failed to load teacher courses", err);
    }
  };

  const fetchStudents = async (courseId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/courses/${courseId}/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const students = (data || []).map((s: any) => ({ user_id: s.id, full_name: s.full_name }));
        setEnrolledStudents(students);

        if (editingRecipients) {
          setSelectedStudents(editingRecipients);
          setSelectAll(editingRecipients.length === students.length);
          setEditingRecipients(null);
        } else {
          setSelectedStudents([]);
          setSelectAll(false);
        }
      }
    } catch (err) {
      console.error("Failed to load enrolled students", err);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_type: "mcq", question_text: "", options: ["", "", "", ""], correct_answer: "", max_marks: 1 }]);
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedStudents(checked ? enrolledStudents.map(s => s.user_id) : []);
  };

  const toggleStudent = (userId: string) => {
    setSelectedStudents(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const openEditAssignment = async (assignment: AssignmentRow) => {
    setEditingAssignmentId(assignment.id);
    setTitle(assignment.title);
    setDescription(assignment.description || "");
    setSelectedCourse(assignment.course_id);
    setTimeLimit(assignment.time_limit_minutes?.toString() || "");
    setScheduledStart(assignment.scheduled_start || "");
    setScheduledEnd(assignment.scheduled_end || "");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/assignments/${assignment.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setEditingRecipients((data.recipients || []).map((r: any) => r.student_id));
      }
    } catch (err) {
      console.error("Failed to load assignment details", err);
    }

    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!title || !selectedCourse || questions.length === 0 || selectedStudents.length === 0) {
      toast({ title: "Missing fields", description: "Please fill all required fields, add questions, and select students.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const method = editingAssignmentId ? "PUT" : "POST";
      const url = editingAssignmentId ? `/api/teacher/assignments/${editingAssignmentId}` : "/api/teacher/assignments";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          courseId: selectedCourse,
          timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
          scheduledStart: scheduledStart || null,
          scheduledEnd: scheduledEnd || null,
          studentIds: selectedStudents,
          questions,
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: `Failed to ${editingAssignmentId ? "update" : "create"} assignment`, description: data.message || "Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: `Assignment ${editingAssignmentId ? "updated" : "created"}`, description: `Your assignment was ${editingAssignmentId ? "updated" : "created"} successfully.`, variant: "success" });
      resetForm();
      setCreateOpen(false);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to create/update assignment", err);
      toast({ title: "Error", description: "Could not save assignment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setSelectedCourse(""); setTimeLimit("");
    setScheduledStart(""); setScheduledEnd(""); setSelectedStudents([]);
    setSelectAll(false); setQuestions([]);
    setEditingAssignmentId(null);
    setEditingRecipients(null);
  };

  if (gradingAssignmentId) {
    return <TeacherGrading assignmentId={gradingAssignmentId} onBack={() => { setGradingAssignmentId(null); fetchAssignments(); }} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Assignments & Grading</h1>
        <Button variant="hero" size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Assignment
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No assignments yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{a.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {a.course_title || ""} • {a.time_limit_minutes ? `${a.time_limit_minutes} min` : "No time limit"}
                  {a.scheduled_start && ` • Starts: ${new Date(a.scheduled_start).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{a.submitted_count}/{a.recipient_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditAssignment(a)}>
                  <FileText className="h-3 w-3" /> Edit
                </Button>
                {(a.submitted_count ?? 0) > 0 ? (
                  <Button variant="hero" size="sm" onClick={() => setGradingAssignmentId(a.id)}>
                    <Eye className="mr-1 h-3 w-3" /> Review
                  </Button>
                ) : (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    <Clock className="mr-1 h-3 w-3" /> Waiting
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title" />
              </div>
              <div>
                <Label>Course *</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Time Limit (minutes)</Label>
                <Input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="e.g. 60" />
              </div>
              <div>
                <Label>Scheduled Start</Label>
                <Input type="datetime-local" value={scheduledStart} onChange={e => setScheduledStart(e.target.value)} />
              </div>
              <div>
                <Label>Scheduled End</Label>
                <Input type="datetime-local" value={scheduledEnd} onChange={e => setScheduledEnd(e.target.value)} />
              </div>
            </div>

            {/* Students */}
            {selectedCourse && (
              <div>
                <Label className="mb-2 block">Select Students * ({selectedStudents.length} selected)</Label>
                {enrolledStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students enrolled in this course.</p>
                ) : (
                  <div className="rounded-lg border border-border p-3 max-h-40 overflow-y-auto space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Checkbox checked={selectAll} onCheckedChange={(c) => handleSelectAll(!!c)} id="select-all" />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">Select All</label>
                    </div>
                    {enrolledStudents.map(s => (
                      <div key={s.user_id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedStudents.includes(s.user_id)}
                          onCheckedChange={() => toggleStudent(s.user_id)}
                          id={s.user_id}
                        />
                        <label htmlFor={s.user_id} className="text-sm cursor-pointer">{s.full_name || "Unnamed Student"}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Questions * ({questions.length})</Label>
                <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Q{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <Select value={q.question_type} onValueChange={(v) => updateQuestion(idx, { question_type: v as any })}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">MCQ</SelectItem>
                            <SelectItem value="coding">Coding</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={q.max_marks}
                          onChange={e => updateQuestion(idx, { max_marks: parseFloat(e.target.value) || 1 })}
                          className="w-20 h-8 text-xs"
                          placeholder="Marks"
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)} className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={q.question_text}
                      onChange={e => updateQuestion(idx, { question_text: e.target.value })}
                      placeholder="Enter question..."
                      rows={2}
                    />

                    {q.question_type === "mcq" && (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={q.correct_answer === opt && opt !== ""}
                              onChange={() => updateQuestion(idx, { correct_answer: opt })}
                              className="accent-primary"
                            />
                            <Input
                              value={opt}
                              onChange={e => {
                                const newOpts = [...q.options];
                                newOpts[oi] = e.target.value;
                                updateQuestion(idx, { options: newOpts });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="hero" className="w-full" onClick={handleCreate} disabled={submitting}>
              {submitting ? (editingAssignmentId ? "Updating..." : "Creating...") : (editingAssignmentId ? "Update Assignment" : "Create & Send Assignment")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssignments;

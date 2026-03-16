import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Users, BookOpen, Eye, EyeOff, Loader2, Trash2, FileText, Code, Video, File as FileIcon, GripVertical, Save, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BlockType = "text" | "code" | "video" | "document";

interface ContentBlock {
  id: string;
  type: BlockType;
  value: string;
  language?: string; // for code
}

interface Lesson {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

interface CourseRow {
  id: string;
  _id?: string;
  title: string;
  description: string | null;
  category: string;
  is_published: boolean;
  student_count: number;
  lesson_count: number;
  lessons?: Lesson[];
}

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // blockId
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [managingCourse, setManagingCourse] = useState<CourseRow | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ lessonId: string, blockId: string } | null>(null);

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/courses", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [user]);

  const openCreate = () => {
    setEditingCourse(null);
    setFormTitle(""); setFormCategory(""); setFormDescription("");
    setDialogOpen(true);
  };

  const openEdit = (course: CourseRow) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormCategory(course.category);
    setFormDescription(course.description || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formTitle.trim() || !formCategory.trim()) {
      toast.error("Title and category are required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingCourse ? `/api/teacher/courses/${editingCourse.id}` : "/api/teacher/courses";
      const method = editingCourse ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          description: formDescription
        })
      });

      if (res.ok) {
        toast.success(editingCourse ? "Course updated!" : "Course created!");
        setDialogOpen(false);
        fetchCourses();
      } else {
        toast.error("Failed to save course");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course: CourseRow) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/courses/${course.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_published: !course.is_published })
      });

      if (res.ok) {
        toast.success(course.is_published ? "Course unpublished" : "Course published!");
        fetchCourses();
      }
    } catch (e) {
      toast.error("Failed to toggle status");
    }
  };

  const openManageLessons = async (course: CourseRow) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/courses/${course.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const fullCourse = await res.json();
        setManagingCourse(fullCourse);
        const lessons = (fullCourse.lessons || []).map((l: any) => ({
          id: l.id || Math.random().toString(36).substr(2, 9),
          title: l.title || "Untitled Lesson",
          blocks: l.blocks || (l.content ? [{ id: 'init', type: 'text', value: l.content }] : [])
        }));
        setCourseLessons(lessons);
        setLessonDialogOpen(true);
      }
    } catch (e) {
      toast.error("Failed to load lessons");
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Lesson",
      blocks: [{ id: Math.random().toString(36).substr(2, 9), type: 'text', value: '' }]
    };
    setCourseLessons([...courseLessons, newLesson]);
  };

  const updateLessonTitle = (id: string, title: string) => {
    setCourseLessons(courseLessons.map(l => l.id === id ? { ...l, title } : l));
  };

  const addBlock = (lessonId: string, type: BlockType) => {
    setCourseLessons(courseLessons.map(l => {
      if (l.id !== lessonId) return l;
      const newBlock: ContentBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        value: '',
        ...(type === 'code' ? { language: 'javascript' } : {})
      };
      return { ...l, blocks: [...l.blocks, newBlock] };
    }));
  };

  const updateBlock = (lessonId: string, blockId: string, updates: Partial<ContentBlock>) => {
    setCourseLessons(courseLessons.map(l => {
      if (l.id !== lessonId) return l;
      return {
        ...l,
        blocks: l.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
      };
    }));
  };

  const triggerUpload = (lessonId: string, blockId: string) => {
    setActiveUploadTarget({ lessonId, blockId });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget) return;

    setUploading(activeUploadTarget.blockId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        updateBlock(activeUploadTarget.lessonId, activeUploadTarget.blockId, { value: data.url });
        toast.success("File uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (e) {
      toast.error("Error during upload");
    } finally {
      setUploading(null);
      setActiveUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeBlock = (lessonId: string, blockId: string) => {
    setCourseLessons(courseLessons.map(l => {
      if (l.id !== lessonId) return l;
      return { ...l, blocks: l.blocks.filter(b => b.id !== blockId) };
    }));
  };

  const deleteLesson = (id: string) => {
    setCourseLessons(courseLessons.filter(l => l.id !== id));
  };

  const saveLessons = async () => {
    if (!managingCourse) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/teacher/courses/${managingCourse._id || managingCourse.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ lessons: courseLessons })
      });

      if (res.ok) {
        toast.success("Lessons saved!");
        setLessonDialogOpen(false);
        fetchCourses();
      } else {
        toast.error("Failed to save lessons");
      }
    } catch (e) {
      toast.error("Error saving lessons");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept={activeUploadTarget?.blockId && courseLessons.find(l => l.id === activeUploadTarget.lessonId)?.blocks.find(b => b.id === activeUploadTarget.blockId)?.type === 'video' ? 'video/*' : '*/*'}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Courses</h1>
        <Button variant="hero" size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Course
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Title</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Python Programming" /></div>
            <div><Label>Category</Label><Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Programming" /></div>
            <div><Label>Description</Label><Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Course description..." /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingCourse ? "Save Changes" : "Create Course"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b border-border hero-gradient">
            <h2 className="text-xl font-bold text-white">Manage Content: {managingCourse?.title}</h2>
            <p className="text-white/80 text-sm">Add lessons and rich content blocks.</p>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar for Lessons */}
            <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
              <div className="p-4 border-b border-border">
                <Button onClick={addLesson} size="sm" className="w-full gap-1" variant="outline">
                  <Plus className="h-3.5 w-3.5" /> Add Lesson
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {courseLessons.map((l, idx) => (
                    <div key={l.id} className="flex items-center gap-1 group">
                      <button className="flex-1 text-left px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground truncate font-medium">
                        {idx + 1}. {l.title}
                      </button>
                      <button onClick={() => deleteLesson(l.id)} className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Editor */}
            <ScrollArea className="flex-1 bg-background">
              <div className="p-8 max-w-3xl mx-auto space-y-12">
                {courseLessons.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No lessons yet. Add one to start building your course.</p>
                  </div>
                ) : (
                  courseLessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="space-y-6 relative border-b border-border pb-12 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{lIdx + 1}</span>
                        <Input 
                          value={lesson.title} 
                          onChange={e => updateLessonTitle(lesson.id, e.target.value)}
                          className="text-xl font-bold border-transparent hover:border-input focus:border-input bg-transparent px-0"
                          placeholder="Lesson Title"
                        />
                      </div>

                      {/* Blocks */}
                      <div className="space-y-4 ml-12">
                        {lesson.blocks.map((block) => (
                          <div key={block.id} className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                            <div className="absolute -left-10 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                              <button onClick={() => removeBlock(lesson.id, block.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              {block.type === 'text' && <FileText className="h-4 w-4 text-blue-500" />}
                              {block.type === 'code' && <Code className="h-4 w-4 text-orange-500" />}
                              {block.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                              {block.type === 'document' && <FileIcon className="h-4 w-4 text-green-500" />}
                              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{block.type}</span>
                              
                              {block.type === 'code' && (
                                <Select value={block.language} onValueChange={(v) => updateBlock(lesson.id, block.id, { language: v })}>
                                  <SelectTrigger className="h-6 w-24 text-[10px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="javascript">JS</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                    <SelectItem value="sql">SQL</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {block.type === 'text' ? (
                              <Textarea 
                                value={block.value} 
                                onChange={e => updateBlock(lesson.id, block.id, { value: e.target.value })}
                                placeholder="Enter text (Markdown supported)..."
                                className="min-h-[100px] bg-muted/30 border-0 focus-visible:ring-1"
                              />
                            ) : block.type === 'code' ? (
                              <Textarea 
                                value={block.value} 
                                onChange={e => updateBlock(lesson.id, block.id, { value: e.target.value })}
                                placeholder="Paste code here..."
                                className="font-mono text-sm min-h-[150px] bg-slate-950 text-slate-100 border-0"
                              />
                            ) : (
                              <div className="flex gap-2">
                                <Input 
                                  value={block.value} 
                                  onChange={e => updateBlock(lesson.id, block.id, { value: e.target.value })}
                                  placeholder={block.type === 'video' ? "Paste YouTube URL or upload from local..." : "Paste Link or upload document..."}
                                  className="bg-muted/30 border-0"
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5"
                                  onClick={() => triggerUpload(lesson.id, block.id)}
                                  disabled={!!uploading}
                                >
                                  {uploading === block.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                  Upload
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Block Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="ghost" size="sm" className="text-[10px] h-8 rounded-full gap-1 border border-dashed border-border hover:border-primary hover:text-primary" onClick={() => addBlock(lesson.id, 'text')}><Plus className="h-3 w-3"/> Text</Button>
                          <Button variant="ghost" size="sm" className="text-[10px] h-8 rounded-full gap-1 border border-dashed border-border hover:border-orange-500 hover:text-orange-500" onClick={() => addBlock(lesson.id, 'code')}><Code className="h-3 w-3"/> Code</Button>
                          <Button variant="ghost" size="sm" className="text-[10px] h-8 rounded-full gap-1 border border-dashed border-border hover:border-red-500 hover:text-red-500" onClick={() => addBlock(lesson.id, 'video')}><Video className="h-3 w-3"/> Video</Button>
                          <Button variant="ghost" size="sm" className="text-[10px] h-8 rounded-full gap-1 border border-dashed border-border hover:border-green-500 hover:text-green-500" onClick={() => addBlock(lesson.id, 'document')}><FileIcon className="h-3 w-3"/> Doc</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setLessonDialogOpen(false)}>Discard Changes</Button>
            <Button onClick={saveLessons} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No courses yet. Create your first course!</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>Create Course</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card p-4 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.student_count} students</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.lesson_count} lessons</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${course.is_published ? "bg-green-100 text-green-700" : "bg-accent text-accent-foreground"}`}>
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => openManageLessons(course)}>
                  <FileText className="h-3.5 w-3.5" /> Content
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => togglePublish(course)}>
                  {course.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {course.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(course)}>
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;

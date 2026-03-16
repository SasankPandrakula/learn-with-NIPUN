const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');

if (typeof fetch === 'undefined') {
  console.warn('WARNING: Global fetch is not available. Google Authentication (accessToken) and AI Chat might fail. Please use Node.js v18 or newer.');
}

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// --- FILE UPLOAD SETUP ---
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- AUTH MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
};

// --- ROUTES ---

// Middleware to check DB connection
app.use((req, res, next) => {
  if (!db && req.path.startsWith('/api/')) {
    return res.status(503).json({ 
      message: 'Database connecting, please try again in a moment.',
      error: dbError 
    });
  }
  next();
});

app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, role } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required" });
  try {
    const existingUser = await db.collection('users').findOne({ email, role });
    if (existingUser) return res.status(400).json({ message: `A ${role} account with this email already exists` });
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({ email, password: hashedPassword, fullName, role, createdAt: new Date() });
    const token = jwt.sign({ id: result.insertedId, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.insertedId, email, fullName, role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required" });
  try {
    const user = await db.collection('users').findOne({ email, role });
    if (!user) return res.status(400).json({ message: `No ${role} account found with this email` });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, fullName: user.fullName, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/google', async (req, res) => {
  const { idToken, accessToken, role } = req.body;
  try {
    let email, name, googleId;

    if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else if (accessToken) {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const payload = await response.json();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else {
      return res.status(400).json({ message: 'Token is required' });
    }

    if (!email) return res.status(400).json({ message: 'Invalid token' });

    // Check if user exists with this email and role
    let user = await db.collection('users').findOne({ email, role });
    
    if (!user) {
      // Create new user if not exists
      const result = await db.collection('users').insertOne({
        email,
        fullName: name,
        role,
        googleId,
        createdAt: new Date()
      });
      user = { _id: result.insertedId, email, fullName: name, role };
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Google authentication failed', error: err.message });
  }
});

app.get('/api/student/dashboard', authenticate, async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);
    const enrollments = await db.collection('enrollments').find({ userId }).toArray();
    const courseIds = enrollments.map((e) => new ObjectId(e.courseId));
    const enrolledCourses = await db.collection('courses').find({ _id: { $in: courseIds } }).toArray();
    const coursesWithProgress = enrolledCourses.map((course) => {
      const enrollment = enrollments.find((e) => e.courseId.toString() === course._id.toString());
      return {
        ...course,
        progress: enrollment ? (enrollment.progress || 0) : 0,
        completed: enrollment ? (enrollment.completed || 0) : 0,
        lesson_count: course.lessons?.length || 0,
      };
    });

    const assignments = await db.collection('assignments').find({ courseId: { $in: courseIds } }).limit(5).toArray();
    res.json({ courses: coursesWithProgress, assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/student/assignments', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });

    const studentId = String(req.user.id);
    const recipients = await db.collection('assignment_recipients').find({ student_id: studentId }).toArray();
    const assignmentIds = recipients.map((r) => new ObjectId(r.assignment_id));
    if (!assignmentIds.length) return res.json([]);

    const assignments = await db.collection('assignments').find({ _id: { $in: assignmentIds } }).toArray();
    const courseIds = assignments.map((a) => a.courseId);
    const courses = await db.collection('courses').find({ _id: { $in: courseIds } }).toArray();
    const courseMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c.title]));

    const recipientMap = Object.fromEntries(recipients.map((r) => [r.assignment_id, r]));

    const result = assignments.map((a) => {
      const recipient = recipientMap[a._id.toString()];
      return {
        id: a._id.toString(),
        title: a.title,
        description: a.description,
        course_id: a.courseId.toString(),
        course_title: courseMap[a.courseId.toString()] || "",
        due_date: a.due_date,
        time_limit_minutes: a.time_limit_minutes,
        scheduled_start: a.scheduled_start,
        scheduled_end: a.scheduled_end,
        is_active: a.is_active,
        created_at: a.created_at,
        status: recipient?.status || 'pending',
        submitted_at: recipient?.submitted_at || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/teacher/courses', authenticate, async (req, res) => {
  try {
    const courses = await db.collection('courses').find({ teacherId: new ObjectId(req.user.id) }).toArray();
    const coursesWithStats = await Promise.all(courses.map(async (c) => {
      const student_count = await db.collection('enrollments').countDocuments({ courseId: c._id });
      return { id: c._id, title: c.title, description: c.description, category: c.category, is_published: c.is_published || false, student_count, lesson_count: c.lessons?.length || 0 };
    }));
    res.json(coursesWithStats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/teacher/courses', authenticate, async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const result = await db.collection('courses').insertOne({ teacherId: new ObjectId(req.user.id), title, category, description, is_published: false, createdAt: new Date(), lessons: [] });
    res.status(201).json({ id: result.insertedId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/teacher/courses/:id', authenticate, async (req, res) => {
  try {
    const course = await db.collection('courses').findOne({ _id: new ObjectId(req.params.id), teacherId: new ObjectId(req.user.id) });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/teacher/courses/:id/students', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await db.collection('courses').findOne({ _id: new ObjectId(courseId), teacherId: new ObjectId(req.user.id) });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollments = await db.collection('enrollments').find({ courseId: new ObjectId(courseId) }).toArray();
    const studentIds = enrollments.map((e) => new ObjectId(e.userId));
    const students = await db.collection('users').find({ _id: { $in: studentIds } }).toArray();

    res.json(students.map((s) => ({ id: s._id.toString(), full_name: s.fullName, email: s.email })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/teacher/courses/:id', authenticate, async (req, res) => {
  try {
    const { title, category, description, is_published, lessons } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (lessons !== undefined) updateData.lessons = lessons;
    await db.collection('courses').updateOne({ _id: new ObjectId(req.params.id), teacherId: new ObjectId(req.user.id) }, { $set: updateData });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- TEACHER DASHBOARD ---
app.get('/api/teacher/dashboard', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

    const teacherId = new ObjectId(req.user.id);
    const teacherCourses = await db.collection('courses').find({ teacherId }).project({ _id: 1, title: 1 }).toArray();
    const courseIds = teacherCourses.map(c => c._id);
    const courseMap = Object.fromEntries(teacherCourses.map(c => [c._id.toString(), c.title]));

    // --- Stats ---
    const totalStudents = await db.collection('enrollments').distinct('userId', { courseId: { $in: courseIds } });
    const pendingReviews = await db.collection('assignment_recipients').countDocuments({
      assignment_id: { $in: (await db.collection('assignments').find({ courseId: { $in: courseIds } }).project({ _id: 1 }).toArray()).map(a => a._id.toString()) },
      status: 'submitted'
    });

    const avgCompletionResult = await db.collection('enrollments').aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
    ]).toArray();
    const avgCompletion = avgCompletionResult.length > 0 ? Math.round(avgCompletionResult[0].avgProgress) : 0;

    const stats = {
      totalStudents: totalStudents.length,
      activeCourses: courseIds.length,
      pendingReviews: pendingReviews,
      avgCompletion: avgCompletion
    };

    // --- Assignment Progress ---
    const assignments = await db.collection('assignments').find({ courseId: { $in: courseIds } }).toArray();
    const assignmentIds = assignments.map(a => a._id.toString());

    const recipientCounts = await db.collection('assignment_recipients').aggregate([
      { $match: { assignment_id: { $in: assignmentIds } } },
      { $group: { _id: '$assignment_id', count: { $sum: 1 } } }
    ]).toArray();

    const submittedCounts = await db.collection('assignment_recipients').aggregate([
      { $match: { assignment_id: { $in: assignmentIds }, status: { $in: ['submitted', 'graded'] } } },
      { $group: { _id: '$assignment_id', count: { $sum: 1 } } }
    ]).toArray();

    const recipientMap = Object.fromEntries(recipientCounts.map(r => [r._id, r.count]));
    const submittedMap = Object.fromEntries(submittedCounts.map(r => [r._id, r.count]));

    const assignmentProgress = assignments.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      course_id: a.courseId.toString(),
      course_title: courseMap[a.courseId.toString()] || "",
      total: recipientMap[a._id.toString()] || 0,
      submitted: submittedMap[a._id.toString()] || 0,
    }));

    // --- Recent Submissions ---
    const recentSubmissions = await db.collection('assignment_recipients').aggregate([
      { $match: { assignment_id: { $in: assignmentIds }, status: { $in: ['submitted', 'graded'] } } },
      { $sort: { submitted_at: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $addFields: {
          student_id_obj: { $toObjectId: "$student_id" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id_obj',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $addFields: {
          assignment_id_obj: { $toObjectId: "$assignment_id" }
        }
      },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment_id_obj',
          foreignField: '_id',
          as: 'assignmentDetails'
        }
      },
      { $unwind: '$studentDetails' },
      { $unwind: '$assignmentDetails' },
      {
        $project: {
          _id: 0,
          student: '$studentDetails.fullName',
          assignment: '$assignmentDetails.title',
          course: '', // Need to lookup course from assignment or use courseMap
          assignment_course_id: '$assignmentDetails.courseId',
          date: '$submitted_at'
        }
      }
    ]).toArray();

    // Fill in course title for recent submissions
    const recentSubmissionsWithCourse = recentSubmissions.map(sub => ({
      ...sub,
      course: courseMap[sub.assignment_course_id.toString()] || ""
    }));

    res.json({
      stats,
      assignmentProgress,
      recentSubmissions: recentSubmissionsWithCourse
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- TEACHER ASSIGNMENTS ---
app.get('/api/teacher/assignments', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

    const teacherId = new ObjectId(req.user.id);
    const courses = await db.collection('courses').find({ teacherId }).project({ _id: 1, title: 1 }).toArray();
    const courseIds = courses.map(c => c._id);
    const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), c.title]));

    const assignments = await db.collection('assignments').find({ courseId: { $in: courseIds } }).toArray();
    const assignmentIds = assignments.map(a => a._id.toString());

    const recipientCounts = await db.collection('assignment_recipients').aggregate([
      { $match: { assignment_id: { $in: assignmentIds } } },
      { $group: { _id: '$assignment_id', count: { $sum: 1 } } }
    ]).toArray();

    const submissionCounts = await db.collection('submissions').aggregate([
      { $match: { assignment_id: { $in: assignmentIds } } },
      { $group: { _id: '$assignment_id', count: { $sum: 1 } } }
    ]).toArray();

    const recipientMap = Object.fromEntries(recipientCounts.map(r => [r._id, r.count]));
    const submissionMap = Object.fromEntries(submissionCounts.map(r => [r._id, r.count]));

    const result = assignments.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      description: a.description,
      course_id: a.courseId.toString(),
      course_title: courseMap[a.courseId.toString()] || "",
      due_date: a.due_date,
      time_limit_minutes: a.time_limit_minutes,
      scheduled_start: a.scheduled_start,
      scheduled_end: a.scheduled_end,
      is_active: a.is_active,
      created_at: a.created_at,
      recipient_count: recipientMap[a._id.toString()] || 0,
      submitted_count: submissionMap[a._id.toString()] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/teacher/assignments', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

    const { title, description, courseId, timeLimitMinutes, scheduledStart, scheduledEnd, studentIds, questions } = req.body;
    if (!title || !courseId || !Array.isArray(studentIds) || studentIds.length === 0 || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const assignmentDoc = {
      teacherId: new ObjectId(req.user.id),
      courseId: new ObjectId(courseId),
      title,
      description,
      time_limit_minutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      scheduled_start: scheduledStart ? new Date(scheduledStart) : null,
      scheduled_end: scheduledEnd ? new Date(scheduledEnd) : null,
      created_at: new Date(),
      is_active: true,
    };

    const result = await db.collection('assignments').insertOne(assignmentDoc);
    const assignmentId = result.insertedId.toString();

    const recipients = studentIds.map((sid) => ({
      assignment_id: assignmentId,
      student_id: String(sid),
      status: 'pending',
      submitted_at: null,
      grades: {},
      feedback: '',
    }));
    if (recipients.length) {
      await db.collection('assignment_recipients').insertMany(recipients);
    }

    if (Array.isArray(questions) && questions.length) {
      const questionDocs = questions.map((q) => ({
        assignment_id: assignmentId,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        max_marks: q.max_marks,
      }));
      await db.collection('assignment_questions').insertMany(questionDocs);
    }

    res.status(201).json({ id: assignmentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/teacher/assignments/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

    const { title, description, courseId, timeLimitMinutes, scheduledStart, scheduledEnd, studentIds, questions } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (courseId !== undefined) update.courseId = new ObjectId(courseId);
    if (timeLimitMinutes !== undefined) update.time_limit_minutes = timeLimitMinutes ? Number(timeLimitMinutes) : null;
    if (scheduledStart !== undefined) update.scheduled_start = scheduledStart ? new Date(scheduledStart) : null;
    if (scheduledEnd !== undefined) update.scheduled_end = scheduledEnd ? new Date(scheduledEnd) : null;

    await db.collection('assignments').updateOne(
      { _id: new ObjectId(req.params.id), teacherId: new ObjectId(req.user.id) },
      { $set: update }
    );

    // Update recipients if provided
    if (Array.isArray(studentIds)) {
      await db.collection('assignment_recipients').deleteMany({ assignment_id: req.params.id });
      const recipients = studentIds.map((sid) => ({
        assignment_id: req.params.id,
        student_id: String(sid),
        status: 'pending',
        submitted_at: null,
        grades: {},
        feedback: '',
      }));
      if (recipients.length) {
        await db.collection('assignment_recipients').insertMany(recipients);
      }
    }

    // Update questions if provided
    if (Array.isArray(questions)) {
      await db.collection('assignment_questions').deleteMany({ assignment_id: req.params.id });
      const questionDocs = questions.map((q) => ({
        assignment_id: req.params.id,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        max_marks: q.max_marks,
      }));
      if (questionDocs.length) {
        await db.collection('assignment_questions').insertMany(questionDocs);
      }
    }

    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/courses', async (req, res) => {

  try {
    const courses = await db.collection('courses').find({ is_published: true }).toArray();
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await db.collection('courses').findOne({ _id: new ObjectId(req.params.id) });
    if (!course) return res.status(404).json({ message: 'Not found' });
    
    // Check for enrollment if user is logged in
    let enrollment = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        enrollment = await db.collection('enrollments').findOne({ 
          userId: new ObjectId(decoded.id), 
          courseId: new ObjectId(req.params.id) 
        });
      } catch (e) {
        // Token invalid, ignore enrollment
      }
    }
    
    res.json({ ...course, enrollment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/courses/:id/enroll', authenticate, async (req, res) => {
  try {
    await db.collection('enrollments').updateOne({ userId: new ObjectId(req.user.id), courseId: new ObjectId(req.params.id) }, { $set: { progress: 0, completed: 0, completedLessons: [], enrolledAt: new Date() } }, { upsert: true });
    res.json({ message: 'Enrolled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/courses/:courseId/lessons/:lessonId/complete', authenticate, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = new ObjectId(req.user.id);
    
    // Get enrollment
    const enrollment = await db.collection('enrollments').findOne({ userId, courseId: new ObjectId(courseId) });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    
    // Get course to know lesson count
    const course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    const lessonCount = course.lessons?.length || 1;
    
    // Update completedLessons
    await db.collection('enrollments').updateOne(
      { userId, courseId: new ObjectId(courseId) },
      { $addToSet: { completedLessons: lessonId } }
    );
    
    // Recalculate progress
    const updatedEnrollment = await db.collection('enrollments').findOne({ userId, courseId: new ObjectId(courseId) });
    const completedCount = updatedEnrollment.completedLessons?.length || 0;
    const progress = Math.round((completedCount / lessonCount) * 100);
    
    await db.collection('enrollments').updateOne(
      { userId, courseId: new ObjectId(courseId) },
      { $set: { progress, completed: completedCount } }
    );
    
    res.json({ progress, completedLessons: updatedEnrollment.completedLessons });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- AI CHAT ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
app.post('/api/ai/chat', authenticate, async (req, res) => {
  const { messages } = req.body;
  let GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\s\r\n]+)["']?/);
      if (match && match[1]) GEMINI_API_KEY = match[1];
    }
  } catch (e) {}

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const sendData = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  if (!GEMINI_API_KEY) {
    sendData({ choices: [{ delta: { content: "Please add `GEMINI_API_KEY` to your `.env` file." } }] });
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.replace(/['"]/g, '').trim());
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-1.5-flash"];
    let success = false;
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const history = (messages.length > 1) ? messages.slice(0, -1).filter(m => (m.role === "user" || m.role === "assistant") && m.content && !m.content.startsWith("⚠️")).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })) : [];
        const chat = model.startChat({ history });
        const userMessage = messages[messages.length - 1].content;
        const finalPrompt = history.length === 0 ? `You are the AI learning assistant for 'Learn With Nipun'. Be friendly and concise.\n\nUser: ${userMessage}` : userMessage;
        const result = await chat.sendMessageStream(finalPrompt);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) sendData({ choices: [{ delta: { content: chunkText } }] });
        }
        success = true;
        break;
      } catch (err) {
        if (err.message?.includes("API_KEY_INVALID")) break;
        continue;
      }
    }
    if (!success) throw new Error("No compatible Gemini models found.");
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    sendData({ choices: [{ delta: { content: `⚠️ ${error.message}` } }] });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// --- WEBSOCKET CODE EXECUTION ---
io.on('connection', (socket) => {
  let child = null;

  socket.on('run-code', async (data) => {
    const { source_code, language, token } = data;
    
    // Verify token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    const tempId = Math.random().toString(36).substr(2, 5);
    const tempDir = path.join(__dirname, '../temp_code');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let filename, compileCmd, runCmd;
    const baseName = `code_${tempId}`;

    try {
      switch (language.toLowerCase()) {
        case 'python':
        case 'python3':
          filename = `${baseName}.py`;
          const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
          runCmd = { cmd: pyCmd, args: [path.join(tempDir, filename)] };
          break;
        case 'javascript':
        case 'js':
          filename = `${baseName}.js`;
          runCmd = { cmd: 'node', args: [path.join(tempDir, filename)] };
          break;
        case 'c':
          filename = `${baseName}.c`;
          const cExe = path.join(tempDir, `${baseName}.exe`);
          compileCmd = { cmd: 'gcc', args: [path.join(tempDir, filename), '-o', cExe] };
          runCmd = { cmd: cExe, args: [] };
          break;
        case 'cpp':
        case 'c++':
          filename = `${baseName}.cpp`;
          const cppExe = path.join(tempDir, `${baseName}.exe`);
          compileCmd = { cmd: 'g++', args: [path.join(tempDir, filename), '-o', cppExe] };
          runCmd = { cmd: cppExe, args: [] };
          break;
        case 'java':
          filename = `Main_${tempId}.java`;
          const javaCode = source_code.replace(/public\s+class\s+\w+/, `public class Main_${tempId}`);
          compileCmd = { cmd: 'javac', args: [path.join(tempDir, filename)] };
          runCmd = { cmd: 'java', args: ['-cp', tempDir, `Main_${tempId}`] };
          fs.writeFileSync(path.join(tempDir, filename), javaCode);
          break;
        default:
          throw new Error(`Language ${language} not supported.`);
      }

      const filePath = path.join(tempDir, filename);
      if (language.toLowerCase() !== 'java') fs.writeFileSync(filePath, source_code);

      const execute = () => {
        child = spawn(runCmd.cmd, runCmd.args, { 
          cwd: tempDir,
          env: { ...process.env, PYTHONUNBUFFERED: "1" }
        });

        child.stdout.on('data', (d) => socket.emit('stdout', d.toString()));
        child.stderr.on('data', (d) => socket.emit('stderr', d.toString()));

        child.on('close', (code) => {
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (filename.endsWith('.c') || filename.endsWith('.cpp')) {
              const exe = filePath.replace(/\.(c|cpp)$/, '.exe');
              if (fs.existsSync(exe)) fs.unlinkSync(exe);
            }
            if (filename.endsWith('.java')) {
              const classFile = filePath.replace('.java', '.class');
              if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
            }
          } catch (e) {}
          socket.emit('exit', code);
          child = null;
        });
      };

      if (compileCmd) {
        const compiler = spawn(compileCmd.cmd, compileCmd.args);
        let compileErr = "";
        compiler.stderr.on('data', (d) => compileErr += d.toString());
        compiler.on('close', (code) => {
          if (code !== 0) {
            socket.emit('stderr', `Compilation Error:\n${compileErr}`);
            socket.emit('exit', code);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } else {
            execute();
          }
        });
      } else {
        execute();
      }

    } catch (err) {
      socket.emit('stderr', err.message);
      socket.emit('exit', 1);
    }
  });

  socket.on('input', (input) => {
    if (child && child.stdin.writable) {
      child.stdin.write(input + "\n");
    }
  });

  socket.on('disconnect', () => {
    if (child) child.kill();
  });
});

// --- ASSIGNMENT & GRADING ROUTES ---

app.get('/api/assignments/:id', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Allow teacher who created it, or students assigned to it
    const isTeacher = req.user.role === 'teacher' && assignment.teacherId?.toString() === req.user.id;
    const recipient = await db.collection('assignment_recipients').findOne({ assignment_id: assignmentId, student_id: String(req.user.id) });
    if (!isTeacher && !recipient) return res.status(403).json({ message: 'Forbidden' });

    const questions = await db.collection('assignment_questions').find({ assignment_id: assignmentId }).toArray();

    res.json({
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      course_id: assignment.courseId?.toString(),
      course_title: null,
      time_limit_minutes: assignment.time_limit_minutes,
      scheduled_start: assignment.scheduled_start,
      scheduled_end: assignment.scheduled_end,
      is_active: assignment.is_active,
      created_at: assignment.created_at,
      questions,
      status: recipient?.status || null,
      submitted_at: recipient?.submitted_at || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/assignments/:id/start', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const recipient = await db.collection('assignment_recipients').findOne({ assignment_id: assignmentId, student_id: String(req.user.id) });
    if (!recipient) return res.status(403).json({ message: 'Forbidden' });

    await db.collection('assignment_recipients').updateOne(
      { assignment_id: assignmentId, student_id: String(req.user.id) },
      { $set: { status: 'started', started_at: new Date() } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/assignments/:id/submit', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = String(req.user.id);
    const { answers } = req.body;

    const recipient = await db.collection('assignment_recipients').findOne({ assignment_id: assignmentId, student_id: studentId });
    if (!recipient) return res.status(403).json({ message: 'Forbidden' });

    await db.collection('assignment_recipients').updateOne(
      { assignment_id: assignmentId, student_id: studentId },
      { $set: { status: 'submitted', submitted_at: new Date() } }
    );

    await db.collection('submissions').updateOne(
      { assignment_id: assignmentId, student_id: studentId },
      { $set: { answers, submitted_at: new Date() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/assignments/:id/submissions', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(assignmentId) });
    const questions = await db.collection('assignment_questions').find({ assignment_id: assignmentId }).toArray();
    const recipients = await db.collection('assignment_recipients').find({ assignment_id: assignmentId }).toArray();
    
    if (!recipients.length) return res.json({ assignment, submissions: [] });

    const studentIds = recipients.map(r => new ObjectId(r.student_id));
    const students = await db.collection('users').find({ _id: { $in: studentIds } }).toArray();
    const allSubmissions = await db.collection('submissions').find({ assignment_id: assignmentId }).toArray();

    const submissions = recipients.map(r => {
      const student = students.find(s => s._id.toString() === r.student_id);
      const submission = allSubmissions.find(s => s.student_id === r.student_id);
      
      return {
        student_id: r.student_id,
        student_name: student?.fullName || "Unknown Student",
        status: r.status,
        submitted_at: r.submitted_at,
        answers: questions.map(q => {
          const ans = submission?.answers?.[q._id] || submission?.answers?.[q.id] || null;
          return {
            question_id: q._id,
            question_text: q.question_text,
            question_type: q.question_type,
            answer_text: ans,
            max_marks: q.max_marks,
            marks_awarded: r.grades?.[q._id] || null
          };
        }),
        feedback: r.feedback || ""
      };
    });

    res.json({ assignment, submissions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/assignments/:id/grade/:studentId', authenticate, async (req, res) => {
  try {
    const { grades, feedback } = req.body;
    await db.collection('assignment_recipients').updateOne(
      { assignment_id: req.params.id, student_id: req.params.studentId },
      { $set: { grades, feedback, status: 'graded', graded_at: new Date() } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Database
let db;
let dbError = null;
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    await db.collection('users').createIndex({ email: 1, role: 1 }, { unique: true });
    dbError = null;
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    dbError = err.message;
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

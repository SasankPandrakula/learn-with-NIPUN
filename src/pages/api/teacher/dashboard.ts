import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import clientPromise from "@/integrations/mongodb/client";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "secret";

function getTeacherIdFromAuth(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded?.role !== "teacher") return null;
    return decoded?.id;
  } catch (e) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const teacherIdStr = getTeacherIdFromAuth(req);
  if (!teacherIdStr) {
    return res.status(401).json({ message: "Not authenticated or not a teacher" });
  }

  const teacherId = new ObjectId(teacherIdStr);

  try {
    const client = await clientPromise;
    const db = client.db();
    const teacherId = new ObjectId(session.user._id);

    // --- Get the teacher's courses ---
    const teacherCourses = await db.collection("courses").find(
      { teacherId: teacherId },
      { projection: { _id: 1, title: 1 } }
    ).toArray();
    const courseIds = teacherCourses.map(c => c._id);

    // Map courses for front-end use
    const courses = teacherCourses.map(c => ({ id: c._id.toString(), title: c.title }));

    // --- Calculate Stats ---
    // 1. Total Students
    const totalStudents = await db.collection("enrollments").distinct("userId", { courseId: { $in: courseIds } });

    // 2. Active Courses
    const activeCourses = courseIds.length;

    // 3. Pending Reviews
    const pendingReviews = await db.collection("submissions").countDocuments({
      courseId: { $in: courseIds },
      isReviewed: { $ne: true }
    });

    // 4. Average Completion
    const avgCompletionResult = await db.collection("enrollments").aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
    ]).toArray();
    const avgCompletion = avgCompletionResult.length > 0 ? Math.round(avgCompletionResult[0].avgProgress) : 0;

    const stats = {
        totalStudents: totalStudents.length,
        activeCourses: activeCourses,
        pendingReviews: pendingReviews,
        avgCompletion: avgCompletion
    };

    // --- Fetch Assignment Progress ---
    const assignments = await db.collection("assignments").find({ courseId: { $in: courseIds } }).toArray();
    const assignmentIds = assignments.map(a => a._id.toString());

    const recipientCounts = await db.collection("assignment_recipients").aggregate([
      { $match: { assignment_id: { $in: assignmentIds } } },
      { $group: { _id: "$assignment_id", count: { $sum: 1 } } }
    ]).toArray();

    const submittedCounts = await db.collection("assignment_recipients").aggregate([
      { $match: { assignment_id: { $in: assignmentIds }, status: "submitted" } },
      { $group: { _id: "$assignment_id", count: { $sum: 1 } } }
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

    // --- Fetch Recent Submissions ---
    const recentSubmissions = await db.collection("submissions").aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $sort: { submittedAt: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "studentId",
                foreignField: "_id",
                as: "studentDetails"
            }
        },
        {
            $lookup: {
                from: "assignments",
                localField: "assignmentId",
                foreignField: "_id",
                as: "assignmentDetails"
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "courseDetails"
            }
        },
        { $unwind: "$studentDetails" },
        { $unwind: "$assignmentDetails" },
        { $unwind: "$courseDetails" },
        {
            $project: {
                _id: 0,
                student: "$studentDetails.fullName",
                assignment: "$assignmentDetails.title",
                course: "$courseDetails.title",
                date: "$submittedAt"
            }
        }
    ]).toArray();


    res.status(200).json({
      stats,
      courses,
      assignmentProgress,
      recentSubmissions,
    });

  } catch (error) {
    console.error("Failed to fetch teacher dashboard data", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

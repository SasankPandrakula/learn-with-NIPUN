import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "@/integrations/mongodb/client";
import { sessionOptions } from "@/lib/session";

// The shape of the data the frontend expects
interface EnrolledCourse {
  course_id: string;
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

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = req.session;
  if (!session.user || session.user.role !== "student") {
    return res.status(401).json({ message: "Not authenticated or not a student" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user._id);

    // --- Fetch Enrolled Courses ---
    const enrolledCourses = await db.collection("enrollments").aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      { $unwind: "$courseDetails" },
      {
        $project: {
          _id: 0,
          course_id: "$courseDetails._id",
          title: "$courseDetails.title",
          progress: "$progress",
          lesson_count: { $size: "$courseDetails.lessons" }, // Assuming lessons is an array in the courses collection
          completed: {
            $floor: {
              $multiply: [
                { $divide: ["$progress", 100] },
                { $size: "$courseDetails.lessons" }
              ]
            }
          }
        }
      }
    ]).toArray();

    // --- Fetch Upcoming Assignments ---
    // First, get the list of course IDs the student is enrolled in
    const enrolledCourseIds = enrolledCourses.map(c => new ObjectId(c.course_id));

    const upcomingAssignments = await db.collection("assignments").aggregate([
        { $match: { courseId: { $in: enrolledCourseIds }, dueDate: { $gte: new Date() } } },
        { $sort: { dueDate: 1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "courseDetails"
            }
        },
        { $unwind: "$courseDetails" },
        {
            $project: {
                _id: 0,
                id: "$_id",
                title: "$title",
                course_title: "$courseDetails.title",
                due_date: "$dueDate"
            }
        }
    ]).toArray();


    res.status(200).json({
      courses: enrolledCourses,
      assignments: upcomingAssignments,
    });

  } catch (error) {
    console.error("Failed to fetch student dashboard data", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

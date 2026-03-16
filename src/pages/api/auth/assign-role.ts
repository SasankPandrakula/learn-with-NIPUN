import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "@/integrations/mongodb/client";
import { authOptions } from "./[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { role } = req.body;

  if (!role || (role !== "student" && role !== "teacher")) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const userId = (session.user as any).id;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    if (result.modifiedCount === 0) {
      // This could also mean the role was already set to the same value.
      // For simplicity, we'll treat it as success unless we need to distinguish.
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    res.status(200).json({ message: "Role assigned successfully" });
  } catch (error) {
    console.error("Failed to assign role", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

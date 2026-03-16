import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";
import clientPromise from "@/integrations/mongodb/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hash(password, 12);

    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      fullName,
      role,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Failed to register user", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

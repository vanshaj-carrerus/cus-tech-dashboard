import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// Define Candidate schema/interface
interface Candidate {
  _id: string;
  name: string;
  role: string;
  status: "Applied" | "Interviewing" | "Reached Out" | "Rejected" | "Hired";
  createdAt: string;
}

export async function GET() {
  try {
    await dbConnect();

    // Get recent candidates (last 5)
    const candidates = await mongoose.connection
      .collection("candidates")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Transform data for frontend
    const recentApplications = candidates.map((doc: any) => ({
      id: doc._id?.toString() || Math.random().toString(),
      name: doc.name || "Unknown",
      role: doc.role || "N/A",
      status: doc.status || "Applied",
      date: new Date(doc.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    return NextResponse.json({
      success: true,
      data: recentApplications,
    });
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch candidates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

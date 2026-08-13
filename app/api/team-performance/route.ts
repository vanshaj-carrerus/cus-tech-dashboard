import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const collection = mongoose.connection.collection("daily_stats");

    // Get all time stats grouped by team member
    const teamPerformance = await collection
      .aggregate([
        {
          $group: {
            _id: "$teamMemberName",
            totalApplications: { $sum: "$applicationsCount" },
            totalInterviews: { $sum: "$interviewsCount" },
            totalReachOuts: { $sum: "$reachOutsCount" },
            submissionCount: { $sum: 1 },
            lastSubmitted: { $max: "$createdAt" },
          },
        },
        {
          $sort: { lastSubmitted: -1 },
        },
      ])
      .toArray();

    // Get top performers in each category with priority-based ranking
    // Priority: Interviews > Applications > Reach Outs
    const topPerformers = [...teamPerformance]
      .sort((a, b) => {
        // First, compare by interviews
        if (a.totalInterviews !== b.totalInterviews) {
          return b.totalInterviews - a.totalInterviews;
        }
        // If interviews are equal, compare by applications
        if (a.totalApplications !== b.totalApplications) {
          return b.totalApplications - a.totalApplications;
        }
        // If applications are equal, compare by reach outs
        return b.totalReachOuts - a.totalReachOuts;
      })
      .slice(0, 6);

    const lowestPerformers = [...teamPerformance]
      .sort((a, b) => {
        // Same priority order but reverse for lowest
        if (a.totalInterviews !== b.totalInterviews) {
          return a.totalInterviews - b.totalInterviews;
        }
        if (a.totalApplications !== b.totalApplications) {
          return a.totalApplications - b.totalApplications;
        }
        return a.totalReachOuts - b.totalReachOuts;
      })
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        topPerformers: topPerformers.map((member: any) => ({
          name: member._id,
          applications: member.totalApplications,
          interviews: member.totalInterviews,
          reachOuts: member.totalReachOuts,
          submissions: member.submissionCount,
        })),
        lowestPerformers: lowestPerformers.map((member: any) => ({
          name: member._id,
          applications: member.totalApplications,
          interviews: member.totalInterviews,
          reachOuts: member.totalReachOuts,
          submissions: member.submissionCount,
        })),
        allTeamMembers: teamPerformance.map((member: any) => ({
          name: member._id,
          applications: member.totalApplications,
          interviews: member.totalInterviews,
          reachOuts: member.totalReachOuts,
          submissions: member.submissionCount,
          lastSubmitted: new Date(member.lastSubmitted).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch team performance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team performance",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const candidateName = url.searchParams.get("candidate");

    if (!candidateName) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate name is required",
        },
        { status: 400 }
      );
    }

    const collection = mongoose.connection.collection("daily_stats");

    // Get all submissions for this candidate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await collection
      .find({
        teamMemberName: candidateName.trim(),
        date: {
          $gte: thirtyDaysAgo,
        },
      })
      .sort({ date: -1 })
      .toArray();

    // Flatten the history to include edit history
    const allHistoryEntries: any[] = [];

    history.forEach((record: any) => {
      // Add the original submission
      allHistoryEntries.push({
        id: record._id?.toString() || "",
        teamMemberName: record.teamMemberName,
        applicationsCount: record.applicationsCount,
        interviewsCount: record.interviewsCount,
        reachOutsCount: record.reachOutsCount,
        date: new Date(record.date).toLocaleDateString("en-US"),
        submittedAt: new Date(record.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        isEdit: false,
      });

      // Add edit history entries if they exist
      if (record.editHistory && Array.isArray(record.editHistory)) {
        record.editHistory.forEach((edit: any, index: number) => {
          allHistoryEntries.push({
            id: `${record._id?.toString() || ""}_edit_${index}`,
            teamMemberName: record.teamMemberName,
            applicationsCount: edit.newValues.applicationsCount,
            interviewsCount: edit.newValues.interviewsCount,
            reachOutsCount: edit.newValues.reachOutsCount,
            date: new Date(edit.timestamp).toLocaleDateString("en-US"),
            submittedAt: new Date(edit.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }),
            isEdit: true,
            previousValues: edit.previousValues,
          });
        });
      }
    });

    // Sort by timestamp (most recent first)
    allHistoryEntries.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      data: allHistoryEntries,
    });
  } catch (error) {
    console.error("Failed to fetch candidate history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch candidate history",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

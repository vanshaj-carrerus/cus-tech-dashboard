import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { teamMemberName, applicationsCount, interviewsCount, reachOutsCount } = body;

    // Validate required fields
    if (!teamMemberName || applicationsCount === undefined || interviewsCount === undefined || reachOutsCount === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const collection = mongoose.connection.collection("daily_stats");

    const result = await collection.insertOne({
      teamMemberName: teamMemberName.trim(),
      applicationsCount: parseInt(applicationsCount),
      interviewsCount: parseInt(interviewsCount),
      reachOutsCount: parseInt(reachOutsCount),
      date: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Daily stats submitted successfully",
        data: {
          id: result.insertedId.toString(),
          teamMemberName,
          applicationsCount,
          interviewsCount,
          reachOutsCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add daily stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit daily stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const collection = mongoose.connection.collection("daily_stats");

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await collection
      .find({
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Aggregate totals
    const totals = {
      totalApplications: 0,
      totalInterviews: 0,
      totalReachOuts: 0,
      teamMembersSubmitted: 0,
    };

    todayStats.forEach((stat: any) => {
      totals.totalApplications += stat.applicationsCount || 0;
      totals.totalInterviews += stat.interviewsCount || 0;
      totals.totalReachOuts += stat.reachOutsCount || 0;
      totals.teamMembersSubmitted += 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        todayStats: todayStats.map((stat: any) => ({
          id: stat._id?.toString() || "",
          teamMemberName: stat.teamMemberName,
          applicationsCount: stat.applicationsCount,
          interviewsCount: stat.interviewsCount,
          reachOutsCount: stat.reachOutsCount,
          submittedAt: new Date(stat.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
        totals,
      },
    });
  } catch (error) {
    console.error("Failed to fetch daily stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch daily stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id, teamMemberName, applicationsCount, interviewsCount, reachOutsCount } = body;

    if (!id || !teamMemberName || applicationsCount === undefined || interviewsCount === undefined || reachOutsCount === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const collection = mongoose.connection.collection("daily_stats");
    const objectId = new mongoose.Types.ObjectId(id);

    // Get the current document first
    const currentDoc = await collection.findOne({ _id: objectId });

    if (!currentDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    // Update the main document with new values
    const result = await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          applicationsCount: parseInt(applicationsCount),
          interviewsCount: parseInt(interviewsCount),
          reachOutsCount: parseInt(reachOutsCount),
          updatedAt: new Date(),
        },
        $push: {
          // Store edit history in the same document
          editHistory: {
            timestamp: new Date(),
            previousValues: {
              applicationsCount: currentDoc.applicationsCount,
              interviewsCount: currentDoc.interviewsCount,
              reachOutsCount: currentDoc.reachOutsCount,
            },
            newValues: {
              applicationsCount: parseInt(applicationsCount),
              interviewsCount: parseInt(interviewsCount),
              reachOutsCount: parseInt(reachOutsCount),
            },
          },
        } as any,
      } as any
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      data: {
        id,
        teamMemberName,
        applicationsCount,
        interviewsCount,
        reachOutsCount,
      },
    });
  } catch (error) {
    console.error("Failed to update daily stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update daily stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing submission ID",
        },
        { status: 400 }
      );
    }

    const collection = mongoose.connection.collection("daily_stats");
    const objectId = new mongoose.Types.ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("Failed to delete daily stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete daily stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

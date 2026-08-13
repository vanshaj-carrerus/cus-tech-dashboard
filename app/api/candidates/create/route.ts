import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, role, status } = body;

    // Validate required fields
    if (!name || !role || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, role, status",
        },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "Applied",
      "Interviewing",
      "Reached Out",
      "Rejected",
      "Hired",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const collection = mongoose.connection.collection("candidates");

    const result = await collection.insertOne({
      name: name.trim(),
      role: role.trim(),
      status,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Candidate added successfully",
        data: {
          id: result.insertedId.toString(),
          name,
          role,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add candidate:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add candidate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    // Await the database connection
    await dbConnect();
    
    // Simulate fetching candidates
    // const candidates = await Candidate.find({});
    
    return NextResponse.json(
      { success: true, message: 'Successfully connected to MongoDB!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to connect to the database', error: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { username, email, mobile, dob } = body;

  if (!username || !email || !mobile || !dob) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        mobile,
        dob,
      },
    });

    // Update metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboarded: true,
      },
    });

    return NextResponse.json(
      {
        message: "You're all set! Your account was created successfully.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during user creation and metadata update:", error);
    return NextResponse.json(
      { message: "Server error during user creation and metadata update" },
      { status: 500 }
    );
  }
}

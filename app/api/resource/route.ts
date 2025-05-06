import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { uploadPDFBuffer } from "@/lib/bufferToStream";

// GET: get single or multiple resources
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const topicId = searchParams.get("topicId");

  try {
    if (id) {
      const resource = await prisma.resource.findUnique({ where: { id } });
      if (!resource)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      return NextResponse.json({ resource });
    }

    if (topicId) {
      const resources = await prisma.resource.findMany({
        where: { topicId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ resources });
    }

    return NextResponse.json(
      { message: "id or topicId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET resource error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: create new resource
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const body = await req.json();
  const { topicId, title, type, url, summary } = body;

  if (!topicId || !title || !type || !url) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
    try {
      const resource = await prisma.resource.create({
        data: { topicId, title, type, url, summary: summary || "" },
      });
  
      return NextResponse.json(
        { message: "Resource created", resource },
        { status: 201 }
      );
    } catch (error) {
      console.error("POST resource error:", error);
      return NextResponse.json({ message: "Creation failed" }, { status: 500 });
    }
  }
   


  else if (contentType?.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    const type =  formData.get("type");
    const title = formData.get("title");
    const topicId = formData.get("topicId")
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }
    if (type !== "PDF" || typeof title !== "string" || typeof topicId !== "string") {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Now you can do anything with `buffer`
    // e.g., save to disk, upload to S3, or store in DB
  
    const uploadResult = await uploadPDFBuffer(buffer, file.name.replace(/\.pdf$/, ""));
    console.log(uploadResult)
    const url= (uploadResult as any).secure_url
    console.log(url)
    const resource = await prisma.resource.create({
      data: { topicId, title, type, url, summary: "" }, //summary: summary || "" //create krte hue summary paas ni ho ri toh "" hi store krwa rha hu
    });
    return NextResponse.json(
      { message: "Resource created", resource },
      { status: 201 }
    );
  }
  else {
    return NextResponse.json({ message: "Creation failed. No valid type" }, { status: 500 });
  }
}

// PUT: update resource
export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, summary } = body;

  if (!id)
    return NextResponse.json(
      { message: "Resource ID is required" },
      { status: 400 }
    );

  try {
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        title,
        summary,
      },
    });

    return NextResponse.json({
      message: "Resource updated",
      resource: updated,
    });
  } catch (error) {
    console.error("PUT resource error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

// DELETE: delete resource
export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;

  if (!id)
    return NextResponse.json(
      { message: "Resource ID is required" },
      { status: 400 }
    );

  try {
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("DELETE resource error:", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import db from "@/db";
import { z } from "zod";

const settingsSchema = z.object({
  logo_url: z.string().url("Must be a valid URL").or(z.string().min(1)),
});

export async function GET() {
  try {
    const settings = await db("settings").select("key", "value");
    const formattedSettings = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json({ data: formattedSettings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = settingsSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.issues[0].message }, { status: 400 });
    }

    const { logo_url } = parsedData.data;

    await db("settings").insert({ key: "logo_url", value: logo_url }).onConflict("key").merge();

    return NextResponse.json({ success: true, data: { logo_url } }, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

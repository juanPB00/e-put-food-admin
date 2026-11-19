import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("sid");
  return NextResponse.json({ redirect: "/login" });
}

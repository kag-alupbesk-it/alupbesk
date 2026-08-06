import { getUsersData } from "@/backend/modules/manager";
export async function GET() { return Response.json({ success: true, data: getUsersData() }); }

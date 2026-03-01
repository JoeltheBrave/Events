import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

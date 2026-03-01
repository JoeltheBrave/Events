import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function requireAdmin(): Promise<{ id: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return { id: session.user.id };
}

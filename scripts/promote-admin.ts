import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const result = await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.email, "admin@example.com"));
    console.log("Updated user to admin role");
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}

main();

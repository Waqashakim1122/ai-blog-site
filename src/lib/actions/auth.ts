"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  // Independent check against the same shared limiter authorize() writes
  // to (both run in-process, so this reads live state) — this is what
  // guarantees a clear, correctly-worded message every time, rather than
  // depending on whatever NextAuth's internal error handling preserves of
  // a thrown error's custom properties across its own re-throw.
  const ip = getClientIp(await headers());
  const { allowed, retryAfterSeconds } = checkLoginRateLimit(ip);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: String(formData.get("callbackUrl") || "/admin/dashboard"),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password.";
      }
      return "Something went wrong. Please try again.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}

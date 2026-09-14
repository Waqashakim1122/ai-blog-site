"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
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

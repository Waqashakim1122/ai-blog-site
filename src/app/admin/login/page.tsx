import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-4 py-14">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8">
        <h1 className="text-xl font-bold tracking-tight">{SITE_NAME} Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage posts and authors.</p>

        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl || "/admin/dashboard"} />
        </div>
      </div>
    </div>
  );
}

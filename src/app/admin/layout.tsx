import type { Metadata } from "next";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
      <AdminSidebar role={session.user.role} name={session.user.name || session.user.email || "User"} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

import React, { Suspense } from "react";
import { connection } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

async function AdminContent() {
  await connection();
  const session = await getAdminSession();
  return (
    <AdminDashboard
      initialUser={
        session ? { email: session.email, name: session.name } : null
      }
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

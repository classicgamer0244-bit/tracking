import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PostLoginPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/login");

  if (user.role === "SUPER_ADMIN") redirect("/super-admin/dashboard");
  if (user.role === "MERCHANT_OWNER" || user.role === "MERCHANT_STAFF") {
    redirect("/merchant/dashboard");
  }
  redirect("/login");
}

import Link from "next/link";
import { OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <OctagonAlert className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-semibold">Account suspended</h1>
      <p className="max-w-md text-muted-foreground">
        Your merchant account is currently inactive or suspended. Please contact the platform
        administrator to resolve this.
      </p>
      <Button render={<Link href="/login" />}>Back to sign in</Button>
    </div>
  );
}

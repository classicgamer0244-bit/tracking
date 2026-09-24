import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileIncompleteBanner() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-medium">Welcome! Complete your merchant profile.</p>
            <p className="text-sm text-muted-foreground">
              Add your business name, contact info, and logo so customers recognize you on tracking
              pages. Totally optional — you can do this anytime from Settings.
            </p>
          </div>
        </div>
        <Button size="sm" render={<Link href="/merchant/settings" />}>
          Complete profile
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationsList() {
  const { data, mutate } = useSWR("my-notifications-full", () => getMyNotifications(), {
    refreshInterval: 8000,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.unreadCount ?? 0} unread</p>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await markAllNotificationsRead();
              mutate();
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {data && data.notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <BellOff className="h-8 w-8" />
            No notifications yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {data?.notifications.map((n) => (
          <Card
            key={n.id}
            className={cn("cursor-pointer", !n.read && "border-primary/40 bg-primary/5")}
            onClick={async () => {
              if (!n.read) {
                await markNotificationRead(n.id);
                mutate();
              }
            }}
          >
            <CardContent className="flex items-start gap-3 py-4">
              <Bell className={cn("mt-0.5 h-4 w-4 shrink-0", n.read ? "text-muted-foreground" : "text-primary")} />
              <div className="flex-1">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

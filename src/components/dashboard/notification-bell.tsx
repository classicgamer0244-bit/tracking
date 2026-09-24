"use client";

import useSWR from "swr";
import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { data, mutate } = useSWR("my-notifications", () => getMyNotifications(), {
    refreshInterval: 8000,
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduceMotion ? undefined : { scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground"
            >
              {!reduceMotion && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-destructive"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <span className="relative">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={async () => {
                await markAllNotificationsRead();
                mutate();
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {!data ? (
            <div className="space-y-3 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : data.notifications.length === 0 ? (
            <EmptyState icon={BellOff} title="No notifications yet" description="You're all caught up." className="py-10" />
          ) : (
            <ul className="divide-y">
              {data.notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "cursor-pointer px-3 py-2.5 text-sm hover:bg-muted/60",
                    !n.read && "bg-primary/5",
                  )}
                  onClick={async () => {
                    if (!n.read) {
                      await markNotificationRead(n.id);
                      mutate();
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className={cn("flex-1", n.read && "pl-3.5")}>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-muted-foreground">{n.body}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

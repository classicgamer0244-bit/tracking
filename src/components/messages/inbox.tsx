"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search, Archive, ArchiveRestore, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMyConversations,
  getConversation,
  replyToConversationAction,
  markConversationReadAction,
  setConversationArchivedAction,
  deleteConversationAction,
} from "@/actions/messages";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/actions/shipments";

const initialState: ActionResult = { success: false };

export function MessagesInbox({ readOnly = false }: { readOnly?: boolean }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "ARCHIVED" | "ALL">("OPEN");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations, mutate: mutateList } = useSWR(
    ["conversations", search, statusFilter],
    () => getMyConversations({ search, status: statusFilter }),
    { refreshInterval: 6000 },
  );

  const activeId = selectedId ?? conversations?.[0]?.id ?? null;

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[340px_1fr]">
      <div className="flex flex-col rounded-lg border bg-background">
        <div className="space-y-2 border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1">
          {conversations?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No conversations found.</p>
          )}
          <ul className="divide-y">
            {conversations?.map((c) => {
              const lastMessage = c.messages[0];
              const unread = c._count.messages > 0;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-muted/60",
                      activeId === c.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.customer.name}</span>
                      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.shipment.trackingNumber}</p>
                    {lastMessage && (
                      <p className="mt-1 truncate text-muted-foreground">{lastMessage.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>

      <div className="rounded-lg border bg-background">
        {activeId ? (
          <ConversationThread
            key={activeId}
            conversationId={activeId}
            readOnly={readOnly}
            onMutateList={mutateList}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a conversation to view messages.
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationThread({
  conversationId,
  readOnly,
  onMutateList,
}: {
  conversationId: string;
  readOnly: boolean;
  onMutateList: () => void;
}) {
  const { data: conversation, mutate } = useSWR(
    ["conversation", conversationId],
    () => getConversation(conversationId),
    { refreshInterval: 5000 },
  );
  const [state, formAction, pending] = useActionState(replyToConversationAction, initialState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!readOnly) {
      markConversationReadAction(conversationId).then(() => onMutateList());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (state.success) {
      mutate();
      onMutateList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!conversation) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <p className="font-medium">{conversation.customer.name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.customer.email} · {conversation.shipment.trackingNumber}
            {conversation.merchant && ` · ${conversation.merchant.businessName}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/track/${conversation.shipment.trackingNumber}`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            <ExternalLink className="inline h-3 w-3" /> Tracking page
          </Link>
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={conversation.status === "ARCHIVED" ? "Restore" : "Archive"}
                onClick={() =>
                  startTransition(async () => {
                    await setConversationArchivedAction(conversationId, conversation.status !== "ARCHIVED");
                    mutate();
                    onMutateList();
                  })
                }
              >
                {conversation.status === "ARCHIVED" ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title="Delete conversation"
                onClick={() =>
                  startTransition(async () => {
                    await deleteConversationAction(conversationId);
                    toast.success("Conversation deleted");
                    onMutateList();
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {conversation.messages.map((m) => (
            <div key={m.id} className={m.senderType === "MERCHANT" ? "text-right" : "text-left"}>
              <div
                className={cn(
                  "inline-block max-w-md rounded-lg px-3 py-2 text-sm",
                  m.senderType === "MERCHANT" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.body}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {m.senderType === "MERCHANT" ? m.senderUser?.name ?? "Merchant" : conversation.customer.name} ·{" "}
                {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>

      {!readOnly && (
        <form action={formAction} className="flex items-end gap-2 border-t p-3">
          <input type="hidden" name="conversationId" value={conversationId} />
          <Textarea name="body" placeholder="Type your reply..." rows={2} required className="flex-1" />
          <Button type="submit" disabled={pending}>
            {pending ? "Sending..." : "Reply"}
          </Button>
        </form>
      )}
      {readOnly && (
        <div className="border-t p-3 text-center text-xs text-muted-foreground">
          Read-only view — Super Admins do not reply to merchant conversations.
        </div>
      )}
    </div>
  );
}

import { MessagesInbox } from "@/components/messages/inbox";

export default function SuperAdminMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Read-only view of every merchant&apos;s customer conversations.</p>
      </div>
      <MessagesInbox readOnly />
    </div>
  );
}

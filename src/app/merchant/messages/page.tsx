import { MessagesInbox } from "@/components/messages/inbox";

export default function MerchantMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Reply to customers asking about their shipments.</p>
      </div>
      <MessagesInbox />
    </div>
  );
}

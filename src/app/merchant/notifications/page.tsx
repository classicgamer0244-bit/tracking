import { NotificationsList } from "@/components/dashboard/notifications-list";

export default function MerchantNotificationsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
      <NotificationsList />
    </div>
  );
}

import Link from "next/link";
import { ModerationEventsList } from "./ModerationEventsList";

export default function ModerationEventsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Moderate events</h1>
      <ModerationEventsList />
    </div>
  );
}

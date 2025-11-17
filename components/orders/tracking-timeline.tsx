"use client";

type TrackingEvent = {
  status: string;
  recordedAt: string;
  location?: string;
  remarks?: string;
};

export default function TrackingTimeline({ events = [] }: { events: TrackingEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">Tracking not available yet.</p>;
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <ol className="relative border-l border-muted-foreground/40 pl-4 space-y-4">
      {sorted.map((event, index) => (
        <li key={`${event.status}-${index}`} className="ml-2">
          <div className="absolute -left-2 top-1.5 h-3 w-3 rounded-full bg-[#AE876D]" />
          <p className="text-sm font-medium capitalize">{event.status}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.recordedAt).toLocaleString()}
            {event.location ? ` · ${event.location}` : ''}
          </p>
          {event.remarks && <p className="text-xs mt-1">{event.remarks}</p>}
        </li>
      ))}
    </ol>
  );
}



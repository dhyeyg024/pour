"use client";

import { trackEvent } from "@/lib/analytics";

type TrackButtonProps = {
  eventName: string;
  eventLabel: string;
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function TrackButton({
  eventName,
  eventLabel,
  href,
  children,
  className
}: TrackButtonProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => trackEvent(eventName, { label: eventLabel })}
    >
      {children}
    </a>
  );
}

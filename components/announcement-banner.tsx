"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (pathname !== "/" || dismissed) return null;

  return (
    <div className="hu-announce">
      <Link href="/organizer">
        <span className="hu-live" aria-hidden="true" />
        <span>Organizer Applications for V8 are open!</span>
        <span className="hu-announce-cta">
          See more
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:bg-black/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

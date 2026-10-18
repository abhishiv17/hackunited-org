import Link from "next/link";
import { Plane } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A ticket: main section, perforation with notches, and a tear-off stub.
 * Used wherever the site hands the visitor on to their next step. Renders
 * as a link when given an href.
 */
export default function BoardingPass({
  href,
  label,
  code,
  from,
  to,
  detail,
  stub,
  className = "",
}: {
  href?: string;
  label: string;
  code: string;
  from: string;
  to: string;
  detail?: ReactNode;
  stub: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <div className="hu-pass-main">
        <div className="hu-pass-top hu-mono">
          <span className="hu-pass-label">{label}</span>
          <span>{code}</span>
        </div>
        <div className="hu-pass-route">
          <span className="hu-pass-end">
            <span className="hu-mono">From</span>
            {from}
          </span>
          <span className="hu-pass-path" aria-hidden="true">
            <Plane className="hu-pass-plane" />
          </span>
          <span className="hu-pass-end hu-pass-to">
            <span className="hu-mono">To</span>
            {to}
          </span>
        </div>
        {detail && <div className="hu-pass-detail">{detail}</div>}
      </div>
      <div className="hu-pass-stub">
        {stub}
        <span className="hu-pass-barcode" aria-hidden="true" />
      </div>
    </>
  );

  // The wrapper is the size container, so the pass can switch layout by its own width.
  return (
    <div className={`hu-pass-wrap ${className}`}>
      {href?.startsWith("/") ? (
        <Link href={href} className="hu-pass nb-hover">
          {body}
        </Link>
      ) : href ? (
        <a href={href} className="hu-pass nb-hover">
          {body}
        </a>
      ) : (
        <div className="hu-pass">{body}</div>
      )}
    </div>
  );
}

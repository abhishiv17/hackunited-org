"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { routeName } from "./route";
import { reducedMotion } from "@/lib/motion";

/**
 * Travelling between pages: a lavender panel sweeps in from the right with a
 * small route map (a dot riding from this page to the next), the route
 * changes underneath, and the panel carries on out to the left, so moving
 * between pages always reads as moving forward.
 *
 * Only plain left-clicks on links to known internal pages are taken over.
 * New-tab clicks, external links, same-page anchors and reduced-motion
 * users get ordinary navigation.
 */
export default function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const travelling = useRef(false);
  const [trip, setTrip] = useState({ from: "", to: "" });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      const name = routeName(url.pathname);
      if (!name) return;
      if (reducedMotion()) return;

      // Stop Next's <Link> handler; we navigate once the panel has covered the page.
      e.preventDefault();
      e.stopPropagation();
      if (travelling.current) return;
      travelling.current = true;
      setTrip({ from: routeName(window.location.pathname) || "Here", to: name });

      gsap
        .timeline()
        .set(curtainRef.current, { x: 0, xPercent: 100, autoAlpha: 1 })
        .set(fillRef.current, { scaleX: 0 })
        .set(dotRef.current, { left: "0%" })
        .to(curtainRef.current, { xPercent: 0, duration: 0.5, ease: "power3.inOut" })
        .fromTo(innerRef.current, { x: 80 }, { x: 0, duration: 0.6, ease: "power3.out" }, 0.1)
        .to(fillRef.current, { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, 0.35)
        .to(dotRef.current, { left: "100%", duration: 0.45, ease: "power2.inOut" }, 0.35)
        .call(() => router.push(url.pathname + url.search + url.hash));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!travelling.current) return;
    travelling.current = false;
    window.scrollTo(0, 0);
    gsap
      .timeline({ delay: 0.15 })
      .to(innerRef.current, { x: -80, duration: 0.6, ease: "power3.in" }, 0)
      .to(curtainRef.current, { xPercent: -100, duration: 0.6, ease: "power3.inOut" }, 0)
      .set(curtainRef.current, { autoAlpha: 0 });
  }, [pathname]);

  return (
    <div ref={curtainRef} className="hu-curtain" aria-hidden="true">
      <div ref={innerRef} className="hu-curtain-inner">
        <span className="hu-curtain-kicker hu-mono">
          <span className="hu-live" />
          Next stop
        </span>
        <span className="hu-curtain-name">{trip.to}</span>
        <span className="hu-curtain-route hu-mono">
          <span>{trip.from}</span>
          <span className="hu-curtain-line">
            <span ref={fillRef} className="hu-curtain-fill" />
            <span ref={dotRef} className="hu-curtain-dot" />
          </span>
          <span>{trip.to}</span>
        </span>
      </div>
    </div>
  );
}

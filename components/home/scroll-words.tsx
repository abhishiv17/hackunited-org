"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export type WordSegment = string | { text: string; mark: "a" | "b" };

/**
 * A statement read by scrolling. Each word flips up out of a blur as it is
 * reached, and marked phrases get a highlighter stroke that sweeps in once
 * their last word has landed. Scrubbed to scroll position, so it plays
 * backwards when you scroll back up. The text is real, selectable copy.
 */
export default function ScrollWords({ segments, className = "" }: { segments: WordSegment[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = gsap.matchMedia();
    media.add("all", () => {
      if (reducedMotion()) return;
      const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.6 },
      });

      words.forEach((word, i) => {
        tl.fromTo(
          word,
          { opacity: 0.12, yPercent: 55, rotateX: -80, filter: "blur(6px)" },
          { opacity: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)", duration: 0.5 },
          i * 0.12
        );
      });

      // Highlighters start once the last word of their phrase is in place.
      el.querySelectorAll<HTMLElement>("[data-mark]").forEach((mark) => {
        const last = Array.from(mark.querySelectorAll<HTMLElement>("[data-w]")).pop();
        const at = last ? words.indexOf(last) * 0.12 + 0.3 : 0;
        tl.fromTo(
          mark.querySelector(".hu-mark-ink"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: "power3.inOut" },
          at
        );
      });
    });

    return () => media.revert();
  }, [segments]);

  const word = (text: string, key: string) => (
    <span key={key} data-w className="hu-sw-word">
      {text}
    </span>
  );

  return (
    <p ref={ref} className={`hu-scroll-words ${className}`}>
      {segments.map((seg, i) => {
        if (typeof seg === "string") {
          return seg.split(" ").map((w, j) => (
            <span key={`${i}-${j}`}>
              {word(w, `${i}-${j}-w`)}{" "}
            </span>
          ));
        }
        return (
          <span key={i}>
            <span className="hu-mark" data-mark={seg.mark}>
              <span className="hu-mark-ink" aria-hidden="true" />
              {seg.text.split(" ").map((w, j, all) => (
                <span key={j}>
                  {word(w, `${i}-${j}-w`)}
                  {j < all.length - 1 ? " " : ""}
                </span>
              ))}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MOTION, reducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

const sortByDocument = (nodes: Element[]) =>
  nodes.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

/**
 * Site-wide scroll motion, re-applied on every route:
 *  - [data-split] headings rise in word by word.
 *  - [data-drop] cards slide up into place as they enter.
 * Nothing runs for reduced-motion users, and transforms are cleared after
 * each animation so they never fight the cards' own hover lift.
 */
export default function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const media = gsap.matchMedia();

    media.add("all", () => {
      if (reducedMotion()) return;
      const splits = gsap.utils.toArray<HTMLElement>("[data-split]").map((el) =>
        SplitText.create(el, {
          type: "words",
          wordsClass: "hu-split-word",
          // The accent-word sticker drops in as one piece, in reading order.
          ignore: "em",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(sortByDocument([...self.words, ...el.querySelectorAll("em")]), {
              yPercent: 60,
              opacity: 0,
              duration: MOTION.duration,
              ease: MOTION.ease,
              stagger: 0.05,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        })
      );

      const drops = gsap.utils.toArray<HTMLElement>("[data-drop]");
      gsap.set(drops, { opacity: 0, y: 40 });
      const batches = ScrollTrigger.batch(drops, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, { opacity: 0, y: 40 }, {
            opacity: 1,
            y: 0,
            duration: MOTION.duration,
            ease: MOTION.ease,
            stagger: 0.08,
            clearProps: "transform,opacity",
          }),
      });

      // Layout can shift as fonts and images load.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const timer = window.setTimeout(refresh, 600);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("load", refresh);
        batches.forEach((t) => t.kill());
        splits.forEach((s) => s.revert());
        gsap.set(drops, { clearProps: "transform,opacity" });
      };
    });

    return () => media.revert();
  }, [pathname]);

  return null;
}

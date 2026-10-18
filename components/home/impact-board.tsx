"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SplitFlap from "./split-flap";
import { impactHighlights } from "./data";

/** Impact figures on a departure board. Hovering a cell riffles it again. */
export default function ImpactBoard() {
  const [replay, setReplay] = useState<number[]>(() => impactHighlights.map(() => 0).concat(0));
  const again = (i: number) =>
    setReplay((prev) => prev.map((n, j) => (j === i ? n + 1 : n)));

  return (
    <div className="hu-board">
      {impactHighlights.map((item, i) => (
        <article
          key={item.label}
          className="hu-board-cell nb nb-hover"
          onPointerEnter={(e) => e.pointerType === "mouse" && again(i)}
          data-drop
        >
          <h3 className="hu-board-label hu-mono">{item.label}</h3>
          <SplitFlap value={item.value} replayKey={replay[i]} className="hu-board-num" />
          <p className="hu-board-detail">{item.detail}</p>
        </article>
      ))}
      <a
        href="https://fund.hackunited.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="hu-board-cell hu-board-fund nb nb-alt nb-hover"
        onPointerEnter={(e) => e.pointerType === "mouse" && again(3)}
          data-drop
      >
        <div className="hu-board-head">
          <h3 className="hu-board-label hu-mono">United Fund</h3>
          <span className="hu-board-link">
            Learn more
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <SplitFlap value="FUND" replayKey={replay[3]} className="hu-board-num" />
        <p className="hu-board-detail">Small grants ($50-$500) so student projects can ship past the prototype.</p>
      </a>
    </div>
  );
}

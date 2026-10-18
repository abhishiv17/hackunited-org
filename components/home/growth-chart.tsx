"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION, reducedMotion } from "@/lib/motion";
import { hackathons } from "./data";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Participants per edition are lower bounds ("400+"), so the running total is too.
const points = (() => {
  let total = 0;
  return hackathons.map((h) => {
    const added = parseInt(h.stats[0].value.replace(/\D/g, ""), 10);
    total += added;
    const [month, year] = h.date.split(" ");
    return { label: h.label, date: h.date, added, total, t: parseInt(year, 10) * 12 + MONTHS.indexOf(month) };
  });
})();

const fmt = (n: number) => n.toLocaleString("en-US");
const PAD = { top: 28, right: 64, bottom: 34, left: 44 };
const HEIGHT = 260;
const Y_MAX = 4000;
const Y_TICKS = [0, 1000, 2000, 3000, 4000];

/**
 * Cumulative hackathon participants across editions, on a real time axis.
 * Single series, so no legend: the title names it. Hover (or arrow keys)
 * moves a crosshair with a tooltip; the line draws itself in on scroll.
 */
export default function GrowthChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const t0 = points[0].t;
    const t1 = points[points.length - 1].t;
    const plotW = width - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + ((t - t0) / (t1 - t0)) * plotW;
    const y = (v: number) => PAD.top + plotH - (v / Y_MAX) * plotH;
    const xy = points.map((p) => ({ ...p, x: x(p.t), y: y(p.total) }));
    const line = xy.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${xy[xy.length - 1].x.toFixed(1)},${y(0)} L${xy[0].x.toFixed(1)},${y(0)} Z`;
    return { xy, line, area, y, plotBottom: y(0) };
  }, [width]);

  // Draw the line in as the chart scrolls into view.
  useEffect(() => {
    const path = lineRef.current;
    if (!path || reducedMotion()) return;
    const length = path.getTotalLength();
    const tween = gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length },
      {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: MOTION.ease,
        scrollTrigger: { trigger: path, start: "top 85%", once: true },
        onComplete: () => {
          gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" });
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [geo.line]);

  const nearest = (clientX: number) => {
    const box = wrapRef.current!.getBoundingClientRect();
    const px = clientX - box.left;
    let best = 0;
    geo.xy.forEach((p, i) => {
      if (Math.abs(p.x - px) < Math.abs(geo.xy[best].x - px)) best = i;
    });
    return best;
  };

  const active = hover !== null ? geo.xy[hover] : null;
  const last = geo.xy[geo.xy.length - 1];

  return (
    <figure className="hu-growth nb" data-drop>
      <figcaption className="hu-growth-head">
        <h3 className="hu-growth-title">Hackathon participants, cumulative</h3>
        <p className="hu-growth-sub hu-mono">United Hacks V1–V6 · Aug 2023 – Jan 2026</p>
      </figcaption>

      <div
        ref={wrapRef}
        className="hu-growth-plot"
        tabIndex={0}
        aria-label="Cumulative participants chart. Use left and right arrow keys to read each edition."
        onPointerMove={(e) => setHover(nearest(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover((h) => h ?? points.length - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          setHover((h) => Math.max(0, Math.min(points.length - 1, (h ?? points.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
        }}
      >
        <svg width={width} height={HEIGHT} aria-hidden="true">
          {Y_TICKS.map((v) => (
            <g key={v}>
              <line className="hu-growth-grid" x1={PAD.left} x2={width - PAD.right} y1={geo.y(v)} y2={geo.y(v)} />
              <text className="hu-growth-tick" x={PAD.left - 8} y={geo.y(v)} textAnchor="end" dominantBaseline="middle">
                {v === 0 ? "0" : `${v / 1000}k`}
              </text>
            </g>
          ))}

          <path className="hu-growth-area" d={geo.area} />
          <path ref={lineRef} className="hu-growth-line" d={geo.line} />

          {active && (
            <line className="hu-growth-cross" x1={active.x} x2={active.x} y1={PAD.top - 8} y2={geo.plotBottom} />
          )}

          {geo.xy.map((p, i) => (
            <g key={p.label}>
              <circle className="hu-growth-dot" cx={p.x} cy={p.y} r={hover === i ? 6 : 4.5} data-active={hover === i || undefined} />
              <text className="hu-growth-x" x={p.x} y={HEIGHT - 10} textAnchor="middle">
                {p.label}
              </text>
            </g>
          ))}

          <text className="hu-growth-end" x={last.x + 10} y={last.y} dominantBaseline="middle">
            {fmt(last.total)}+
          </text>
        </svg>

        {active && (
          <div
            className="hu-growth-tip"
            style={{
              left: Math.min(Math.max(active.x, 90), width - 90),
              top: active.y - 14,
            }}
          >
            <span className="hu-mono">
              {active.label} · {active.date}
            </span>
            <strong>{fmt(active.total)}+ total</strong>
            <span>+{fmt(active.added)} this edition</span>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Cumulative hackathon participants by edition</caption>
        <thead>
          <tr>
            <th scope="col">Edition</th>
            <th scope="col">Date</th>
            <th scope="col">Participants</th>
            <th scope="col">Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>{p.date}</td>
              <td>{fmt(p.added)}+</td>
              <td>{fmt(p.total)}+</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

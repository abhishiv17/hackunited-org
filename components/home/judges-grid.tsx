import { judgeOrgs } from "./data";

/** Logo wall: each organisation on its own card that pops up under the pointer. */
export default function JudgesGrid() {
  return (
    <div className="hu-judges">
      {judgeOrgs.map((org, i) => (
        <div key={org.alt} className={`hu-judge nb nb-hover${i % 2 ? " nb-alt" : ""}`} data-drop>
          <span className="hu-judge-index hu-mono">{String(i + 1).padStart(2, "0")}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={org.src}
            alt={org.alt}
            loading="lazy"
            className={org.alt === "Y Combinator" ? "hu-judge-logo" : "hu-judge-logo hu-logo"}
          />
          <span className="hu-judge-name hu-mono">{org.alt}</span>
        </div>
      ))}
    </div>
  );
}

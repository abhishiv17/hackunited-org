"use client";

import DraggableMarquee from "@/components/obsidian/draggable-marquee";

const front = ["Free hackathons", "Workshops", "Soft skills", "Real projects", "501(c)(3) nonprofit"];
const back = ["25,000+ engineers impacted", "3,000+ community members", "50+ countries reached"];

function Phrase({ text }: { text: string }) {
  return (
    <span className="hu-ribbon-phrase">
      {text}
      <span className="hu-ribbon-star" aria-hidden="true">
        ✦
      </span>
    </span>
  );
}

/**
 * Two crossing tape ribbons. Both drift on their own, speed up while the
 * page scrolls, and can be grabbed and flung.
 */
export default function Ribbons() {
  return (
    <div className="hu-ribbons" aria-label="Hack United at a glance">
      <div className="hu-ribbon hu-ribbon-back">
        <DraggableMarquee
          items={back}
          getKey={(t) => t}
          renderItem={(t) => <Phrase text={t} />}
          speed={0.5}
          reverse
          label="Hack United figures. Drag to scroll."
        />
      </div>
      <div className="hu-ribbon hu-ribbon-front">
        <DraggableMarquee
          items={front}
          getKey={(t) => t}
          renderItem={(t) => <Phrase text={t} />}
          speed={0.8}
          label="What Hack United runs. Drag to scroll."
        />
      </div>
    </div>
  );
}

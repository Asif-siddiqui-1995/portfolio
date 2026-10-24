import {Fragment, memo} from "react";
import "./SoftwareSection.css";

const SOFTWARE = [
    {name: "Photoshop", short: "Ps", type: "Adobe Photoshop", color: "#31A8FF"},
    {
        name: "Illustrator",
        short: "Ai",
        type: "Adobe Illustrator",
        color: "#FF9A00",
    },
    {
        name: "After Effects",
        short: "Ae",
        type: "Motion Design",
        color: "#9999FF",
    },
    {
        name: "Premiere Pro",
        short: "Pr",
        type: "Video Editing",
        color: "#9999FF",
    },
    {name: "CorelDRAW", short: "CD", type: "Graphic Design", color: "#00A859"},
    {name: "Figma", short: "Fg", type: "UI / UX Design", color: "#F24E1E"},
    {
        name: "InDesign",
        short: "Id",
        type: "Layout & Publishing",
        color: "#FF3366",
    },
    {name: "Adobe XD", short: "Xd", type: "UI / UX Design", color: "#FF61F6"},
];

const FOOTER_LABELS = ["DESIGN", "DEVELOPMENT", "3D & MOTION"];

// The list is static, so build the index label and style objects once
// at load time instead of on every render.
const CARDS = SOFTWARE.map((item, index) => ({
    ...item,
    label: String(index + 1).padStart(2, "0"),
    style: {
        "--software-color": item.color,
        "--delay": `${index * 70}ms`,
    },
}));

function SoftwareCard({card}) {
    return (
        <div className="software-item" style={card.style}>
            <div className="software-box">
                <div className="software-top" aria-hidden="true" />
                <div className="software-side" aria-hidden="true" />

                <div className="software-front">
                    <span className="software-index" aria-hidden="true">
                        {card.label}
                    </span>

                    {/* The name below already labels the tool, so hide the abbreviation. */}
                    <div className="software-logo" aria-hidden="true">
                        {card.short}
                    </div>

                    <div className="software-info">
                        <h3>{card.name}</h3>
                        <span>{card.type}</span>
                    </div>

                    <span className="software-arrow" aria-hidden="true">
                        ↗
                    </span>
                </div>
            </div>
        </div>
    );
}

// memo: this section has no props or state, so it never needs to
// re-render when a parent (e.g. the intro's `ready` flag) updates.
function SoftwareSection() {
    return (
        <section className="software-section" id="services">
            <div className="software-heading">
                <span className="software-eyebrow">
                    <span className="software-dot" aria-hidden="true" />
                    MY CREATIVE TOOLKIT
                </span>

                <h2>
                    TOOLS OF
                    <br />
                    <span>IMAGINATION.</span>
                </h2>

                <p>
                    From pixels to motion, from ideas to immersive worlds. These
                    are the tools I use to bring creative visions to life.
                </p>
            </div>

            <div className="software-grid">
                {CARDS.map((card) => (
                    <SoftwareCard key={card.name} card={card} />
                ))}
            </div>

            <div className="software-footer">
                {FOOTER_LABELS.map((label, index) => (
                    <Fragment key={label}>
                        {index > 0 && (
                            <span
                                className="software-footer-line"
                                aria-hidden="true"
                            />
                        )}
                        <span>{label}</span>
                    </Fragment>
                ))}
            </div>
        </section>
    );
}

export default memo(SoftwareSection);

import {memo, useEffect, useRef} from "react";
import "./TechnologySection.css";

const TECHNOLOGIES = [
    {name: "HTML5", short: "5", category: "Markup", color: "#E44D26"},
    {name: "CSS3", short: "CSS", category: "Styling", color: "#1572B6"},
    {
        name: "JavaScript",
        short: "JS",
        category: "Programming",
        color: "#F7DF1E",
    },
    {name: "PHP", short: "PHP", category: "Backend", color: "#777BB4"},
    {name: "React", short: "Re", category: "Frontend", color: "#61DAFB"},
    {name: "MongoDB", short: "M", category: "Database", color: "#47A248"},
    {name: "Express.js", short: "Ex", category: "Backend", color: "#D5D5D5"},
    {name: "Node.js", short: "N", category: "Runtime", color: "#83CD29"},
    {name: "MySQL", short: "SQL", category: "Database", color: "#00758F"},
];

// The list is static, so build labels and style objects once at load time
// instead of on every render.
const CARDS = TECHNOLOGIES.map((tech, index) => ({
    ...tech,
    label: `TECH / ${String(index + 1).padStart(2, "0")}`,
    style: {"--tech-color": tech.color, "--card-index": index},
}));

// Tells the CSS whether the section is on screen, so it can pause its
// animations while off screen (see the rule in the notes).
// Uses a data attribute instead of state, so it never causes a re-render.
function usePauseOffscreen(ref) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (!("IntersectionObserver" in window)) {
            el.dataset.inView = "true";
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                el.dataset.inView = String(entry.isIntersecting);
            },
            {rootMargin: "200px"},
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [ref]);
}

const TechnologyCard = memo(function TechnologyCard({card}) {
    const cardRef = useRef(null);
    const pointer = useRef({x: 0, y: 0});
    const frame = useRef(0);

    // Runs at most once per frame, however fast the mouse reports.
    const applyTilt = () => {
        frame.current = 0;

        const el = cardRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = (pointer.current.x - rect.left) / rect.width;
        const y = (pointer.current.y - rect.top) / rect.height;

        el.style.setProperty("--rotate-x", `${(0.5 - y) * 12}deg`);
        el.style.setProperty("--rotate-y", `${(x - 0.5) * 12}deg`);
        el.style.setProperty("--pointer-x", `${x * 100}%`);
        el.style.setProperty("--pointer-y", `${y * 100}%`);
    };

    const handleMove = (event) => {
        pointer.current.x = event.clientX;
        pointer.current.y = event.clientY;

        if (!frame.current) {
            frame.current = requestAnimationFrame(applyTilt);
        }
    };

    const resetMove = () => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;

        const el = cardRef.current;
        if (!el) return;

        el.style.setProperty("--rotate-x", "0deg");
        el.style.setProperty("--rotate-y", "0deg");
        el.style.setProperty("--pointer-x", "50%");
        el.style.setProperty("--pointer-y", "50%");
    };

    useEffect(() => () => cancelAnimationFrame(frame.current), []);

    return (
        <article
            ref={cardRef}
            className="tech-orbit-card"
            style={card.style}
            onMouseMove={handleMove}
            onMouseLeave={resetMove}
        >
            <div className="tech-card-glow" />
            <div className="tech-card-scan" />

            <span className="tech-card-index">{card.label}</span>

            <div className="tech-orbit">
                <div className="tech-orbit-ring ring-one" />
                <div className="tech-orbit-ring ring-two" />
                <div className="tech-orbit-ring ring-three" />

                <div className="tech-orbit-logo">{card.short}</div>
            </div>

            <div className="tech-card-details">
                <div>
                    <h3>{card.name}</h3>
                    <span>{card.category}</span>
                </div>
                <span className="tech-card-arrow">↗</span>
            </div>

            <div className="tech-card-progress">
                <span />
            </div>
        </article>
    );
});

// memo: no props or state, so a parent update never re-renders this section.
function TechnologySection() {
    const sectionRef = useRef(null);
    usePauseOffscreen(sectionRef);

    return (
        <section
            ref={sectionRef}
            className="technology-section"
            id="technology"
            data-in-view="false"
        >
            <div className="technology-heading">
                <span className="technology-eyebrow">
                    <span className="technology-dot" />
                    THE DEVELOPER TOOLKIT
                </span>

                <h2>
                    CODE.
                    <span> CREATE. CONNECT.</span>
                </h2>

                <p>
                    Technologies that power my ideas, from crafting interfaces
                    to building full-stack digital experiences.
                </p>
            </div>

            <div className="tech-orbit-grid">
                {CARDS.map((card) => (
                    <TechnologyCard key={card.name} card={card} />
                ))}
            </div>

            <div className="tech-section-footer">
                <span>DESIGNED WITH INTENTION</span>
                <span className="tech-footer-line" />
                <span>BUILT FOR THE WEB</span>
            </div>
        </section>
    );
}

export default memo(TechnologySection);

import {lazy, Suspense, useEffect, useState} from "react";
import {ArrowUpRight} from "lucide-react";
import "./Hero.css";

const GhostFibers = lazy(() => import("./GhostFibers"));

const FIBER_PROPS = {
    glowColor: "#ff6a1a",
    lineColor: "#ffd9a8",
    secondaryColor: "#e11d48",
    layers: 3,
    twist: 0.9,
    threads: 72,
    fiberStyle: "dashes",
    depthOfField: 0.85,
    hoverEffect: "focus",
    intro: true,
    mouseInteraction: true,
    rotation: 8,
    speed: 0.7,
    flow: 0.9,
    particles: 0.9,
    sparkle: 1,
};

// Lighter settings for phones and low-core devices.
const LITE_OVERRIDES = {layers: 2, threads: 36, particles: 0.5};

// Returns null until the browser is idle (after first paint), then the
// props to render GhostFibers with.
function useDeferredFiberProps() {
    const [props, setProps] = useState(null);

    useEffect(() => {
        const start = () => {
            const lite =
                window.matchMedia("(max-width: 768px)").matches ||
                (navigator.hardwareConcurrency || 8) <= 4;

            setProps(lite ? {...FIBER_PROPS, ...LITE_OVERRIDES} : FIBER_PROPS);
        };

        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(start, {timeout: 1500});
            return () => window.cancelIdleCallback(id);
        }

        const id = setTimeout(start, 200);
        return () => clearTimeout(id);
    }, []);

    return props;
}

// Stagger order for the entrance animation.
const stagger = (i) => ({"--i": i});

// `ready` becomes true when the intro finishes -> content animates in
export default function Hero({ready = true}) {
    const fiberProps = useDeferredFiberProps();

    return (
        <section className={`hero${ready ? " is-ready" : ""}`} id="home">
            {fiberProps && (
                <Suspense fallback={null}>
                    <GhostFibers {...fiberProps} />
                </Suspense>
            )}
            <div className="hero-scrim" />

            {/* portrait + CSS halo */}
            <div className="hero-visual rv" style={stagger(2)}>
                <div className="portrait-stage">
                    <div className="portrait-glow" />
                    <div className="halo halo-inner" />
                    <div className="halo halo-outer" />

                    {/* Create man-cutout.webp first (see notes), or the
                        webp source below will 404 with no fallback. */}
                    <picture>
                        <source srcSet="/man-cutout.webp" type="image/webp" />
                        <img
                            src="/man-cutout.png"
                            alt="Cinematic portrait of the designer"
                            className="hero-portrait"
                            // width={...} height={...}  <- add the real pixel size
                            // On React 18, use lowercase `fetchpriority`.
                            fetchPriority="high"
                            decoding="async"
                        />
                    </picture>
                </div>

                <div className="portrait-vignette" />

                {/* <div className="vertical-label">
                    VISUAL <span>STORYTELLER</span>
                </div> */}

                {/* <div className="side-caption">
                    <span>01 / 03</span>
                    <p>
                        IMAGINATION
                        <br />
                        MEETS DESIGN
                    </p>
                </div> */}
            </div>

            {/* text */}
            <div className="hero-copy">
                <p className="eyebrow rv" style={stagger(0)}>
                    <span className="status-dot" />
                    HEY, I&apos;M{" "}
                    <span className="orange-text">MOHD ASIF S SIDDIQUI</span>
                </p>

                <h1 className="hero-title rv" style={stagger(1)}>
                    <span className="title-line">I TRANSFORM VISIONS</span>
                    <span className="title-line">
                        INTO <span className="orange-text">REALITY.</span>
                    </span>
                </h1>

                <p className="hero-description rv" style={stagger(2)}>
                    I turn bold ideas into distinctive visual identities and
                    digital experiences. Blending creativity with code, I design
                    brands and software that stand apart.
                </p>

                <div className="hero-actions rv" style={stagger(3)}>
                    <a href="#work" className="button-primary">
                        VIEW WORK <ArrowUpRight size={17} />
                    </a>
                </div>

                <div className="social-links rv" style={stagger(5)}>
                    <a
                        href="https://www.linkedin.com/in/asif-siddiqui-5000a7105/"
                        aria-label="LinkedIn"
                    >
                        in
                    </a>
                    <a
                        href="https://drive.google.com/drive/folders/1CEWvXQ7__4R3wF2AB5-mTX3_AOzT-vth"
                        aria-label="Portfolio"
                    >
                        <img
                            src="/portfolio-icon.svg"
                            alt=""
                            className="portfolio-icon"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
}
